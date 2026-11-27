import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Banner,
  Button,
  Icon,
  InteractivePressable,
  Modal,
  baseTokens,
} from '@camino/ui';
import type { MonitoraProfileData } from '../../src/features/profile/monitora-session';
import { MonitoraAppBar } from './MonitoraAppBar';

export type MonitoraProfileScreenProps = {
  profile: MonitoraProfileData;
  pendingSyncCount: number;
  lastSyncLabel: string;
  logoutModalVisible: boolean;
  isSyncing: boolean;
  isLoggingOut: boolean;
  onBack: () => void;
  onOpenActiveRoute: () => void;
  onRequestLogout: () => void;
  onCancelLogout: () => void;
  onSyncAndStay: () => void;
  onConfirmLogout: () => void;
};

export function MonitoraProfileScreen({
  profile,
  pendingSyncCount,
  lastSyncLabel,
  logoutModalVisible,
  isSyncing,
  isLoggingOut,
  onBack,
  onOpenActiveRoute,
  onRequestLogout,
  onCancelLogout,
  onSyncAndStay,
  onConfirmLogout,
}: MonitoraProfileScreenProps) {
  const hasPending = pendingSyncCount > 0;
  const pendingSummary = `${pendingSyncCount} ${pendingSyncCount === 1 ? 'pendiente' : 'pendientes'} · ${lastSyncLabel}`;

  return (
    <View style={styles.screen} testID="monitora-profile-screen">
      <MonitoraAppBar onBack={onBack} testID="monitora-profile-appbar" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Datos de la monitora */}
        <View style={styles.identityCard} testID="monitora-identity-card">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <View style={styles.identityBody}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={styles.fullName}>
                {profile.fullName}
              </Text>
              {profile.verified ? (
                <Icon
                  accessibilityLabel="Cuenta verificada"
                  color={baseTokens.colors.successText}
                  name="shield-check"
                  size={16}
                  testID="monitora-verified-icon"
                />
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.email}>
              {profile.email}
            </Text>
          </View>
        </View>

        {/* Asignación actual (solo lectura, sin edición ni datos de pago) */}
        <View style={styles.sectionCard} testID="monitora-assignment-card">
          <Text style={styles.cardHeading}>Asignación actual</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ruta asignada</Text>
            <Text style={styles.infoValue}>{profile.routeAssignmentLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehículo</Text>
            <Text style={styles.infoValue}>{profile.vehicleLabel}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sede escolar</Text>
            <Text style={styles.infoValue}>{profile.campusLabel}</Text>
          </View>
        </View>

        {/* Estado cola offline (tocar sincroniza cuando existen registros pendientes) */}
        <InteractivePressable
          accessibilityLabel={
            hasPending
              ? `Cola sin conexión: Pendiente de envío, ${pendingSummary}. Toca para sincronizar`
              : `Cola sin conexión: Sincronizado, ${pendingSummary}`
          }
          accessibilityRole="button"
          borderRadius={baseTokens.radii.card}
          disabled={!hasPending || isSyncing}
          onPress={onSyncAndStay}
          pressFillColor="rgba(2, 56, 102, 0.08)"
          pressedScale={0.985}
          style={styles.offlineCard}
          testID="monitora-offline-queue-card"
        >
          <View style={styles.offlineHeader}>
            <Text style={styles.cardHeading}>Cola sin conexión</Text>
            <View style={styles.syncBadge}>
              <Icon
                color={
                  hasPending
                    ? baseTokens.colors.warningText
                    : baseTokens.colors.successText
                }
                name={hasPending ? 'triangle-alert' : 'circle-check'}
                size={12}
              />
              <Text
                style={[
                  styles.syncBadgeText,
                  hasPending
                    ? styles.syncBadgeWarningText
                    : styles.syncBadgeSuccessText,
                ]}
              >
                {hasPending ? 'Pendiente de envío' : 'Sincronizado'}
              </Text>
            </View>
          </View>
          <Text style={styles.offlineSubtitle}>{pendingSummary}</Text>
        </InteractivePressable>
      </ScrollView>

      {/* Acciones inferiores (ambos botones en azul primario según Figma) */}
      <View style={styles.bottomActions}>
        <Button
          label="Ir a ruta activa"
          onPress={onOpenActiveRoute}
          testID="monitora-profile-go-route"
          variant="primary"
        />
        <Button
          label="Cerrar sesión"
          onPress={onRequestLogout}
          testID="monitora-profile-logout"
          variant="primary"
        />
      </View>

      {/* Modales de confirmación de cierre de sesión (normal y con pendientes offline) */}
      {hasPending ? (
        <Modal
          icon={null}
          onDismiss={onCancelLogout}
          primaryAction={{
            label: 'Volver y sincronizar',
            loading: isSyncing,
            onPress: onSyncAndStay,
            variant: 'primary',
          }}
          secondaryAction={{
            disabled: isLoggingOut,
            label: 'Cerrar sesión de todas formas',
            onPress: onConfirmLogout,
            variant: 'primary',
          }}
          testID="monitora-logout-pending-modal"
          title="Tienes registros sin enviar"
          visible={logoutModalVisible}
        >
          <Banner
            message="Sincroniza antes de salir para evitar retrasos."
            title={`${pendingSyncCount} ${pendingSyncCount === 1 ? 'registro pendiente' : 'registros pendientes'}`}
            variant="warning"
          />
        </Modal>
      ) : (
        <Modal
          icon={null}
          message="Tus registros están sincronizados."
          onDismiss={onCancelLogout}
          primaryAction={{
            label: 'Sí, cerrar sesión',
            loading: isLoggingOut,
            onPress: onConfirmLogout,
            variant: 'primary',
          }}
          secondaryAction={{
            disabled: isLoggingOut,
            label: 'Seguir en Camino Seguro',
            onPress: onCancelLogout,
            variant: 'soft',
          }}
          testID="monitora-logout-modal"
          title="¿Cerrar sesión?"
          visible={logoutModalVisible}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: baseTokens.spacing.md,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingTop: baseTokens.spacing.lg,
  },
  identityCard: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.md,
    padding: 14,
    width: '100%',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.disabledBg,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.pill,
    borderWidth: baseTokens.borderWidth.default,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    ...baseTokens.typography.button,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  identityBody: {
    flex: 1,
    gap: baseTokens.spacing.xs,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  fullName: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
    flexShrink: 1,
  },
  email: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
  sectionCard: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    gap: 10,
    padding: 14,
    width: '100%',
  },
  cardHeading: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.textStrong,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  infoLabel: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    flex: 1,
  },
  infoValue: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.textBody,
    textAlign: 'right',
  },
  offlineCard: {
    backgroundColor: baseTokens.colors.surfaceInput,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    gap: baseTokens.spacing.sm,
    padding: 14,
    width: '100%',
  },
  offlineHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  syncBadge: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.pill,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.xs,
    paddingHorizontal: baseTokens.spacing.sm,
    paddingVertical: 3,
  },
  syncBadgeText: {
    ...baseTokens.typography.caption,
  },
  syncBadgeSuccessText: {
    color: baseTokens.colors.successText,
  },
  syncBadgeWarningText: {
    color: baseTokens.colors.warningText,
  },
  offlineSubtitle: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
  bottomActions: {
    backgroundColor: baseTokens.colors.surface,
    gap: baseTokens.spacing.sm,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.sm,
    width: '100%',
  },
});
