import { useState } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { LoginScreen, UiCatalogScreen, baseTokens } from '@camino/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiProvider } from './src/lib/api/provider';

type MonitoraScreen = 'login' | 'ui-catalog';

const INITIAL_SCREEN: MonitoraScreen =
  __DEV__ && process.env.EXPO_PUBLIC_SHOW_UI_CATALOG === 'true'
    ? 'ui-catalog'
    : 'login';

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<MonitoraScreen>(INITIAL_SCREEN);
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
        {currentScreen === 'ui-catalog' ? (
          <UiCatalogScreen onBack={() => setCurrentScreen('login')} />
        ) : (
          <View style={styles.container}>
            <LoginScreen
              onCreateAccount={() =>
                Alert.alert(
                  'Crear cuenta',
                  'El registro aún no está disponible.',
                )
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
            {__DEV__ ? (
              <Pressable
                accessibilityLabel="Abrir catálogo UI de desarrollo"
                accessibilityRole="button"
                onPress={() => setCurrentScreen('ui-catalog')}
                style={styles.devCatalogButton}
              >
                <Text style={styles.devCatalogLabel}>Catálogo UI (DEV)</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ApiProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  devCatalogButton: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.infoBg,
    borderColor: baseTokens.colors.infoBorder,
    borderTopWidth: baseTokens.borderWidth.default,
    justifyContent: 'center',
    minHeight: baseTokens.sizes.touchMin,
    paddingHorizontal: baseTokens.spacing.lg,
  },
  devCatalogLabel: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.infoText,
  },
});
