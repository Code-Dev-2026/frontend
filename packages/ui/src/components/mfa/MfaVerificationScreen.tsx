import { useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LogotipoSinTexto from '../../svg/logotipo-sin-texto.svg';
import { baseTokens } from '../../tokens/base';
import { Button } from '../button/Button';
import { InteractivePressable } from '../button/InteractivePressable';
import { Icon } from '../icon/Icon';

const OTP_LENGTH = 6;

export type MfaVerificationScreenProps = {
  /** Correo enmascarado al que se envió el código OTP (ej. "ac***@caminoseguro.co"). */
  maskedDestination?: string;
  /** Etiqueta informativa de vigencia (ej. "Válido por 5 minutos"). */
  expiresLabel?: string;
  error?: string | null;
  errorNode?: ReactNode;
  isLoading?: boolean;
  onVerify?: (code: string) => void;
  onResendCode?: () => void;
  onBackToLogin?: () => void;
  testID?: string;
};

export function MfaVerificationScreen({
  maskedDestination = 'tu correo registrado',
  expiresLabel = 'Código de 6 dígitos · Válido por 5 minutos',
  error,
  errorNode,
  isLoading = false,
  onVerify,
  onResendCode,
  onBackToLogin,
  testID,
}: MfaVerificationScreenProps) {
  const [code, setCode] = useState('');
  const [resentNotice, setResentNotice] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const hasError = Boolean(error || errorNode);
  const isComplete = code.length === OTP_LENGTH;

  function handleChangeCode(raw: string) {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digitsOnly);
    if (resentNotice) setResentNotice(false);
  }

  function handleSubmit() {
    if (isLoading) return;
    onVerify?.(code);
  }

  function handleResend() {
    setResentNotice(true);
    onResendCode?.();
  }

  return (
    <SafeAreaView style={styles.screen} testID={testID}>
      <View style={styles.topBar}>
        {onBackToLogin ? (
          <InteractivePressable
            accessibilityLabel="Volver al inicio de sesión"
            accessibilityRole="button"
            borderRadius={baseTokens.radii.pill}
            onPress={onBackToLogin}
            pressFillColor="rgba(2, 56, 102, 0.1)"
            style={styles.backButton}
          >
            <Icon
              color={baseTokens.colors.textStrong}
              name="chevron-left"
              size={baseTokens.sizes.iconDefault}
            />
          </InteractivePressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}

        <LogotipoSinTexto
          accessibilityLabel="Camino Seguro"
          height={28}
          width={24}
        />

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <View style={styles.iconCircle}>
            <Icon
              color={baseTokens.colors.link600}
              name="lock-keyhole"
              size={baseTokens.sizes.iconDefault}
            />
          </View>
          <Text style={styles.title}>Verificación en dos pasos</Text>
          <Text style={styles.subtitle}>
            Ingresa el código enviado a {maskedDestination}.
          </Text>
          <Text style={styles.caption}>{expiresLabel}</Text>
        </View>

        <Pressable
          accessibilityLabel="Código de verificación de 6 dígitos"
          onPress={() => inputRef.current?.focus()}
          style={styles.otpWrapper}
        >
          <View pointerEvents="none" style={styles.otpRow}>
            {Array.from({ length: OTP_LENGTH }, (_, index) => {
              const digit = code[index] ?? '';
              const isCurrent =
                index === code.length ||
                (code.length === OTP_LENGTH && index === OTP_LENGTH - 1);

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isCurrent && styles.otpBoxActive,
                    hasError && styles.otpBoxError,
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </View>

          <TextInput
            ref={inputRef}
            accessibilityLabel="Código de verificación de 6 dígitos"
            autoComplete="one-time-code"
            caretHidden
            editable={!isLoading}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onChangeText={handleChangeCode}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            style={styles.hiddenInput}
            testID={testID ? `${testID}-input` : undefined}
            textContentType="oneTimeCode"
            value={code}
          />
        </Pressable>

        {hasError ? (
          <View accessibilityRole="alert" style={styles.feedbackCard}>
            <Icon
              color={baseTokens.colors.criticalSolid}
              name="triangle-alert"
              size={20}
            />
            <View style={styles.feedbackBody}>
              {errorNode ? (
                errorNode
              ) : (
                <Text style={styles.feedbackText}>{error}</Text>
              )}
            </View>
          </View>
        ) : resentNotice ? (
          <View accessibilityRole="summary" style={styles.feedbackCard}>
            <Icon
              color={baseTokens.colors.successText}
              name="circle-check"
              size={20}
            />
            <Text style={styles.feedbackText}>
              Se envió un nuevo código de verificación.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            disabled={!isComplete && !onVerify}
            label="Verificar código"
            loading={isLoading}
            loadingLabel="Verificando…"
            onPress={handleSubmit}
            testID={testID ? `${testID}-submit` : undefined}
            variant="primary"
          />

          {onResendCode ? (
            <Button
              disabled={isLoading}
              label="Reenviar código"
              onPress={handleResend}
              variant="tertiary"
            />
          ) : null}

          {onBackToLogin ? (
            <Button
              disabled={isLoading}
              label="Volver al inicio de sesión"
              onPress={onBackToLogin}
              variant="soft"
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const androidTopOffset =
  Platform.OS === 'android'
    ? Math.max(StatusBar.currentHeight ?? 0, baseTokens.spacing.sm)
    : 0;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: baseTokens.colors.borderSoft,
    borderBottomWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: baseTokens.spacing.sm,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    height: baseTokens.sizes.touchMin,
    justifyContent: 'center',
    width: baseTokens.sizes.touchMin,
  },
  headerSpacer: {
    width: baseTokens.sizes.touchMin,
  },
  content: {
    flexGrow: 1,
    gap: baseTokens.spacing.xl,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.xxl,
  },
  headerBlock: {
    alignItems: 'center',
    gap: baseTokens.spacing.sm,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.pill,
    borderWidth: baseTokens.borderWidth.default,
    height: 52,
    justifyContent: 'center',
    marginBottom: baseTokens.spacing.xs,
    width: 52,
  },
  title: {
    ...baseTokens.typography.screenTitle,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  subtitle: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textBody,
    textAlign: 'center',
  },
  caption: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
  otpWrapper: {
    position: 'relative',
    width: '100%',
  },
  otpRow: {
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBox: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderStrong,
    borderRadius: baseTokens.radii.input,
    borderWidth: baseTokens.borderWidth.default,
    flex: 1,
    height: 54,
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: baseTokens.colors.focusRing,
    borderWidth: baseTokens.borderWidth.focus,
  },
  otpBoxError: {
    borderColor: baseTokens.colors.borderStrong,
    borderWidth: baseTokens.borderWidth.focus,
  },
  otpDigit: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  hiddenInput: {
    height: 54,
    opacity: 0.01,
    position: 'absolute',
    width: '100%',
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.md,
    padding: baseTokens.spacing.lg,
    width: '100%',
  },
  feedbackBody: {
    flex: 1,
  },
  feedbackText: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textStrong,
    flex: 1,
  },
  actions: {
    gap: baseTokens.spacing.md,
    marginTop: 'auto',
    width: '100%',
  },
});
