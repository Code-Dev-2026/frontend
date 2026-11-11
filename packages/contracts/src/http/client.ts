import { ApiError, createApiError } from './errors';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_PATH_PATTERN = /\/auth\/(?:login|mfa\/verify|refresh)$/;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const DEFAULT_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 2_000;

export interface ApiClientConfig {
  baseUrl?: string;
  fetcher?: typeof fetch;
  maxRetries?: number;
  sleep?: (milliseconds: number) => Promise<void>;
  idempotencyKeyFactory?: () => string;
}

interface RuntimeConfig {
  baseUrl: string;
  fetcher: typeof fetch;
  maxRetries: number;
  sleep: (milliseconds: number) => Promise<void>;
  idempotencyKeyFactory: () => string;
}

function defaultIdempotencyKey(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Este entorno no soporta la generación segura de UUID.');
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  const byte6 = bytes[6];
  const byte8 = bytes[8];
  if (byte6 === undefined || byte8 === undefined) {
    throw new Error('No fue posible generar la clave de idempotencia.');
  }
  bytes[6] = (byte6 & 0x0f) | 0x40;
  bytes[8] = (byte8 & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10).join(''),
  ].join('-');
}

function environmentBaseUrl(): string {
  if (typeof process === 'undefined') return '/api/v1';
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    '/api/v1'
  );
}

function defaultRuntimeConfig(): RuntimeConfig {
  return {
    baseUrl: environmentBaseUrl(),
    fetcher: globalThis.fetch.bind(globalThis),
    maxRetries: DEFAULT_RETRIES,
    sleep: (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    idempotencyKeyFactory: defaultIdempotencyKey,
  };
}

let runtimeConfig = defaultRuntimeConfig();

export function configureApiClient(config: ApiClientConfig): void {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
    baseUrl: config.baseUrl ?? runtimeConfig.baseUrl,
    maxRetries: Math.max(0, config.maxRetries ?? runtimeConfig.maxRetries),
  };
}

export function resetApiClient(): void {
  runtimeConfig = defaultRuntimeConfig();
}

function resolveUrl(path: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  if (/^https?:\/\//i.test(baseUrl)) {
    const base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    const request = path.replace(/^\/+/, '');
    if (request.startsWith(base.pathname.replace(/^\/|\/$/g, '') + '/')) {
      return new URL(`/${request}`, base.origin).toString();
    }
    return new URL(request, base).toString();
  }

  const normalizedBase = `/${baseUrl.replace(/^\/+|\/+$/g, '')}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const basePath = normalizedBase.replace(/\/$/, '');
  if (
    normalizedPath === basePath.slice(1) ||
    normalizedPath.startsWith(`${basePath.slice(1)}/`)
  ) {
    return `/${normalizedPath}`;
  }
  return `${normalizedBase}${normalizedPath}`;
}

function hasHeader(headers: Headers, name: string): boolean {
  return headers.has(name);
}

function retryAfterMilliseconds(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds)
    ? seconds * 1_000
    : Date.parse(value) - Date.now();
  if (!Number.isFinite(delay) || delay < 0) return undefined;
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

function backoffMilliseconds(attempt: number): number {
  return Math.min(250 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

function isRetryableMethod(method: string, headers: Headers): boolean {
  if (!MUTATING_METHODS.has(method)) return true;
  return Boolean(headers.get('X-Idempotency-Key')?.trim());
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;

  try {
    return await response.json();
  } catch (cause) {
    throw new ApiError(
      response.status,
      'UNKNOWN',
      'El servidor devolvió una respuesta inválida.',
      response.headers.get('x-correlation-id') ?? undefined,
      { cause },
    );
  }
}

export async function orvalFetcher<T>(
  path: string,
  requestOptions: RequestInit = {},
): Promise<T> {
  const method = (requestOptions.method ?? 'GET').toUpperCase();
  const headers = new Headers(requestOptions.headers);
  headers.set('Accept', 'application/json');
  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = resolveUrl(path, runtimeConfig.baseUrl);
  const isAuthOperation = AUTH_PATH_PATTERN.test(
    new URL(url, 'http://local').pathname,
  );
  if (
    MUTATING_METHODS.has(method) &&
    !isAuthOperation &&
    !hasHeader(headers, 'X-Idempotency-Key')
  ) {
    const key = runtimeConfig.idempotencyKeyFactory();
    if (!key.trim()) {
      throw new Error('La clave de idempotencia no puede estar vacía.');
    }
    headers.set('X-Idempotency-Key', key);
  }

  const canRetry = isRetryableMethod(method, headers) && !isAuthOperation;
  const options: RequestInit = {
    ...requestOptions,
    method,
    headers,
    credentials: 'include',
  };

  for (let attempt = 0; ; attempt += 1) {
    let response: Response;
    try {
      response = await runtimeConfig.fetcher(url, options);
    } catch (cause) {
      if (isAbortError(cause)) throw cause;
      if (canRetry && attempt < runtimeConfig.maxRetries) {
        await runtimeConfig.sleep(backoffMilliseconds(attempt));
        continue;
      }
      throw new ApiError(
        0,
        'UNKNOWN',
        'No fue posible conectar con el servidor.',
        undefined,
        { cause },
      );
    }

    if (
      canRetry &&
      RETRYABLE_STATUSES.has(response.status) &&
      attempt < runtimeConfig.maxRetries
    ) {
      await runtimeConfig.sleep(
        retryAfterMilliseconds(response.headers.get('retry-after')) ??
          backoffMilliseconds(attempt),
      );
      continue;
    }

    const payload = await readJson(response);
    if (!response.ok) {
      throw createApiError(response.status, payload);
    }

    return {
      data: payload,
      status: response.status,
      headers: response.headers,
    } as T;
  }
}
