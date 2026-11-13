import { configureApiClient } from '@camino/contracts/http';

configureApiClient({
  // 10.0.2.2 es el host de la máquina visto desde el emulador Android.
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1',
});

export * from '@camino/contracts/attendance';
export * from '@camino/contracts/custody';
export * from '@camino/contracts/offline';
export * from '@camino/contracts/trips';
export * from '@camino/contracts/routes';
