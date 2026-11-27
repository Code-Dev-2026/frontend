import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';

export type CardState = 'default' | 'focused' | 'disabled' | 'error';

export type CardProps = {
  children: ReactNode;
  state?: CardState;
  padding?: number;
  gap?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

const STATE_STYLES: Record<CardState, ViewStyle> = {
  default: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderWidth: baseTokens.borderWidth.default,
  },
  focused: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.focusRing,
    borderWidth: baseTokens.borderWidth.focus,
  },
  disabled: {
    backgroundColor: baseTokens.colors.disabledBg,
    borderColor: baseTokens.colors.borderSoft,
    borderWidth: baseTokens.borderWidth.default,
  },
  error: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.criticalText,
    borderWidth: baseTokens.borderWidth.default,
  },
};

export function Card({
  children,
  state = 'default',
  padding = baseTokens.spacing.lg,
  gap = baseTokens.spacing.md,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  const effectiveState: CardState = disabled ? 'disabled' : state;
  const layoutStyle: ViewStyle = { gap, padding };

  if (onPress) {
    const isDisabled = disabled || effectiveState === 'disabled';

    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => [
          styles.base,
          styles.interactive,
          STATE_STYLES[effectiveState],
          pressed && !isDisabled && styles.pressed,
          layoutStyle,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[styles.base, STATE_STYLES[effectiveState], layoutStyle, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: baseTokens.radii.card,
    width: '100%',
  },
  interactive: {
    minHeight: baseTokens.sizes.touchMin,
  },
  pressed: {
    backgroundColor: baseTokens.colors.surfaceInput,
  },
});
