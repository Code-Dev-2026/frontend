import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Acudiente Camino Seguro',
  slug: 'acudiente-camino-seguro',
  scheme: 'acudiente',
  version: '0.1.0',
  orientation: 'portrait',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3001'
  }
});
