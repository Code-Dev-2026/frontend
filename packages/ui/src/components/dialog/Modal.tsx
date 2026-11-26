import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Button, type ButtonVariant } from '../button/Button';
import { Icon, type IconName } from '../icon/Icon';

export type ModalTone = 'default' | 'critical';

export type ModalAction = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
};

export type ModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  /** Nota destacada (por ejemplo: "El menor permanece bajo custodia."). */
  note?: string;
  tone?: ModalTone;
  /** Si es `true` (por defecto en `tone="critical"`), impide cerrar tocando el fondo o botón atrás. */
  blocking?: boolean;
  icon?: IconName | null;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  onDismiss?: () => void;
  children?: ReactNode;
  testID?: string;
};

export type DialogProps = ModalProps;

export function Modal({
  visible,
  title,
  message,
  note,
  tone = 'default',
  blocking,
  icon,
  primaryAction,
  secondaryAction,
  onDismiss,
  children,
  testID,
}: ModalProps) {
  const isCritical = tone === 'critical';
  const isBlocking = blocking ?? isCritical;
  const resolvedIcon =
    icon === undefined ? (isCritical ? 'triangle-alert' : 'info') : icon;
  const foregroundColor = baseTokens.colors.textStrong;
  const bodyColor = baseTokens.colors.textBody;
  const iconColor = isCritical
    ? baseTokens.colors.criticalSolid
    : baseTokens.colors.link600;

  function handleDismiss() {
    if (!isBlocking) {
      onDismiss?.();
    }
  }

  return (
    <RNModal
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityElementsHidden={isBlocking}
          accessible={!isBlocking}
          accessibilityLabel={isBlocking ? undefined : 'Cerrar diálogo'}
          accessibilityRole={isBlocking ? undefined : 'button'}
          disabled={isBlocking}
          onPress={handleDismiss}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityRole="alert"
          accessibilityViewIsModal
          testID={testID}
          style={[styles.dialog, isCritical && styles.dialogCritical]}
        >
          {resolvedIcon ? (
            <Icon
              name={resolvedIcon}
              size={baseTokens.sizes.iconDefault}
              color={iconColor}
            />
          ) : null}

          <Text style={[styles.title, { color: foregroundColor }]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, { color: bodyColor }]}>
              {message}
            </Text>
          ) : null}

          {note ? (
            <Text style={[styles.note, { color: foregroundColor }]}>
              {note}
            </Text>
          ) : null}

          {children}

          {primaryAction || secondaryAction ? (
            <View style={styles.actions}>
              {primaryAction ? (
                <Button
                  disabled={primaryAction.disabled}
                  error={primaryAction.error}
                  label={primaryAction.label}
                  loading={primaryAction.loading}
                  onPress={primaryAction.onPress}
                  testID={testID ? `${testID}-primary-action` : undefined}
                  variant={
                    primaryAction.variant ??
                    (isCritical ? 'critical' : 'primary')
                  }
                />
              ) : null}

              {secondaryAction ? (
                <Button
                  disabled={secondaryAction.disabled}
                  label={secondaryAction.label}
                  onPress={secondaryAction.onPress}
                  testID={testID ? `${testID}-secondary-action` : undefined}
                  variant={secondaryAction.variant ?? 'tertiary'}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </RNModal>
  );
}

export const Dialog = Modal;

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.backdrop,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: baseTokens.spacing.pageMargin,
  },
  dialog: {
    ...baseTokens.elevation.overlay,
    alignItems: 'flex-start',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.modal,
    borderWidth: baseTokens.borderWidth.default,
    gap: baseTokens.spacing.lg,
    maxWidth: baseTokens.sizes.contentWidth,
    padding: baseTokens.spacing.xl,
    width: '100%',
  },
  dialogCritical: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderStrong,
  },
  title: {
    ...baseTokens.typography.screenTitle,
    width: '100%',
  },
  message: {
    ...baseTokens.typography.body,
    width: '100%',
  },
  note: {
    ...baseTokens.typography.fieldLabel,
    width: '100%',
  },
  actions: {
    gap: baseTokens.spacing.sm,
    width: '100%',
  },
});
