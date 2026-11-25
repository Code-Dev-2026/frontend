import { useState } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ForgotPasswordScreen, LoginScreen } from '@camino/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { AcudienteHomeContainer } from './app/screens/AcudienteHomeContainer';
import { ApiProvider } from './src/lib/api/provider';

type AcudienteScreen = 'login' | 'forgot-password' | 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AcudienteScreen>('login');
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
        {currentScreen === 'login' ? (
          <LoginScreen
            onCreateAccount={() =>
              Alert.alert('Crear cuenta', 'El registro aún no está disponible.')
            }
            onForgotPassword={() => setCurrentScreen('forgot-password')}
            onSubmit={() => {
              // PROVISIONAL: navega a la pantalla de inicio mientras se define
              // el contrato oficial de autenticación con el backend.
              setCurrentScreen('home');
            }}
          />
        ) : currentScreen === 'forgot-password' ? (
          <ForgotPasswordScreen
            onBackToLogin={() => setCurrentScreen('login')}
            onSubmit={(email) =>
              Alert.alert(
                'Recuperar contraseña',
                `Se enviará el enlace de recuperación a: ${email}`,
              )
            }
          />
        ) : (
          <AcudienteHomeContainer
            onBackToLogin={() => setCurrentScreen('login')}
          />
        )}
      </ApiProvider>
    </>
  );
}
