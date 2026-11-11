import { configureApiClient } from '@camino/contracts/http';

configureApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '/api/v1',
});

export * from '@camino/contracts/schools';
export * from '@camino/contracts/students';
export * from '@camino/contracts/routes';
export * from '@camino/contracts/trips';
export * from '@camino/contracts/transport-companies';
