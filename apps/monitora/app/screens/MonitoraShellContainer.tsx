import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QueueConnectivityState } from '../../src/lib/offline/offline-queue';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  BrandLoadingOverlay,
  SwipeBackView,
  baseTokens,
  useScreenLoading,
} from '@camino/ui';
import type { StudentState } from '@camino/domain';
import { createProvisionalActiveRouteGateway } from '../../src/features/active-route/active-route-gateway';
import type {
  ActiveRouteData,
  ActiveRouteVisualState,
} from '../../src/features/active-route/active-route-types';
import {
  createProvisionalOfflineQueue,
  type OfflineQueueStats,
} from '../../src/lib/offline/offline-queue';
import {
  createProvisionalMonitoraSessionGateway,
  type MonitoraHomeStatus,
  type MonitoraNavTab,
  type MonitoraSessionGateway,
  type MonitoraShiftSummary,
} from '../../src/features/profile/monitora-session';
import { useConnectivityStatus } from '../../src/hooks/useConnectivityStatus';
import { MonitoraActiveRouteScreen } from './MonitoraActiveRouteScreen';
import { MonitoraBottomNav } from './MonitoraBottomNav';
import { MonitoraHomeScreen } from './MonitoraHomeScreen';
import { MonitoraProfileScreen } from './MonitoraProfileScreen';

const TAB_TRANSITION_MS = 420;

export type MonitoraShellContainerProps = {
  sessionEmail?: string;
  gateway?: MonitoraSessionGateway;
  onLoggedOut: () => void;
};

export function MonitoraShellContainer({
  sessionEmail,
  gateway,
  onLoggedOut,
}: MonitoraShellContainerProps) {
  const sessionGateway = useMemo(
    () => gateway ?? createProvisionalMonitoraSessionGateway(sessionEmail),
    [gateway, sessionEmail],
  );
  const snapshot = useMemo(
    () => sessionGateway.getSessionSnapshot(),
    [sessionGateway],
  );
  const { runWithLoading } = useScreenLoading();
  const { status: connectivity, checkConnectivity } = useConnectivityStatus();

  const [activeTab, setActiveTab] = useState<MonitoraNavTab>('inicio');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabLoadingLabel, setTabLoadingLabel] = useState<string | undefined>(
    undefined,
  );
  const tabTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const [isLoadingShift, setIsLoadingShift] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shift, setShift] = useState<MonitoraShiftSummary | null>(null);

  const offlineQueue = useMemo(() => createProvisionalOfflineQueue(), []);
  const routeGateway = useMemo(
    () => createProvisionalActiveRouteGateway(offlineQueue),
    [offlineQueue],
  );

  const [activeRoute, setActiveRoute] = useState<ActiveRouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isRefreshingRoute, setIsRefreshingRoute] = useState(false);
  const [queueStats, setQueueStats] = useState<OfflineQueueStats>(() =>
    offlineQueue.getStats(),
  );

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(
    snapshot.initialPendingSyncCount,
  );
  const [lastSyncLabel, setLastSyncLabel] = useState<string>(
    snapshot.profile.lastSyncLabel,
  );
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    return () => {
      if (tabTimerRef.current) clearTimeout(tabTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return offlineQueue.subscribe(() => {
      const stats = offlineQueue.getStats();
      setQueueStats(stats);
      setPendingSyncCount(stats.pendingCount);
    });
  }, [offlineQueue]);

  useEffect(() => {
    offlineQueue.setConnectivityState(
      connectivity === 'offline' ? 'offline' : 'online',
    );
  }, [connectivity, offlineQueue]);

  const loadRoute = useCallback(async () => {
    setIsLoadingRoute(true);
    try {
      const loaded = await routeGateway.fetchRoute();
      setActiveRoute(loaded);
    } catch {
      setActiveRoute(null);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [routeGateway]);

  useEffect(() => {
    void loadRoute();
  }, [loadRoute]);

  const loadShift = useCallback(async () => {
    setIsLoadingShift(true);
    try {
      const loaded = await sessionGateway.fetchShift();
      setShift(loaded);
    } catch {
      setShift(null);
    } finally {
      setIsLoadingShift(false);
    }
  }, [sessionGateway]);

  useEffect(() => {
    void loadShift();
  }, [loadShift]);

  // Al perder señal con turno activo, refleja cola local pendiente hasta sincronizar.
  useEffect(() => {
    if (connectivity === 'offline' && shift) {
      setPendingSyncCount((current) => (current === 0 ? 2 : current));
    }
  }, [connectivity, shift]);

  // ── Ciclo automático DEV de conectividad ──────────────────────────────────
  // Solo activo en __DEV__: online → offline → syncing → online … (sin botones)
  useEffect(() => {
    if (!__DEV__) return;
    const CYCLE: QueueConnectivityState[] = ['online', 'offline', 'syncing'];
    const DURATIONS = [6000, 4000, 2000]; // ms por estado
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    function advance() {
      idx = (idx + 1) % CYCLE.length;
      const nextState = CYCLE[idx]!;
      offlineQueue.setConnectivityState(nextState);
      setQueueStats(offlineQueue.getStats());
      timer = setTimeout(advance, DURATIONS[idx]!);
    }

    timer = setTimeout(advance, DURATIONS[0]!);
    return () => clearTimeout(timer);
  }, [offlineQueue]);

  const homeStatus: MonitoraHomeStatus = isLoadingShift
    ? 'loading'
    : !shift
      ? 'empty'
      : connectivity === 'offline'
        ? 'offline'
        : 'assigned';

  function selectTab(nextTab: MonitoraNavTab) {
    if (nextTab === activeTab) return;
    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);

    // La barra inferior permanece fija y visible (estilo Spotify); solo se
    // recarga el área de contenido superior con el logo animado.
    setActiveTab(nextTab);
    setTabLoadingLabel(
      nextTab === 'ruta'
        ? 'Cargando ruta activa…'
        : nextTab === 'perfil'
          ? 'Cargando perfil…'
          : undefined,
    );
    setIsTabLoading(true);

    tabTimerRef.current = setTimeout(() => {
      setIsTabLoading(false);
    }, TAB_TRANSITION_MS);
  }

  async function handleRefreshShift() {
    setIsRefreshing(true);
    try {
      await Promise.all([checkConnectivity(), loadShift()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCheckConnectivity() {
    const nextStatus = await checkConnectivity();
    if (nextStatus === 'online' && pendingSyncCount > 0) {
      Alert.alert(
        'Conexión disponible',
        `Tienes ${pendingSyncCount} registros pendientes listos para sincronizar desde Perfil.`,
      );
    }
  }

  async function handleRefreshRoute() {
    setIsRefreshingRoute(true);
    try {
      await Promise.all([checkConnectivity(), loadRoute()]);
    } finally {
      setIsRefreshingRoute(false);
    }
  }

  async function handleMarkAttendance(
    studentId: string,
    stopId: string,
    newState: StudentState,
    note?: string,
  ) {
    await routeGateway.updateStudentState(studentId, stopId, newState, note);
    const reloaded = await routeGateway.fetchRoute();
    setActiveRoute(reloaded);
    const stats = offlineQueue.getStats();
    setQueueStats(stats);
    setPendingSyncCount(stats.pendingCount);
  }

  async function handleSyncAndStay() {
    const nextConnectivity = await checkConnectivity();
    if (nextConnectivity === 'offline') {
      Alert.alert(
        'Sin señal',
        'Los registros permanecen en cola local y se enviarán al recuperar conexión.',
      );
      return;
    }

    setIsSyncing(true);
    try {
      await runWithLoading(
        async () => {
          const syncResult = await offlineQueue.syncPending();
          const sessionResult = await sessionGateway.syncOfflineQueue();
          setPendingSyncCount(0);
          setLastSyncLabel(
            sessionResult.lastSyncLabel ?? syncResult.lastSyncLabel,
          );
          const reloaded = await routeGateway.fetchRoute();
          setActiveRoute(reloaded);
          setLogoutModalVisible(false);
        },
        { label: 'Sincronizando registros…', minDurationMs: 550 },
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      await sessionGateway.logout();
      setLogoutModalVisible(false);
      onLoggedOut();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const isOffline =
    connectivity === 'offline' || queueStats.connectivity === 'offline';
  const activeRouteVisualState: ActiveRouteVisualState = isLoadingRoute
    ? 'loading'
    : isSyncing
      ? 'syncing'
      : isOffline
        ? 'offline'
        : 'online';

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.contentArea}>
        {activeTab === 'perfil' ? (
          <SwipeBackView
            enabled={!logoutModalVisible}
            onBack={() => selectTab('inicio')}
          >
            <MonitoraProfileScreen
              isLoggingOut={isLoggingOut}
              isSyncing={isSyncing}
              lastSyncLabel={lastSyncLabel}
              logoutModalVisible={logoutModalVisible}
              onBack={() => selectTab('inicio')}
              onCancelLogout={() => setLogoutModalVisible(false)}
              onConfirmLogout={() => {
                void handleConfirmLogout();
              }}
              onOpenActiveRoute={() => selectTab('ruta')}
              onRequestLogout={() => setLogoutModalVisible(true)}
              onSyncAndStay={() => {
                void handleSyncAndStay();
              }}
              pendingSyncCount={pendingSyncCount}
              profile={snapshot.profile}
            />
          </SwipeBackView>
        ) : activeTab === 'ruta' ? (
          <SwipeBackView enabled onBack={() => selectTab('inicio')}>
            <MonitoraActiveRouteScreen
              isRefreshing={isRefreshingRoute}
              onBack={() => selectTab('inicio')}
              onMarkAttendance={handleMarkAttendance}
              onPressNotifications={() =>
                Alert.alert(
                  'Avisos de jornada',
                  pendingSyncCount > 0
                    ? `Tienes ${pendingSyncCount} registros pendientes por sincronizar.`
                    : 'Sin novedades críticas en tu jornada actual.',
                )
              }
              onRefresh={() => {
                void handleRefreshRoute();
              }}
              onRetryConnectivity={() => {
                void handleCheckConnectivity();
              }}
              pendingSyncCount={queueStats.pendingCount}
              route={activeRoute}
              syncedCount={queueStats.syncedCount}
              visualState={activeRouteVisualState}
            />
          </SwipeBackView>
        ) : (
          <MonitoraHomeScreen
            isRefreshing={isRefreshing}
            onCheckConnectivity={() => {
              void handleCheckConnectivity();
            }}
            onOpenActiveRoute={() => selectTab('ruta')}
            onOpenProfile={() => selectTab('perfil')}
            onPressNotifications={() =>
              Alert.alert(
                'Avisos de jornada',
                pendingSyncCount > 0
                  ? `Tienes ${pendingSyncCount} registros pendientes por sincronizar.`
                  : 'Sin novedades críticas en tu jornada actual.',
              )
            }
            onRefreshShift={() => {
              void handleRefreshShift();
            }}
            pendingSyncCount={pendingSyncCount}
            profile={snapshot.profile}
            shift={shift}
            status={homeStatus}
          />
        )}

        <BrandLoadingOverlay
          backdrop="solid"
          label={tabLoadingLabel}
          size={52}
          testID="monitora-tab-loader"
          visible={isTabLoading}
        />
      </View>

      <MonitoraBottomNav activeTab={activeTab} onSelectTab={selectTab} />
    </SafeAreaView>
  );
}

const androidTopOffset =
  Platform.OS === 'android'
    ? Math.max(StatusBar.currentHeight ?? 0, baseTokens.spacing.sm)
    : 0;

const styles = StyleSheet.create({
  shell: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
});
