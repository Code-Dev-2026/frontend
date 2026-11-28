import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon, baseTokens } from '@camino/ui';
import type {
  QueueConnectivityState,
  QueueSyncStatus,
} from '../../lib/offline/offline-queue';

export type ConnectivityBarProps = {
  status: QueueConnectivityState | 'loading';
  pendingCount?: number;
  syncedCount?: number;
  onPressRetry?: () => void;
  compact?: boolean;
  testID?: string;
};

export type SyncChipProps = {
  status: QueueSyncStatus;
  label?: string;
  testID?: string;
};

export function SyncChip({ status, label, testID }: SyncChipProps) {
  const isSynced = status === 'synced';
  const displayLabel =
    label ?? (isSynced ? 'Sincronizado' : 'Pendiente de envío');

  return (
    <View
      style={[styles.chip, isSynced ? styles.chipSynced : styles.chipPending]}
      testID={testID ?? `sync-chip-${status}`}
    >
      <Icon
        color={isSynced ? '#047857' : '#d97706'}
        name={isSynced ? 'circle-check' : 'refresh-cw'}
        size={13}
      />
      <Text
        style={[
          styles.chipText,
          isSynced ? styles.chipTextSynced : styles.chipTextPending,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

export function ConnectivityBar({
  status,
  pendingCount = 0,
  syncedCount = 0,
  onPressRetry,
  compact = false,
  testID = 'connectivity-bar',
}: ConnectivityBarProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'syncing' || status === 'loading') {
      const animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
      );
      animation.start();
      return () => animation.stop();
    }
    spinValue.setValue(0);
  }, [status, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isOffline = status === 'offline';
  const isSyncing = status === 'syncing';
  const isLoading = status === 'loading';

  let title = 'En línea';
  let subtitle =
    pendingCount > 0
      ? `${pendingCount} registro(s) pendiente(s)`
      : `${syncedCount} registro(s) sincronizado(s)`;

  if (isOffline) {
    title = 'Sin señal · Modo local';
    subtitle =
      pendingCount > 0
        ? `${pendingCount} registro(s) en cola para envío al reconectar`
        : 'Registros guardados en cola local';
  } else if (isSyncing) {
    title = 'Sincronizando…';
    subtitle = 'Transmitiendo registros pendientes al servidor';
  } else if (isLoading) {
    title = 'Comprobando conexión…';
    subtitle = 'Verificando estado de red del dispositivo';
  }

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        isOffline
          ? styles.containerOffline
          : isSyncing
            ? styles.containerSyncing
            : styles.containerOnline,
      ]}
      testID={testID}
    >
      <View style={styles.leftRow}>
        {compact ? (
          isSyncing || isLoading ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon
                color={baseTokens.colors.primary500}
                name="loader-circle"
                size={20}
              />
            </Animated.View>
          ) : (
            <Icon
              color={isOffline ? '#d97706' : '#16a34a'}
              name={isOffline ? 'wifi-off' : 'wifi'}
              size={20}
            />
          )
        ) : (
          <View
            style={[
              styles.iconWrapper,
              isOffline
                ? styles.iconWrapperOffline
                : isSyncing
                  ? styles.iconWrapperSyncing
                  : styles.iconWrapperOnline,
            ]}
          >
            {isSyncing || isLoading ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Icon
                  color={baseTokens.colors.primary500}
                  name="loader-circle"
                  size={18}
                />
              </Animated.View>
            ) : (
              <Icon
                color={isOffline ? '#d97706' : '#047857'}
                name={isOffline ? 'wifi-off' : 'wifi'}
                size={18}
              />
            )}
          </View>
        )}

        <View style={styles.textColumn}>
          <Text
            style={[
              styles.title,
              compact && styles.titleCompact,
              isOffline
                ? styles.titleOffline
                : isSyncing
                  ? styles.titleSyncing
                  : compact
                    ? styles.titleCompactOnline
                    : styles.titleOnline,
            ]}
          >
            {title}
          </Text>
          {!compact ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {compact && isOffline && pendingCount > 0 ? (
        <View style={styles.compactPendingPill}>
          <Text style={styles.compactPendingText}>{pendingCount} pend.</Text>
        </View>
      ) : null}

      {onPressRetry && isOffline && !compact ? (
        <Pressable
          accessibilityLabel="Reintentar comprobación de conexión"
          accessibilityRole="button"
          onPress={onPressRetry}
          style={styles.retryButton}
        >
          <Icon color={baseTokens.colors.navy900} name="refresh-cw" size={14} />
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: baseTokens.radii.control,
    backgroundColor: baseTokens.colors.surface,
    borderWidth: 1,
    marginBottom: 12,
  },
  containerOnline: {
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  containerCompact: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 0,
  },
  containerOffline: {
    borderColor: '#fed7aa',
    backgroundColor: '#fffbeb',
  },
  containerSyncing: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperOnline: {
    backgroundColor: '#ecfdf5',
  },
  iconWrapperOffline: {
    backgroundColor: '#fef3c7',
  },
  iconWrapperSyncing: {
    backgroundColor: '#dbeafe',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontFamily: baseTokens.typography.fieldLabel.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  titleOnline: {
    color: '#065f46',
  },
  titleCompact: {
    fontSize: 14,
    fontWeight: '500',
  },
  titleCompactOnline: {
    color: baseTokens.colors.navy900,
  },
  compactPendingPill: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  compactPendingText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  titleOffline: {
    color: '#92400e',
  },
  titleSyncing: {
    color: '#1e40af',
  },
  subtitle: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: baseTokens.colors.textBody,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  retryText: {
    fontFamily: baseTokens.typography.fieldLabel.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: baseTokens.colors.navy900,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipSynced: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  chipPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  chipText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  chipTextSynced: {
    color: '#047857',
  },
  chipTextPending: {
    color: '#b45309',
  },
});
