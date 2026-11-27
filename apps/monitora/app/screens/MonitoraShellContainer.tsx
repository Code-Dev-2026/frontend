import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Banner,
  BrandLoadingOverlay,
  Button,
  Card,
  Icon,
  SwipeBackView,
  baseTokens,
  useScreenLoading,
} from '@camino/ui';
import {
  createProvisionalMonitoraSessionGateway,
  type MonitoraHomeStatus,
  type MonitoraNavTab,
  type MonitoraSessionGateway,
  type MonitoraShiftSummary,
} from '../../src/features/profile/monitora-session';
import { useConnectivityStatus } from '../../src/hooks/useConnectivityStatus';
import { MonitoraAppBar } from './MonitoraAppBar';
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
          const result = await sessionGateway.syncOfflineQueue();
          setPendingSyncCount(result.pendingSyncCount);
          setLastSyncLabel(result.lastSyncLabel);
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

  const isOffline = connectivity === 'offline';

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
          // PROVISIONAL: puente visual del tab Ruta hasta implementar la lista de
          // paradas, botón Escanear QR y estados de ruta en FE-09 (#56).
          <SwipeBackView enabled onBack={() => selectTab('inicio')}>
            <View
              style={styles.routeScreen}
              testID="monitora-route-placeholder"
            >
              <MonitoraAppBar
                onBack={() => selectTab('inicio')}
                testID="monitora-route-appbar"
              />

              <ScrollView
                contentContainerStyle={styles.routeContent}
                showsVerticalScrollIndicator={false}
              >
                {isOffline ? (
                  <Banner
                    message="Trabajando sin señal. Los registros se guardan en cola local."
                    title="Modo sin conexión"
                    variant="warning"
                  />
                ) : null}

                <Card style={styles.routeCard}>
                  <View style={styles.routeHeader}>
                    <Icon
                      color={baseTokens.colors.navy900}
                      name="route"
                      size={baseTokens.sizes.iconDefault}
                    />
                    <Text style={styles.routeTitle}>
                      {shift
                        ? `${shift.routeCode} · ${shift.busCode}`
                        : 'Sin ruta activa'}
                    </Text>
                  </View>

                  <Text style={styles.routeBody}>
                    {shift
                      ? `${shift.scheduleLabel} · ${shift.campusName} · ${shift.stopsCount} paradas · ${shift.onBoardCount}/${shift.capacity} a bordo.`
                      : 'No hay una ruta asignada en este momento.'}
                  </Text>

                  <Text style={styles.routeCaption}>
                    El listado operativo de paradas, botón Escanear QR y
                    controles de abordaje se conectan en FE-09 (#56) y FE-10
                    (#57).
                  </Text>
                </Card>

                <Button
                  label="Volver a Inicio"
                  onPress={() => selectTab('inicio')}
                  variant="soft"
                />
              </ScrollView>
            </View>
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
  routeScreen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
  },
  routeContent: {
    gap: baseTokens.spacing.lg,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingVertical: baseTokens.spacing.lg,
  },
  routeCard: {
    gap: baseTokens.spacing.md,
    padding: baseTokens.spacing.lg,
  },
  routeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: baseTokens.spacing.sm,
  },
  routeTitle: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
    flex: 1,
  },
  routeBody: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textBody,
  },
  routeCaption: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
});
