import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Monitora Camino Seguro',
  slug: 'monitora-camino-seguro',
  scheme: 'monitora',
  version: '0.1.0',
  orientation: 'portrait',
  plugins: [...(config.plugins ?? []), 'expo-font'],
  android: {
    package: 'com.caminoseguro.monitora',
  },
  ios: {
    bundleIdentifier: 'com.caminoseguro.monitora',
  },
  extra: {
    // En el emulador Android el host de la máquina se alcanza con 10.0.2.2.
    // Sobrescribe con EXPO_PUBLIC_* para iOS o un dispositivo físico.
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1',
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://10.0.2.2:3001',
  },
});
