import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LogoTexto from '../../svg/logo-texto.svg';
import { forgotPasswordTokens } from '../../tokens/forgot-password';
import { InteractivePressable } from '../button/InteractivePressable';

export type ForgotPasswordScreenProps = {
  error?: string | null;
  isLoading?: boolean;
  isSuccess?: boolean;
  successMessage?: string | null;
  onSubmit?: (email: string) => void;
  onBackToLogin?: () => void;
};

export function ForgotPasswordScreen({
  error,
  isLoading = false,
  isSuccess = false,
  successMessage,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const hasError = Boolean(error);

  const handleSubmit = () => {
    if (isLoading) return;
    onSubmit?.(email);
  };

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
            width={forgotPasswordTokens.spacing.logoWidth}
            height={forgotPasswordTokens.spacing.logoHeight}
            accessibilityLabel="Camino Seguro"
          />
          <View style={styles.header}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <View style={styles.subtitleContainer}></View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              accessibilityLabel="Correo electrónico"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="correo restablecer contraseña"
              placeholderTextColor={forgotPasswordTokens.colors.placeholder}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              style={[styles.input, hasError && styles.inputError]}
              textContentType="emailAddress"
              value={email}
            />
          </View>

          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {isSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                {successMessage ??
                  'Enlace enviado. Revisa tu bandeja de entrada.'}
              </Text>
            </View>
          ) : null}

          <InteractivePressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
            borderRadius={forgotPasswordTokens.spacing.fieldRadius}
            containerStyle={styles.submitButtonWrap}
            disabled={isLoading}
            onPress={handleSubmit}
            pressFillColor="rgba(255, 255, 255, 0.24)"
            style={styles.submitButton}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator
                  color={forgotPasswordTokens.colors.background}
                  size="small"
                  style={styles.spinner}
                />
                <Text style={styles.submitButtonText}>Enviando enlace…</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                Enviar enlace de recuperación
              </Text>
            )}
          </InteractivePressable>
        </View>

        <View style={styles.options}>
          <InteractivePressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !onBackToLogin }}
            borderRadius={forgotPasswordTokens.spacing.fieldRadius}
            disabled={!onBackToLogin}
            onPress={onBackToLogin}
            pressFillColor="rgba(2, 56, 102, 0.1)"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </InteractivePressable>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footer}>Camino Seguro</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: forgotPasswordTokens.colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: forgotPasswordTokens.spacing.bottom,
    paddingHorizontal: forgotPasswordTokens.spacing.horizontal,
    paddingTop: forgotPasswordTokens.spacing.top,
  },
  access: {
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: forgotPasswordTokens.spacing.titleTop,
    width: '100%',
  },
  title: {
    ...forgotPasswordTokens.typography.title,
    color: forgotPasswordTokens.colors.text,
    textAlign: 'center',
    width: '100%',
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: forgotPasswordTokens.spacing.subtitleTop,
    width: '100%',
  },
  subtitle: {
    ...forgotPasswordTokens.typography.subtitle,
    color: forgotPasswordTokens.colors.subtitle,
    textAlign: 'center',
  },
  form: {
    marginTop: forgotPasswordTokens.spacing.formTop,
    width: '100%',
  },
  fieldGroup: {
    width: '100%',
  },
  label: {
    ...forgotPasswordTokens.typography.label,
    color: forgotPasswordTokens.colors.label,
    marginBottom: forgotPasswordTokens.spacing.labelGap,
  },
  input: {
    ...forgotPasswordTokens.typography.input,
    backgroundColor: forgotPasswordTokens.colors.fieldBackground,
    borderColor: forgotPasswordTokens.colors.fieldBorder,
    borderRadius: forgotPasswordTokens.spacing.fieldRadius,
    borderWidth: 1,
    color: forgotPasswordTokens.colors.text,
    height: forgotPasswordTokens.spacing.fieldHeight,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: forgotPasswordTokens.colors.error,
  },
  errorContainer: {
    backgroundColor: forgotPasswordTokens.colors.errorBackground,
    borderColor: forgotPasswordTokens.colors.errorBorder,
    borderRadius: forgotPasswordTokens.spacing.fieldRadius,
    borderWidth: 1,
    marginTop: forgotPasswordTokens.spacing.statusGap,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    ...forgotPasswordTokens.typography.message,
    color: forgotPasswordTokens.colors.error,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: forgotPasswordTokens.colors.successBackground,
    borderColor: forgotPasswordTokens.colors.successBorder,
    borderRadius: forgotPasswordTokens.spacing.fieldRadius,
    borderWidth: 1,
    marginTop: forgotPasswordTokens.spacing.statusGap,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    ...forgotPasswordTokens.typography.message,
    color: forgotPasswordTokens.colors.success,
    textAlign: 'center',
  },
  submitButtonWrap: {
    marginTop: forgotPasswordTokens.spacing.fieldGap,
    width: '100%',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: forgotPasswordTokens.colors.primary,
    borderRadius: forgotPasswordTokens.spacing.fieldRadius,
    height: forgotPasswordTokens.spacing.touchTarget,
    justifyContent: 'center',
    width: '100%',
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  submitButtonText: {
    ...forgotPasswordTokens.typography.button,
    color: forgotPasswordTokens.colors.background,
    textAlign: 'center',
  },
  options: {
    marginTop: forgotPasswordTokens.spacing.sectionGap,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: forgotPasswordTokens.colors.backButtonBackground,
    borderColor: forgotPasswordTokens.colors.backButtonBorder,
    borderRadius: forgotPasswordTokens.spacing.fieldRadius,
    borderWidth: 1,
    height: forgotPasswordTokens.spacing.touchTarget,
    justifyContent: 'center',
    width: '100%',
  },
  backButtonText: {
    ...forgotPasswordTokens.typography.backButton,
    color: forgotPasswordTokens.colors.backButtonText,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
    width: '100%',
  },
  footer: {
    ...forgotPasswordTokens.typography.footer,
    color: forgotPasswordTokens.colors.footer,
    textAlign: 'center',
  },
});
