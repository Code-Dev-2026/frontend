import { http, HttpResponse } from 'msw';
import { handlers } from '@camino/contracts/mocks';
import { setupServer } from 'msw/native';

const capacityErrorHandler = http.post('*/api/v1/attendance/boarding', () =>
  HttpResponse.json(
    {
      code: 'CAPACIDAD_AGOTADA',
      message:
        'ABORDAJE DENEGADO: El vehículo ha alcanzado su capacidad nominal estricta (16 pasajeros). Violación de seguridad N+1.',
    },
    { status: 409 },
  ),
);
const server = setupServer(capacityErrorHandler, ...handlers);
let isListening = false;

export function startApiMocks(): () => void {
  if (!isListening) {
    server.listen({ onUnhandledRequest: 'bypass' });
    isListening = true;
  }

  return () => {
    if (isListening) {
      server.close();
      isListening = false;
    }
  };
}
