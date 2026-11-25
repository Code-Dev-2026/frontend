import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Icon, type IconName } from '../icon/Icon';

export type BadgeVariant =
  | 'info'
  | 'neutral'
  | 'outlined'
  | 'success'
  | 'warning'
  | 'critical'
  | 'institutional';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  /** Icono opcional; si se omite usa el icono semántico por defecto y `null` lo oculta. */
  icon?: IconName | null;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

type BadgeStyleSpec = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  defaultIcon: IconName;
};

const BADGE_SPECS: Record<BadgeVariant, BadgeStyleSpec> = {
  info: {
    backgroundColor: baseTokens.colors.infoBg,
    borderColor: baseTokens.colors.infoBg,
    textColor: baseTokens.colors.navy900,
    defaultIcon: 'bus-front',
  },
  neutral: {
    backgroundColor: baseTokens.colors.surfaceInput,
    borderColor: baseTokens.colors.surfaceInput,
    textColor: baseTokens.colors.textBody,
    defaultIcon: 'house',
  },
  outlined: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderStrong,
    textColor: baseTokens.colors.textBody,
    defaultIcon: 'user-round',
  },
  success: {
    backgroundColor: baseTokens.colors.successBg,
    borderColor: baseTokens.colors.successBorder,
    textColor: baseTokens.colors.successText,
    defaultIcon: 'shield-check',
  },
  warning: {
    backgroundColor: baseTokens.colors.warningBg,
    borderColor: baseTokens.colors.warningBg,
    textColor: baseTokens.colors.warningText,
    defaultIcon: 'school',
  },
  critical: {
    backgroundColor: baseTokens.colors.criticalBg,
    borderColor: baseTokens.colors.criticalBorder,
    textColor: baseTokens.colors.criticalText,
    defaultIcon: 'triangle-alert',
  },
  institutional: {
    backgroundColor: baseTokens.colors.navy900,
    borderColor: baseTokens.colors.navy900,
    textColor: baseTokens.colors.surface,
    defaultIcon: 'school',
  },
};

export function Badge({
  label,
  variant = 'neutral',
  icon,
  style,
  accessibilityLabel,
  testID,
}: BadgeProps) {
  const spec = BADGE_SPECS[variant];
  const resolvedIcon = icon === undefined ? spec.defaultIcon : icon;

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="text"
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: spec.backgroundColor,
          borderColor: spec.borderColor,
        },
        style,
      ]}
    >
      {resolvedIcon ? (
        <Icon
          name={resolvedIcon}
          size={baseTokens.sizes.iconDefault}
          color={spec.textColor}
        />
      ) : null}
      <Text style={[styles.label, { color: spec.textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: baseTokens.radii.chip,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    padding: baseTokens.spacing.sm,
    width: '100%',
  },
  label: {
    ...baseTokens.typography.bodySmall,
    flex: 1,
  },
});
