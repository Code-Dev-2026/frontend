import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Icon, type IconName } from '../icon/Icon';

export type BannerVariant = 'info' | 'success' | 'warning' | 'critical';

export type BannerProps = {
  title: string;
  message: string;
  variant?: BannerVariant;
  /** Icono opcional; si se omite usa el icono semántico de Figma y `null` lo oculta. */
  icon?: IconName | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type BannerStyleSpec = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  defaultIcon: IconName;
};

const BANNER_SPECS: Record<BannerVariant, BannerStyleSpec> = {
  info: {
    backgroundColor: baseTokens.colors.infoBg,
    borderColor: baseTokens.colors.infoBorder,
    textColor: baseTokens.colors.infoText,
    defaultIcon: 'info',
  },
  success: {
    backgroundColor: baseTokens.colors.successBg,
    borderColor: baseTokens.colors.successBorder,
    textColor: baseTokens.colors.successText,
    defaultIcon: 'circle-check',
  },
  warning: {
    backgroundColor: baseTokens.colors.warningBg,
    borderColor: baseTokens.colors.warningBorder,
    textColor: baseTokens.colors.warningText,
    defaultIcon: 'triangle-alert',
  },
  critical: {
    backgroundColor: baseTokens.colors.criticalBg,
    borderColor: baseTokens.colors.criticalBorder,
    textColor: baseTokens.colors.criticalText,
    defaultIcon: 'triangle-alert',
  },
};

export function Banner({
  title,
  message,
  variant = 'info',
  icon,
  style,
  testID,
}: BannerProps) {
  const spec = BANNER_SPECS[variant];
  const resolvedIcon = icon === undefined ? spec.defaultIcon : icon;
  const isUrgent = variant === 'warning' || variant === 'critical';

  return (
    <View
      accessibilityRole={isUrgent ? 'alert' : 'summary'}
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
      <View style={styles.content}>
        <Text style={[styles.title, { color: spec.textColor }]}>{title}</Text>
        <Text style={[styles.message, { color: spec.textColor }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.md,
    padding: baseTokens.spacing.lg,
    width: '100%',
  },
  content: {
    flex: 1,
    gap: baseTokens.spacing.xs,
  },
  title: {
    ...baseTokens.typography.fieldLabel,
    width: '100%',
  },
  message: {
    ...baseTokens.typography.bodySmall,
    width: '100%',
  },
});
