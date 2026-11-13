import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Acudiente Camino Seguro',
  slug: 'acudiente-camino-seguro',
  scheme: 'acudiente',
  version: '0.1.0',
  orientation: 'portrait',
  android: {
    package: 'com.caminoseguro.acudiente',
  },
  ios: {
    bundleIdentifier: 'com.caminoseguro.acudiente',
  },
  extra: {
    // En el emulador Android el host de la máquina se alcanza con 10.0.2.2.
    // Sobrescribe con EXPO_PUBLIC_* para iOS o un dispositivo físico.
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1',
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://10.0.2.2:3001',
  },
});
