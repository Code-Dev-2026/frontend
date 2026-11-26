import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Icon, type IconName } from '../icon/Icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'tertiary'
  | 'link'
  | 'critical'
  | 'destructive';

type CanonicalButtonVariant = 'primary' | 'soft' | 'tertiary' | 'destructive';

export type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  error?: boolean;
  errorLabel?: string;
  focused?: boolean;
  leadingIcon?: IconName;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

const VARIANT_MAP: Record<ButtonVariant, CanonicalButtonVariant> = {
  primary: 'primary',
  secondary: 'soft',
  soft: 'soft',
  tertiary: 'tertiary',
  link: 'tertiary',
  critical: 'destructive',
  destructive: 'destructive',
};

type VariantPalette = {
  background: string;
  pressedBackground: string;
  borderColor?: string;
  textColor: string;
  pressedTextColor: string;
  disabledBorderColor?: string;
};

const VARIANT_PALETTES: Record<CanonicalButtonVariant, VariantPalette> = {
  primary: {
    background: baseTokens.colors.actionPrimary,
    pressedBackground: baseTokens.colors.actionPrimaryPressed,
    textColor: baseTokens.colors.surface,
    pressedTextColor: baseTokens.colors.surface,
  },
  soft: {
    background: baseTokens.colors.surface,
    pressedBackground: baseTokens.colors.disabledBg,
    borderColor: baseTokens.colors.borderSoft,
    textColor: baseTokens.colors.textStrong,
    pressedTextColor: baseTokens.colors.textStrong,
    disabledBorderColor: baseTokens.colors.borderSoft,
  },
  tertiary: {
    background: baseTokens.colors.surface,
    pressedBackground: baseTokens.colors.disabledBg,
    textColor: baseTokens.colors.link600,
    pressedTextColor: baseTokens.colors.link600,
  },
  destructive: {
    background: baseTokens.colors.surface,
    pressedBackground: baseTokens.colors.disabledBg,
    borderColor: baseTokens.colors.borderStrong,
    textColor: baseTokens.colors.textStrong,
    pressedTextColor: baseTokens.colors.textStrong,
    disabledBorderColor: baseTokens.colors.borderSoft,
  },
};

export function Button({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  loadingLabel = 'Procesando…',
  error = false,
  errorLabel,
  focused = false,
  leadingIcon,
  fullWidth = true,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const canonical = VARIANT_MAP[variant];
  const palette = VARIANT_PALETTES[canonical];
  const isDisabled = disabled || loading || !onPress;
  const isVisuallyDisabled = disabled;
  const isTertiary = canonical === 'tertiary';

  const displayLabel = loading
    ? loadingLabel
    : error && errorLabel
      ? errorLabel
      : label;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => {
        const activePressed = pressed && !isDisabled && !error;

        const containerColors: ViewStyle = isVisuallyDisabled
          ? {
              backgroundColor: baseTokens.colors.disabledBg,
              ...(palette.disabledBorderColor
                ? {
                    borderColor: palette.disabledBorderColor,
                    borderWidth: baseTokens.borderWidth.default,
                  }
                : {}),
            }
          : {
              backgroundColor: activePressed
                ? palette.pressedBackground
                : palette.background,
              ...(palette.borderColor
                ? {
                    borderColor: palette.borderColor,
                    borderWidth: baseTokens.borderWidth.default,
                  }
                : {}),
            };

        const stateBorder: ViewStyle | undefined = error
          ? {
              borderColor: baseTokens.colors.criticalText,
              borderWidth: baseTokens.borderWidth.error,
            }
          : focused && !isVisuallyDisabled
            ? {
                borderColor: baseTokens.colors.navy900,
                borderWidth: baseTokens.borderWidth.focus,
              }
            : undefined;

        return [
          styles.base,
          fullWidth && styles.fullWidth,
          containerColors,
          stateBorder,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const activePressed = pressed && !isDisabled && !error;
        const foregroundColor = isVisuallyDisabled
          ? baseTokens.colors.disabledText
          : activePressed
            ? palette.pressedTextColor
            : palette.textColor;

        return (
          <>
            {loading ? (
              <ActivityIndicator
                color={foregroundColor}
                size="small"
                testID={testID ? `${testID}-spinner` : undefined}
              />
            ) : error ? (
              <Icon
                name="triangle-alert"
                size={baseTokens.sizes.iconDefault}
                color={
                  canonical === 'primary'
                    ? foregroundColor
                    : baseTokens.colors.criticalSolid
                }
              />
            ) : leadingIcon ? (
              <Icon
                name={leadingIcon}
                size={baseTokens.sizes.iconDefault}
                color={foregroundColor}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                isTertiary ? styles.tertiaryText : styles.buttonText,
                { color: foregroundColor },
              ]}
            >
              {displayLabel}
            </Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: baseTokens.radii.control,
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    justifyContent: 'center',
    minHeight: baseTokens.sizes.touchMin,
    minWidth: baseTokens.sizes.touchMin,
    paddingHorizontal: baseTokens.spacing.md,
    paddingVertical: baseTokens.spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    ...baseTokens.typography.button,
    textAlign: 'center',
  },
  tertiaryText: {
    ...baseTokens.typography.fieldLabel,
    textAlign: 'center',
  },
});
