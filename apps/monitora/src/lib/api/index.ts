import { configureApiClient } from '@camino/contracts/http';

configureApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
});

export * from '@camino/contracts/attendance';
export * from '@camino/contracts/custody';
export * from '@camino/contracts/offline';
export * from '@camino/contracts/trips';
export * from '@camino/contracts/routes';
