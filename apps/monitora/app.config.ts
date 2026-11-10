import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Monitora Camino Seguro',
  slug: 'monitora-camino-seguro',
  scheme: 'monitora',
  version: '0.1.0',
  orientation: 'portrait',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
  },
});
