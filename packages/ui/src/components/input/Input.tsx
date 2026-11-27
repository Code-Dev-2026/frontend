import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputFocusEventData,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Icon } from '../icon/Icon';

export type InputPlatform = 'standard' | 'monitor';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
  platform?: InputPlatform;
  showPasswordToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Input({
  label,
  helperText,
  error,
  disabled = false,
  platform = 'standard',
  showPasswordToggle = false,
  secureTextEntry = false,
  editable,
  onFocus,
  onBlur,
  accessibilityLabel,
  containerStyle,
  inputStyle,
  testID,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isDisabled = disabled || editable === false;
  const hasError = Boolean(error);
  const fieldHeight =
    platform === 'monitor'
      ? baseTokens.sizes.inputMonitorHeight
      : baseTokens.sizes.inputStandardHeight;
  const shouldMask = secureTextEntry && !isPasswordVisible;

  function handleFocus(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setIsFocused(false);
    onBlur?.(event);
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.touchTarget}>
        <View
          style={[
            styles.surface,
            { height: fieldHeight },
            showPasswordToggle && styles.surfaceWithTrailing,
            isDisabled && styles.surfaceDisabled,
            isFocused && !hasError && !isDisabled && styles.surfaceFocused,
            hasError && styles.surfaceError,
          ]}
        >
          <TextInput
            {...rest}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{ disabled: isDisabled }}
            editable={!isDisabled}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholderTextColor={
              isDisabled
                ? baseTokens.colors.disabledText
                : baseTokens.colors.textMuted
            }
            secureTextEntry={shouldMask}
            style={[
              styles.input,
              isDisabled && styles.inputDisabled,
              inputStyle,
            ]}
            testID={testID}
          />
          {showPasswordToggle ? (
            <Pressable
              accessibilityLabel={
                isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
              accessibilityRole="button"
              accessibilityState={{
                disabled: isDisabled,
                selected: isPasswordVisible,
              }}
              disabled={isDisabled}
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              style={styles.trailingButton}
              testID={testID ? `${testID}-toggle-password` : undefined}
            >
              <Icon
                name="eye"
                size={baseTokens.sizes.iconDefault}
                color={
                  isDisabled
                    ? baseTokens.colors.disabledText
                    : baseTokens.colors.textMuted
                }
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {hasError ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, isDisabled && styles.helperDisabled]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: baseTokens.spacing.sm,
    width: '100%',
  },
  label: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.textBody,
    width: '100%',
  },
  touchTarget: {
    justifyContent: 'center',
    minHeight: baseTokens.sizes.touchMin,
    width: '100%',
  },
  surface: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surfaceInput,
    borderColor: baseTokens.colors.borderStrong,
    borderRadius: baseTokens.radii.input,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    paddingHorizontal: baseTokens.spacing.lg,
    width: '100%',
  },
  surfaceWithTrailing: {
    paddingRight: baseTokens.spacing.none,
  },
  surfaceFocused: {
    borderColor: baseTokens.colors.focusRing,
    borderWidth: baseTokens.borderWidth.focus,
  },
  surfaceError: {
    borderColor: baseTokens.colors.criticalText,
    borderWidth: baseTokens.borderWidth.error,
  },
  surfaceDisabled: {
    backgroundColor: baseTokens.colors.disabledBg,
  },
  input: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textStrong,
    flex: 1,
    paddingVertical: baseTokens.spacing.none,
    textAlignVertical: 'center',
  },
  inputDisabled: {
    color: baseTokens.colors.disabledText,
  },
  trailingButton: {
    alignItems: 'center',
    height: baseTokens.sizes.touchMin,
    justifyContent: 'center',
    width: baseTokens.sizes.touchMin,
  },
  helperText: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    width: '100%',
  },
  helperDisabled: {
    color: baseTokens.colors.textBody,
  },
  errorText: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.criticalText,
    width: '100%',
  },
});
