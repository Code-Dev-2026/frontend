import { handlers } from '@camino/contracts/mocks';
import { setupServer } from 'msw/native';

const server = setupServer(...handlers);
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
