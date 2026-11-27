import { useMemo, useState } from 'react';
import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import type { StudentRole } from '@camino/domain';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  BrandLoader,
  ForgotPasswordScreen,
  InteractivePressable,
  LoginScreen,
  MfaVerificationScreen,
  RoleBlockedScreen,
  ScreenLoadingProvider,
  SplashScreen,
  SwipeBackView,
  UiCatalogScreen,
  baseTokens,
  useScreenLoading,
  type LoginCredentials,
} from '@camino/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AcudienteHomeContainer } from './app/screens/AcudienteHomeContainer';
import { ApiErrorMessage } from './src/components/ApiErrorMessage';
import {
  createProvisionalAuthGateway,
  maskEmailForChallenge,
  validateEmailAddress,
  validateLoginCredentials,
} from './src/features/auth/access-flow';
import { ApiProvider } from './src/lib/api/provider';

type AcudienteScreen =
  | 'splash'
  | 'login'
  | 'forgot-password'
  | 'mfa'
  | 'role-blocked'
  | 'home'
  | 'ui-catalog';

const INITIAL_SCREEN: AcudienteScreen =
  __DEV__ && process.env.EXPO_PUBLIC_SHOW_UI_CATALOG === 'true'
    ? 'ui-catalog'
    : 'splash';

function AcudienteAppContent() {
  const authGateway = useMemo(
    () => createProvisionalAuthGateway('ACUDIENTE'),
    [],
  );
  const { runWithLoading, transitionScreen } = useScreenLoading();

  const [currentScreen, setCurrentScreen] =
    useState<AcudienteScreen>(INITIAL_SCREEN);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginValidationError, setLoginValidationError] = useState<
    string | null
  >(null);
  const [loginApiError, setLoginApiError] = useState<unknown>(null);

  const [mfaDestination, setMfaDestination] = useState('tu correo registrado');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaApiError, setMfaApiError] = useState<unknown>(null);
  const [blockedRole, setBlockedRole] = useState<StudentRole | undefined>(
    undefined,
  );

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<
    string | null
  >(null);

  function resetAuthErrors() {
    setLoginValidationError(null);
    setLoginApiError(null);
    setMfaApiError(null);
    setBlockedRole(undefined);
    setForgotError(null);
    setForgotSuccess(false);
    setForgotSuccessMessage(null);
  }

  function goToScreen(nextScreen: AcudienteScreen, label?: string) {
    transitionScreen(
      () => {
        setCurrentScreen(nextScreen);
      },
      { label },
    );
  }

  async function handleLoginSubmit(credentials: LoginCredentials) {
    setLoginValidationError(null);
    setLoginApiError(null);

    const validation = validateLoginCredentials(credentials);
    if (!validation.valid) {
      setLoginValidationError(validation.message);
      return;
    }

    setLoginLoading(true);
    try {
      await runWithLoading(
        async () => {
          const result = await authGateway.submitLogin(credentials);
          if (result.status === 'error') {
            setLoginApiError(result.error);
            return;
          }
          if (result.status === 'role_blocked') {
            setBlockedRole(result.detectedRole);
            setCurrentScreen('role-blocked');
            return;
          }
          setMfaDestination(result.maskedDestination);
          setMfaApiError(null);
          setCurrentScreen('mfa');
        },
        { label: 'Verificando acceso…', minDurationMs: 650 },
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleVerifyOtp(code: string) {
    setMfaApiError(null);
    setMfaLoading(true);
    try {
      await runWithLoading(
        async () => {
          const result = await authGateway.verifyOtp(code);
          if (result.status === 'error') {
            setMfaApiError(result.error);
            return;
          }
          setCurrentScreen('home');
        },
        { label: 'Validando código…', minDurationMs: 650 },
      );
    } finally {
      setMfaLoading(false);
    }
  }

  async function handleForgotSubmit(email: string) {
    setForgotError(null);
    setForgotSuccess(false);
    const validation = validateEmailAddress(email);
    if (!validation.valid) {
      setForgotError(validation.message);
      return;
    }
    setForgotLoading(true);
    try {
      await runWithLoading(
        async () => {
          // PROVISIONAL: confirmación visual hasta integrar endpoint de recuperación.
          setForgotSuccess(true);
          setForgotSuccessMessage(
            `Si el correo ${maskEmailForChallenge(validation.normalizedEmail)} está registrado, recibirás instrucciones.`,
          );
        },
        { label: 'Enviando instrucciones…', minDurationMs: 550 },
      );
    } finally {
      setForgotLoading(false);
    }
  }

  if (currentScreen === 'splash') {
    return (
      <SplashScreen
        appLabel="App Acudiente"
        onFinish={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'ui-catalog') {
    return (
      <SwipeBackView enabled onBack={() => goToScreen('login')}>
        <UiCatalogScreen onBack={() => goToScreen('login')} />
      </SwipeBackView>
    );
  }

  if (currentScreen === 'login') {
    return (
      <View style={styles.container}>
        <LoginScreen
          error={loginValidationError}
          errorNode={
            loginApiError ? (
              <ApiErrorMessage error={loginApiError} />
            ) : undefined
          }
          isLoading={loginLoading}
          onCreateAccount={() =>
            Alert.alert(
              'Crear cuenta',
              'El registro de cuentas lo gestiona el colegio.',
            )
          }
          onForgotPassword={() => {
            resetAuthErrors();
            goToScreen('forgot-password');
          }}
          onSubmit={(credentials) => {
            void handleLoginSubmit(credentials);
          }}
        />
        {__DEV__ ? (
          <InteractivePressable
            accessibilityLabel="Abrir catálogo UI de desarrollo"
            accessibilityRole="button"
            borderRadius={0}
            onPress={() => goToScreen('ui-catalog', 'Cargando catálogo…')}
            pressFillColor="rgba(2, 56, 102, 0.1)"
            pressedScale={0.99}
            style={styles.devCatalogButton}
          >
            <Text style={styles.devCatalogLabel}>Catálogo UI (DEV)</Text>
          </InteractivePressable>
        ) : null}
      </View>
    );
  }

  if (currentScreen === 'forgot-password') {
    const backToLogin = () => {
      resetAuthErrors();
      goToScreen('login');
    };
    return (
      <SwipeBackView enabled onBack={backToLogin}>
        <ForgotPasswordScreen
          error={forgotError}
          isLoading={forgotLoading}
          isSuccess={forgotSuccess}
          onBackToLogin={backToLogin}
          onSubmit={(email) => {
            void handleForgotSubmit(email);
          }}
          successMessage={forgotSuccessMessage}
        />
      </SwipeBackView>
    );
  }

  if (currentScreen === 'mfa') {
    const backToLogin = () => {
      resetAuthErrors();
      goToScreen('login');
    };
    return (
      <SwipeBackView enabled onBack={backToLogin}>
        <MfaVerificationScreen
          errorNode={
            mfaApiError ? <ApiErrorMessage error={mfaApiError} /> : undefined
          }
          isLoading={mfaLoading}
          maskedDestination={mfaDestination}
          onBackToLogin={backToLogin}
          onResendCode={() => {
            setMfaApiError(null);
          }}
          onVerify={(code) => {
            void handleVerifyOtp(code);
          }}
        />
      </SwipeBackView>
    );
  }

  if (currentScreen === 'role-blocked') {
    const backToLogin = () => {
      resetAuthErrors();
      goToScreen('login');
    };
    return (
      <SwipeBackView enabled onBack={backToLogin}>
        <RoleBlockedScreen
          detectedRole={blockedRole}
          expectedRole="ACUDIENTE"
          message={API_ERROR_MESSAGES.role_not_allowed}
          onBackToLogin={backToLogin}
        />
      </SwipeBackView>
    );
  }

  return (
    <AcudienteHomeContainer
      onBackToLogin={() => {
        resetAuthErrors();
        goToScreen('login', 'Cerrando sesión…');
      }}
    />
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) {
    return <BrandLoader cycleDurationMs={1800} fullScreen size={52} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <ScreenLoadingProvider>
        <ApiProvider>
          <AcudienteAppContent />
        </ApiProvider>
      </ScreenLoadingProvider>
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
