import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { attendanceControllerRegisterBoarding } from '../src/generated/endpoints/attendance/attendance';
import { authControllerLogin } from '../src/generated/endpoints/auth/auth';
import { custodyControllerVerifyReceptor } from '../src/generated/endpoints/custody/custody';
import { schoolsControllerGetSanBenito } from '../src/generated/endpoints/schools/schools';
import { handlers } from '../src/generated/mocks';
import { configureApiClient, resetApiClient, orvalFetcher } from '../src/http';
import { ApiError } from '../src/http/errors';

const server = setupServer(...handlers);

function configureTestClient(): void {
  configureApiClient({
    baseUrl: 'https://contracts.test/api/v1',
    fetcher: globalThis.fetch,
    maxRetries: 1,
    sleep: async () => {},
    idempotencyKeyFactory: () => 'test-idempotency-key',
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetApiClient();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('OpenAPI client', () => {
  it('uses the cookie transport on a generated backend operation', async () => {
    configureTestClient();
    let credentials: RequestCredentials | undefined;
    server.use(
      http.get('*/api/v1/schools/san-benito', ({ request }) => {
        credentials = request.credentials;
        return HttpResponse.json({ nombre: 'Colegio de prueba' });
      }),
    );

    const response = await schoolsControllerGetSanBenito();

    expect(credentials).toBe('include');
    expect(response.status).toBe(200);
  });

  it('reuses an idempotency key when retrying a generated mutation', async () => {
    configureTestClient();
    const receivedKeys: Array<string | null> = [];
    let attempts = 0;
    server.use(
      http.post('*/api/v1/attendance/boarding', ({ request }) => {
        attempts += 1;
        receivedKeys.push(request.headers.get('X-Idempotency-Key'));
        if (attempts === 1) {
          return new HttpResponse(null, {
            status: 503,
            headers: { 'Retry-After': '0' },
          });
        }
        return HttpResponse.json({ accepted: true });
      }),
    );

    const response = await attendanceControllerRegisterBoarding({
      body: JSON.stringify({ documento_personal: 'sensitive-test-value' }),
    });

    expect(response.status).toBe(200);
    expect(attempts).toBe(2);
    expect(receivedKeys).toEqual([
      'test-idempotency-key',
      'test-idempotency-key',
    ]);
  });

  it('maps the backend capacity denial to its official typed message', async () => {
    configureTestClient();
    server.use(
      http.post('*/api/v1/attendance/boarding', () =>
        HttpResponse.json(
          {
            statusCode: 409,
            message:
              'ABORDAJE DENEGADO: El vehículo ha alcanzado su capacidad nominal estricta (16 pasajeros). Violación de seguridad N+1.',
            correlationId: 'request-123',
          },
          { status: 409 },
        ),
      ),
    );

    await expect(attendanceControllerRegisterBoarding()).rejects.toMatchObject({
      code: 'CAPACIDAD_AGOTADA',
      message:
        'ABORDAJE DENEGADO: El vehículo ha alcanzado su capacidad nominal estricta (16 pasajeros). Violación de seguridad N+1.',
      correlationId: 'request-123',
    } satisfies Partial<ApiError>);
  });

  it('maps legal custody denials to the shared catalog without leaking the body', async () => {
    configureTestClient();
    const personalData = 'private-recipient-document';
    const logs = [
      vi.spyOn(console, 'log'),
      vi.spyOn(console, 'info'),
      vi.spyOn(console, 'warn'),
      vi.spyOn(console, 'error'),
      vi.spyOn(console, 'debug'),
    ];
    server.use(
      http.post('*/api/v1/custody/verify-receptor', () =>
        HttpResponse.json(
          {
            statusCode: 403,
            message:
              'ALERTA JUDICIAL ACTIVA: Prohibida entrega del menor a esta persona bajo orden judicial cautelar.',
            personalData,
          },
          { status: 403 },
        ),
      ),
    );

    let thrown: unknown;
    try {
      await custodyControllerVerifyReceptor({
        body: JSON.stringify({ documento_receptor: personalData }),
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect(thrown).toMatchObject({
      code: 'RESTRICCION_CUSTODIA',
      message:
        'ALERTA JUDICIAL ACTIVA: Prohibida entrega del menor a esta persona bajo orden judicial cautelar.',
    });
    expect(thrown instanceof Error ? thrown.message : '').not.toContain(
      personalData,
    );
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });

  it('does not retry credential submission', async () => {
    configureTestClient();
    let attempts = 0;
    server.use(
      http.post('*/api/v1/auth/login', () => {
        attempts += 1;
        return new HttpResponse(null, { status: 503 });
      }),
    );

    await expect(
      authControllerLogin({
        email: 'person@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(attempts).toBe(1);
  });

  it('preserves cancellation instead of retrying an aborted request', async () => {
    let attempts = 0;
    configureApiClient({
      baseUrl: 'https://contracts.test/api/v1',
      fetcher: async () => {
        attempts += 1;
        throw new DOMException('Request aborted', 'AbortError');
      },
      maxRetries: 2,
      sleep: async () => {},
    });

    await expect(
      orvalFetcher('/api/v1/schools/san-benito'),
    ).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(attempts).toBe(1);
  });
});
