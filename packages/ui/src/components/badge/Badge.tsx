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
  iconColor: string;
  textColor: string;
  defaultIcon: IconName;
};

const BADGE_SPECS: Record<BadgeVariant, BadgeStyleSpec> = {
  info: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.textStrong,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'bus-front',
  },
  neutral: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.textBody,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'house',
  },
  outlined: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderStrong,
    iconColor: baseTokens.colors.textBody,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'user-round',
  },
  success: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.successText,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'shield-check',
  },
  warning: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.warningText,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'school',
  },
  critical: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.criticalSolid,
    textColor: baseTokens.colors.textStrong,
    defaultIcon: 'triangle-alert',
  },
  institutional: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    iconColor: baseTokens.colors.textStrong,
    textColor: baseTokens.colors.textStrong,
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
          color={spec.iconColor}
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
