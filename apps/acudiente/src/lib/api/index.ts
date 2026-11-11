import { configureApiClient } from '@camino/contracts/http';

configureApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
});

export * from '@camino/contracts/tracking';
export * from '@camino/contracts/notifications';
export * from '@camino/contracts/students';
