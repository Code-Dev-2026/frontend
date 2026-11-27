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
  iconColor: string;
  titleColor: string;
  messageColor: string;
  defaultIcon: IconName;
};

const BANNER_SPECS: Record<BannerVariant, BannerStyleSpec> = {
  info: {
    backgroundColor: baseTokens.colors.infoBg,
    borderColor: baseTokens.colors.infoBorder,
    iconColor: baseTokens.colors.link600,
    titleColor: baseTokens.colors.textStrong,
    messageColor: baseTokens.colors.textBody,
    defaultIcon: 'info',
  },
  success: {
    backgroundColor: baseTokens.colors.successBg,
    borderColor: baseTokens.colors.successBorder,
    iconColor: baseTokens.colors.successText,
    titleColor: baseTokens.colors.textStrong,
    messageColor: baseTokens.colors.textBody,
    defaultIcon: 'circle-check',
  },
  warning: {
    backgroundColor: baseTokens.colors.warningBg,
    borderColor: baseTokens.colors.warningBorder,
    iconColor: baseTokens.colors.warningText,
    titleColor: baseTokens.colors.textStrong,
    messageColor: baseTokens.colors.textBody,
    defaultIcon: 'triangle-alert',
  },
  critical: {
    backgroundColor: baseTokens.colors.criticalBg,
    borderColor: baseTokens.colors.criticalBorder,
    iconColor: baseTokens.colors.criticalSolid,
    titleColor: baseTokens.colors.textStrong,
    messageColor: baseTokens.colors.textBody,
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
          color={spec.iconColor}
        />
      ) : null}
      <View style={styles.content}>
        <Text style={[styles.title, { color: spec.titleColor }]}>{title}</Text>
        <Text style={[styles.message, { color: spec.messageColor }]}>
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
