import { configureApiClient } from '@camino/contracts/http';
import { createUuidV7 } from '@camino/domain';

export function configureMobileApiClient(): void {
  configureApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1',
    idempotencyKeyFactory: createUuidV7,
  });
}

export * from '@camino/contracts/tracking';
export * from '@camino/contracts/notifications';
export * from '@camino/contracts/students';
