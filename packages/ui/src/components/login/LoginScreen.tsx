import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LogoTexto from '../../svg/logo-texto.svg';
import { baseTokens } from '../../tokens/base';
import { loginTokens } from '../../tokens/login';
import { InteractivePressable } from '../button/InteractivePressable';
import { Icon } from '../icon/Icon';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginScreenProps = {
  error?: string | null;
  errorNode?: ReactNode;
  isLoading?: boolean;
  onSubmit?: (credentials: LoginCredentials) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
};

export function LoginScreen({
  error,
  errorNode,
  isLoading = false,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const hasError = Boolean(error || errorNode);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.access}>
        <View style={styles.brand}>
          <LogoTexto
            width={loginTokens.spacing.logoWidth}
            height={loginTokens.spacing.logoHeight}
            accessibilityLabel="Camino Seguro"
          />
          <Text style={styles.title}>Iniciar sesión</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.fieldGroup, styles.firstFieldGroup]}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              accessibilityLabel="Correo electrónico"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Ingresa tu correo"
              placeholderTextColor={loginTokens.colors.placeholder}
              returnKeyType="next"
              style={[styles.input, hasError && styles.inputError]}
              textContentType="emailAddress"
              value={email}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              accessibilityLabel="Contraseña"
              autoCapitalize="none"
              autoComplete="current-password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                if (!isLoading) onSubmit?.({ email, password });
              }}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={loginTokens.colors.placeholder}
              returnKeyType="done"
              secureTextEntry
              style={[styles.input, hasError && styles.inputError]}
              textContentType="password"
              value={password}
            />
          </View>

          <InteractivePressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !onForgotPassword }}
            borderRadius={baseTokens.radii.control}
            disabled={!onForgotPassword}
            onPress={onForgotPassword}
            pressFillColor="rgba(37, 99, 235, 0.08)"
            style={styles.forgotTarget}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </InteractivePressable>

          {hasError ? (
            <View accessibilityRole="alert" style={styles.errorBox}>
              <Icon
                color={baseTokens.colors.criticalSolid}
                name="triangle-alert"
                size={18}
              />
              <View style={styles.errorContent}>
                {errorNode ? (
                  errorNode
                ) : (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            </View>
          ) : null}

          <InteractivePressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !onSubmit || isLoading }}
            borderRadius={loginTokens.spacing.fieldRadius}
            containerStyle={
              hasError ? styles.loginButtonAfterError : styles.loginButtonWrap
            }
            disabled={!onSubmit || isLoading}
            onPress={() => onSubmit?.({ email, password })}
            pressFillColor="rgba(255, 255, 255, 0.24)"
            style={styles.loginButton}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <View style={styles.spinner}>
                  <ActivityIndicator
                    color={loginTokens.colors.background}
                    size="small"
                  />
                </View>
                <Text style={styles.loginButtonText}>Iniciando sesión…</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            )}
          </InteractivePressable>

          <View style={styles.accountOptions}>
            <View style={styles.divider} />
            <InteractivePressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !onCreateAccount }}
              borderRadius={loginTokens.spacing.fieldRadius}
              disabled={!onCreateAccount}
              onPress={onCreateAccount}
              pressFillColor="rgba(2, 56, 102, 0.1)"
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Crear cuenta nueva</Text>
            </InteractivePressable>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>Tu tranquilidad empieza aquí</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: loginTokens.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: loginTokens.spacing.horizontal,
    paddingTop: loginTokens.spacing.top,
  },
  access: {
    width: '100%',
  },
  brand: {
    alignItems: 'center',
  },
  title: {
    ...loginTokens.typography.title,
    color: loginTokens.colors.text,
    marginTop: loginTokens.spacing.titleTop,
    textAlign: 'center',
  },
  form: {
    marginTop: loginTokens.spacing.formTop,
  },
  fieldGroup: {
    marginBottom: 0,
  },
  firstFieldGroup: {
    marginBottom: loginTokens.spacing.fieldGap,
  },
  label: {
    ...loginTokens.typography.label,
    color: loginTokens.colors.fieldText,
    marginBottom: loginTokens.spacing.labelGap,
  },
  input: {
    ...loginTokens.typography.input,
    backgroundColor: loginTokens.colors.fieldBackground,
    borderColor: loginTokens.colors.fieldBorder,
    borderRadius: loginTokens.spacing.fieldRadius,
    borderWidth: 1,
    color: loginTokens.colors.text,
    height: loginTokens.spacing.fieldHeight,
    paddingHorizontal: 15,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  inputError: {
    borderColor: baseTokens.colors.borderStrong,
    borderWidth: baseTokens.borderWidth.focus,
  },
  forgotTarget: {
    alignItems: 'flex-end',
    height: loginTokens.spacing.touchTarget,
    justifyContent: 'center',
  },
  forgotText: {
    ...loginTokens.typography.action,
    color: loginTokens.colors.link,
    textAlign: 'right',
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.input,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    marginTop: 4,
    paddingHorizontal: baseTokens.spacing.md,
    paddingVertical: baseTokens.spacing.sm,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    ...loginTokens.typography.error,
    color: baseTokens.colors.textStrong,
  },
  loginButtonWrap: {
    marginTop: 1,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: loginTokens.colors.primary,
    borderRadius: loginTokens.spacing.fieldRadius,
    height: loginTokens.spacing.touchTarget,
    justifyContent: 'center',
  },
  loginButtonAfterError: {
    marginTop: loginTokens.spacing.errorGap,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  spinner: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  loginButtonText: {
    ...loginTokens.typography.button,
    color: loginTokens.colors.background,
    marginLeft: 12,
  },
  accountOptions: {
    marginTop: loginTokens.spacing.sectionGap,
  },
  divider: {
    backgroundColor: loginTokens.colors.divider,
    height: 1,
    marginBottom: 16,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: loginTokens.colors.accountBackground,
    borderColor: loginTokens.colors.accountBorder,
    borderRadius: loginTokens.spacing.fieldRadius,
    borderWidth: 1,
    height: loginTokens.spacing.touchTarget,
    justifyContent: 'center',
  },
  createButtonText: {
    ...loginTokens.typography.button,
    color: loginTokens.colors.accountText,
  },
  footer: {
    ...loginTokens.typography.footer,
    color: loginTokens.colors.placeholder,
    marginTop: 'auto',
    paddingBottom: loginTokens.spacing.footerBottom,
    textAlign: 'center',
  },
});
