import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { BrandLoader } from '../brand-loader/BrandLoader';
import { Button } from '../button/Button';
import { Icon, type IconName } from '../icon/Icon';

export type EmptyStateStatus = 'default' | 'disabled' | 'loading' | 'error';

export type EmptyStateProps = {
  title: string;
  description: string;
  icon?: IconName | null;
  state?: EmptyStateStatus;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function resolveDefaultIcon(state: EmptyStateStatus): IconName {
  switch (state) {
    case 'error':
      return 'wifi-off';
    case 'loading':
      return 'loader-circle';
    default:
      return 'route';
  }
}

export function EmptyState({
  title,
  description,
  icon,
  state = 'default',
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) {
  const isDisabled = state === 'disabled';
  const isLoading = state === 'loading';
  const isError = state === 'error';
  const resolvedIcon = icon === undefined ? resolveDefaultIcon(state) : icon;

  return (
    <View
      accessibilityRole={isError ? 'alert' : undefined}
      testID={testID}
      style={[
        styles.container,
        isDisabled && styles.containerDisabled,
        isError && styles.containerError,
        style,
      ]}
    >
      {isLoading && icon === undefined ? (
        <BrandLoader
          accessibilityLabel={title}
          cycleDurationMs={1800}
          size={44}
        />
      ) : resolvedIcon ? (
        <Icon
          name={resolvedIcon}
          size={baseTokens.sizes.iconDefault}
          color={baseTokens.colors.textStrong}
        />
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text
        style={[styles.description, isDisabled && styles.descriptionDisabled]}
      >
        {description}
      </Text>

      {actionLabel ? (
        <Button
          disabled={isDisabled}
          error={isError}
          errorLabel={isError ? actionLabel : undefined}
          label={actionLabel}
          loading={isLoading}
          onPress={onAction}
          testID={testID ? `${testID}-action` : undefined}
          variant="primary"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    gap: baseTokens.spacing.lg,
    padding: baseTokens.spacing.xl,
    width: '100%',
  },
  containerDisabled: {
    backgroundColor: baseTokens.colors.disabledBg,
  },
  containerError: {
    borderColor: baseTokens.colors.criticalText,
  },
  title: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
    width: '100%',
  },
  description: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textMuted,
    width: '100%',
  },
  descriptionDisabled: {
    color: baseTokens.colors.textBody,
  },
});
