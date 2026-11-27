import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Banner,
  Button,
  EmptyState,
  Icon,
  InteractivePressable,
  baseTokens,
} from '@camino/ui';
import type {
  MonitoraHomeStatus,
  MonitoraProfileData,
  MonitoraShiftSummary,
} from '../../src/features/profile/monitora-session';
import { MonitoraAppBar } from './MonitoraAppBar';

export type MonitoraHomeScreenProps = {
  profile: MonitoraProfileData;
  shift: MonitoraShiftSummary | null;
  status: MonitoraHomeStatus;
  pendingSyncCount: number;
  isRefreshing: boolean;
  onOpenActiveRoute: () => void;
  onOpenProfile: () => void;
  onCheckConnectivity: () => void;
  onRefreshShift: () => void;
  onPressNotifications: () => void;
};

function SkeletonPulseCard({ tallHeader }: { tallHeader: boolean }) {
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      <View
        style={[
          styles.skeletonBar,
          tallHeader ? styles.skeletonHeaderTall : styles.skeletonHeaderShort,
        ]}
      />
      <View style={[styles.skeletonBar, styles.skeletonLineFull]} />
      <View style={[styles.skeletonBar, styles.skeletonLineFull]} />
    </Animated.View>
  );
}

export function MonitoraHomeScreen({
  profile,
  shift,
  status,
  pendingSyncCount,
  isRefreshing,
  onOpenActiveRoute,
  onOpenProfile,
  onCheckConnectivity,
  onRefreshShift,
  onPressNotifications,
}: MonitoraHomeScreenProps) {
  const isOffline = status === 'offline';
  const isLoading = status === 'loading';
  const isEmpty = status === 'empty' || (!shift && !isLoading);

  return (
    <View style={styles.screen} testID="monitora-home-screen">
      <MonitoraAppBar
        onPressNotifications={onPressNotifications}
        testID="monitora-home-appbar"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[baseTokens.colors.actionPrimary]}
            onRefresh={onRefreshShift}
            refreshing={isRefreshing}
            tintColor={baseTokens.colors.actionPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Barra de conectividad (cs/Connection indicator) */}
        <InteractivePressable
          accessibilityLabel={
            isOffline
              ? 'Sin señal · datos sin actualizar. Toca para comprobar conexión'
              : 'En línea. Toca para comprobar conexión'
          }
          accessibilityRole="button"
          borderRadius={baseTokens.radii.control}
          onPress={onCheckConnectivity}
          pressFillColor="rgba(2, 56, 102, 0.08)"
          style={styles.connectivityBar}
          testID="monitora-connectivity-bar"
        >
          <Icon
            color={
              isOffline
                ? baseTokens.colors.warningText
                : baseTokens.colors.successText
            }
            name={isOffline ? 'wifi-off' : 'wifi'}
            size={baseTokens.sizes.iconDefault}
          />
          <Text style={styles.connectivityLabel}>
            {isOffline ? 'Sin señal · datos sin actualizar' : 'En línea'}
          </Text>
        </InteractivePressable>

        {/* Saludo monitora */}
        <InteractivePressable
          accessibilityLabel={`Abrir perfil de ${profile.fullName}`}
          accessibilityRole="button"
          borderRadius={baseTokens.radii.control}
          onPress={onOpenProfile}
          pressFillColor="rgba(2, 56, 102, 0.06)"
          style={styles.greetingRow}
          testID="monitora-greeting-row"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <View style={styles.greetingTextGroup}>
            <Text style={styles.greetingTitle}>Hola, {profile.shortName}</Text>
            <Text style={styles.greetingSubtitle}>{profile.shiftLabel}</Text>
          </View>
        </InteractivePressable>

        {/* Banner modo sin conexión (estado sin señal) */}
        {isOffline ? (
          <Banner
            message="Los registros se guardarán en cola local."
            testID="monitora-offline-banner"
            title="Modo sin conexión"
            variant="warning"
          />
        ) : null}

        {/* Cuerpo principal según estado visual dinámico */}
        {isLoading ? (
          <View
            accessibilityLabel="Cargando jornada asignada"
            accessibilityRole="progressbar"
            style={styles.skeletonGroup}
            testID="monitora-home-loading"
          >
            <SkeletonPulseCard tallHeader />
            <SkeletonPulseCard tallHeader />
            <SkeletonPulseCard tallHeader={false} />
          </View>
        ) : isEmpty || !shift ? (
          <EmptyState
            actionLabel="Actualizar"
            description="Sin ruta asignada para esta jornada."
            icon="route"
            onAction={onRefreshShift}
            testID="monitora-home-empty"
            title="Sin recorridos para mostrar"
          />
        ) : (
          <InteractivePressable
            accessibilityLabel={`Abrir ${shift.routeCode} ${shift.busCode}`}
            accessibilityRole="button"
            borderRadius={baseTokens.radii.card}
            onPress={onOpenActiveRoute}
            pressFillColor="rgba(2, 56, 102, 0.06)"
            pressedScale={0.985}
            style={styles.shiftCard}
            testID="monitora-shift-card"
          >
            <View style={styles.shiftHeader}>
              <Icon
                color={baseTokens.colors.navy900}
                name="bus-front"
                size={20}
              />
              <Text numberOfLines={1} style={styles.shiftTitle}>
                {shift.routeCode} · {shift.busCode}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{shift.statusLabel}</Text>
              </View>
            </View>

            <Text style={styles.shiftMeta}>
              {shift.scheduleLabel} · {shift.campusName} · {shift.driverName}
            </Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricStopsValue}>{shift.stopsCount}</Text>
                <Text style={styles.metricLabel}>Paradas</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricOnBoardValue}>
                  {shift.onBoardCount}/{shift.capacity}
                </Text>
                <Text style={styles.metricLabel}>A bordo</Text>
              </View>
              <View style={styles.metricBox}>
                <Text
                  style={[
                    styles.metricPendingValue,
                    pendingSyncCount === 0 && styles.metricPendingZero,
                  ]}
                >
                  {pendingSyncCount}
                </Text>
                <Text style={styles.metricLabel}>Pendientes</Text>
              </View>
            </View>
          </InteractivePressable>
        )}
      </ScrollView>

      {/* Acción inferior a ancho completo (sin botón SOS; oculta en estado vacío) */}
      {!isEmpty ? (
        <View style={styles.bottomActions}>
          <Button
            disabled={isLoading}
            label={isOffline ? 'Continuar ruta' : 'Ver ruta activa'}
            onPress={onOpenActiveRoute}
            testID="monitora-home-primary-cta"
            variant="primary"
          />
        </View>
      ) : null}
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
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.md,
  },
  connectivityBar: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.control,
    borderWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    minHeight: baseTokens.sizes.touchMin,
    padding: baseTokens.spacing.md,
    width: '100%',
  },
  connectivityLabel: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textStrong,
    flex: 1,
  },
  greetingRow: {
    alignItems: 'center',
    borderRadius: baseTokens.radii.control,
    flexDirection: 'row',
    gap: baseTokens.spacing.md,
    minHeight: baseTokens.sizes.touchMin,
    paddingVertical: baseTokens.spacing.xs,
    width: '100%',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.disabledBg,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.pill,
    borderWidth: baseTokens.borderWidth.default,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    ...baseTokens.typography.button,
    color: baseTokens.colors.textStrong,
    textAlign: 'center',
  },
  greetingTextGroup: {
    flex: 1,
    gap: 2,
  },
  greetingTitle: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
  },
  greetingSubtitle: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
  shiftCard: {
    backgroundColor: baseTokens.colors.surface,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.card,
    borderWidth: baseTokens.borderWidth.default,
    gap: baseTokens.spacing.md,
    padding: 14,
    width: '100%',
  },
  shiftHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    width: '100%',
  },
  shiftTitle: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
    flex: 1,
  },
  statusPill: {
    backgroundColor: baseTokens.colors.infoBg,
    borderRadius: baseTokens.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusPillText: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.infoText,
  },
  shiftMeta: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textBody,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
    width: '100%',
  },
  metricBox: {
    alignItems: 'center',
    backgroundColor: baseTokens.colors.surfaceInput,
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.control,
    borderWidth: baseTokens.borderWidth.default,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    paddingHorizontal: baseTokens.spacing.sm,
    paddingVertical: 10,
  },
  metricStopsValue: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
  },
  metricOnBoardValue: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.actionPrimary,
  },
  metricPendingValue: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
  },
  metricPendingZero: {
    color: baseTokens.colors.successText,
  },
  metricLabel: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
  },
  skeletonGroup: {
    gap: 14,
    width: '100%',
  },
  skeletonCard: {
    backgroundColor: baseTokens.colors.surface,
    borderRadius: baseTokens.radii.card,
    gap: baseTokens.spacing.md,
    padding: baseTokens.spacing.lg,
    width: '100%',
  },
  skeletonBar: {
    backgroundColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.chip,
  },
  skeletonHeaderTall: {
    height: 48,
    width: '58%',
  },
  skeletonHeaderShort: {
    height: 16,
    width: '58%',
  },
  skeletonLineFull: {
    height: 16,
    width: '100%',
  },
  bottomActions: {
    backgroundColor: baseTokens.colors.surface,
    paddingBottom: baseTokens.spacing.md,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingTop: baseTokens.spacing.sm,
    width: '100%',
  },
});
