import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { LoginScreen } from '@camino/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { ApiProvider } from './src/lib/api/provider';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <ApiProvider>
        <LoginScreen
          onCreateAccount={() =>
            Alert.alert('Crear cuenta', 'El registro aún no está disponible.')
          }
          onForgotPassword={() =>
            Alert.alert(
              'Recuperar contraseña',
              'La recuperación aún no está disponible.',
            )
          }
          onSubmit={() =>
            Alert.alert(
              'Inicio de sesión',
              'La autenticación aún no está conectada.',
            )
          }
        />
      </ApiProvider>
    </>
  );
}
