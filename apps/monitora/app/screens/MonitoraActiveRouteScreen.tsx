import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Banner,
  Button,
  Icon,
  InteractivePressable,
  baseTokens,
} from '@camino/ui';
import type { StudentState } from '@camino/domain';
import {
  ConnectivityBar,
  SyncChip,
} from '../../src/components/status/ConnectivityBar';
import type {
  ActiveRouteData,
  ActiveRouteStop,
  ActiveRouteStudent,
  ActiveRouteVisualState,
} from '../../src/features/active-route/active-route-types';
import { MonitoraAppBar } from './MonitoraAppBar';

export type MonitoraActiveRouteScreenProps = {
  route: ActiveRouteData | null;
  visualState: ActiveRouteVisualState;
  pendingSyncCount: number;
  syncedCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onPressNotifications?: () => void;
  onMarkAttendance: (
    studentId: string,
    stopId: string,
    newState: StudentState,
    note?: string,
  ) => Promise<void>;
  onRetryConnectivity?: () => void;
};

// ---------------------------------------------------------------------------
// Skeleton de carga
// ---------------------------------------------------------------------------
function RouteSkeletonCard() {
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
      <View style={[styles.skeletonBar, styles.skeletonTitle]} />
      <View style={[styles.skeletonBar, styles.skeletonLine]} />
      <View style={[styles.skeletonBar, styles.skeletonLineSmall]} />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatStudentStateLabel(state: StudentState): string {
  switch (state) {
    case 'A_BORDO_VEHICULO':
      return 'A bordo';
    case 'EN_CASA':
      return 'En casa';
    case 'EN_COLEGIO':
      return 'En colegio';
    case 'RETORNO_SEDE_POR_FALLA_ENTREGA':
      return 'Retorno por falla';
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Fila de estudiante (solo en parada actual)
// ---------------------------------------------------------------------------
function StudentRow({
  student,
  stopId,
  isMarking,
  onMark,
  onOpenQr,
  onOpenDetail,
}: {
  student: ActiveRouteStudent;
  stopId: string;
  isMarking: boolean;
  onMark: (studentId: string, stopId: string, newState: StudentState) => void;
  onOpenQr: () => void;
  onOpenDetail: (student: ActiveRouteStudent) => void;
}) {
  const isHome = student.state === 'EN_CASA';

  return (
    <View style={styles.studentCard} testID={`student-row-${student.id}`}>
      {/* Fila superior: icono + nombre + link */}
      <View style={styles.studentTopRow}>
        <Icon color={baseTokens.colors.navy900} name="user-round" size={17} />
        <Text style={styles.studentName} numberOfLines={1}>
          {student.fullName}
        </Text>
        <Pressable
          accessibilityLabel={
            isHome
              ? `Escanear QR de ${student.fullName}`
              : `Ver ficha de ${student.fullName}`
          }
          accessibilityRole="button"
          hitSlop={10}
          onPress={isHome ? onOpenQr : () => onOpenDetail(student)}
          style={styles.studentLinkPressable}
        >
          <Text style={styles.studentLink}>{isHome ? 'QR ›' : 'Ficha ›'}</Text>
        </Pressable>
      </View>

      {/* Fila inferior: chips de estado + sincronización */}
      <View style={styles.studentChipsRow}>
        <Pressable
          accessibilityLabel={`Cambiar estado de ${student.fullName}`}
          accessibilityRole="button"
          disabled={isMarking}
          hitSlop={8}
          onPress={() =>
            onMark(
              student.id,
              stopId,
              isHome ? 'A_BORDO_VEHICULO' : 'EN_COLEGIO',
            )
          }
          style={styles.stateChip}
        >
          <Text style={styles.stateChipText}>
            {isMarking ? '…' : formatStudentStateLabel(student.state)}
          </Text>
        </Pressable>
        <SyncChip status={student.syncStatus} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta de parada
// ---------------------------------------------------------------------------
function StopCard({
  stop,
  isMarkingId,
  onMark,
  onOpenQr,
  onOpenDetail,
}: {
  stop: ActiveRouteStop;
  isMarkingId: string | null;
  onMark: (studentId: string, stopId: string, newState: StudentState) => void;
  onOpenQr: () => void;
  onOpenDetail: (student: ActiveRouteStudent) => void;
}) {
  const isCurrent = stop.status === 'current';
  const isCompleted = stop.status === 'completed';

  return (
    <View
      style={[styles.stopCard, isCurrent && styles.stopCardCurrent]}
      testID={`stop-item-${stop.id}`}
    >
      {/* Encabezado de la parada */}
      <View style={styles.stopHeaderRow}>
        <View style={styles.stopIconWrap}>
          {isCompleted ? (
            <Icon color="#047857" name="circle-check" size={18} />
          ) : (
            <Icon
              color={isCurrent ? NAVY : '#9ca3af'}
              name="map-pin"
              size={18}
            />
          )}
        </View>
        <View style={styles.stopHeaderInfo}>
          <View style={styles.stopTitleRow}>
            <Text style={styles.stopName} numberOfLines={1}>
              {stop.name}
            </Text>
            {isCurrent ? (
              <View style={styles.badgeActual}>
                <Text style={styles.badgeActualText}>Actual</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.stopMeta}>
            {isCompleted
              ? `${stop.scheduledTime} · ${stop.students.length}/${stop.students.length} · Completada`
              : `${stop.scheduledTime} · ${stop.students.length} ${stop.students.length === 1 ? 'estudiante' : 'estudiantes'}`}
          </Text>
        </View>
      </View>

      {/* Lista de estudiantes: solo en parada actual */}
      {isCurrent ? (
        <View style={styles.studentsContainer}>
          {stop.students.map((student) => (
            <StudentRow
              key={student.id}
              isMarking={isMarkingId === student.id}
              onMark={onMark}
              onOpenDetail={onOpenDetail}
              onOpenQr={onOpenQr}
              stopId={stop.id}
              student={student}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pantalla principal
// ---------------------------------------------------------------------------
export function MonitoraActiveRouteScreen({
  route,
  visualState,
  pendingSyncCount,
  syncedCount,
  isRefreshing,
  onRefresh,
  onBack,
  onPressNotifications,
  onMarkAttendance,
  onRetryConnectivity,
}: MonitoraActiveRouteScreenProps) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<ActiveRouteStudent | null>(null);
  const [isMarkingId, setIsMarkingId] = useState<string | null>(null);

  const isLoading = visualState === 'loading';

  async function handleMark(
    studentId: string,
    stopId: string,
    newState: StudentState,
  ) {
    setIsMarkingId(studentId);
    try {
      await onMarkAttendance(studentId, stopId, newState);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar';
      Alert.alert('Acción no permitida', msg);
    } finally {
      setIsMarkingId(null);
    }
  }

  function handleSimulateQrScan() {
    if (!route || route.stops.length === 0) return;
    const currentStop =
      route.stops.find((s) => s.id === route.currentStopId) ?? route.stops[0];
    if (!currentStop) return;

    const candidate = currentStop.students.find((s) => s.state === 'EN_CASA');
    if (candidate) {
      void onMarkAttendance(candidate.id, currentStop.id, 'A_BORDO_VEHICULO');
      Alert.alert(
        'QR Escaneado',
        `Abordaje registrado para ${candidate.fullName}.`,
      );
    } else {
      Alert.alert(
        'QR Escaneado',
        'Todos los estudiantes de esta parada ya fueron registrados.',
      );
    }
    setQrModalVisible(false);
  }

  const routeMeta = route
    ? `${route.busCode} · ${route.onBoardCount}/${route.capacity} · ${route.stops.length} paradas`
    : null;

  return (
    <View style={styles.screen} testID="monitora-active-route-screen">
      <MonitoraAppBar
        onBack={onBack}
        onPressNotifications={onPressNotifications}
        testID="monitora-active-route-appbar"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[PRIMARY]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Barra de conectividad compacta ── */}
        <View style={styles.connectivityWrapper}>
          <ConnectivityBar
            compact
            onPressRetry={onRetryConnectivity}
            pendingCount={pendingSyncCount}
            status={visualState}
            syncedCount={syncedCount}
            testID="active-route-connectivity-bar"
          />
        </View>

        {/* ── Fila meta de ruta ── */}
        {routeMeta ? (
          <View style={styles.routeMetaRow}>
            <View style={styles.routeMetaLeft}>
              <Icon color={NAVY} name="bus-front" size={16} />
              <Text style={styles.routeMetaText}>{routeMeta}</Text>
            </View>
            <Pressable
              accessibilityLabel="Actualizar ruta"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onRefresh}
              style={styles.updateBtn}
            >
              <Icon color={PRIMARY} name="refresh-cw" size={14} />
              <Text style={styles.updateBtnText}>Actualizar</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <RouteSkeletonCard />
            <RouteSkeletonCard />
            <RouteSkeletonCard />
          </View>
        ) : !route ? (
          <View style={styles.emptyContainer}>
            <Icon color={baseTokens.colors.textMuted} name="route" size={40} />
            <Text style={styles.emptyTitle}>Sin ruta activa</Text>
            <Text style={styles.emptyDesc}>
              No hay una ruta asignada para tu turno en este momento.
            </Text>
          </View>
        ) : (
          <View style={styles.stopsList}>
            {route.stops.map((stop) => (
              <StopCard
                key={stop.id}
                isMarkingId={isMarkingId}
                onMark={handleMark}
                onOpenDetail={(student) => setSelectedStudent(student)}
                onOpenQr={() => setQrModalVisible(true)}
                stop={stop}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Botón "Escanear QR" fijo en la parte inferior ── */}
      {route ? (
        <View style={styles.stickyQrContainer}>
          <InteractivePressable
            accessibilityLabel="Abrir escáner QR de carnés"
            accessibilityRole="button"
            onPress={() => setQrModalVisible(true)}
            pressFillColor="rgba(255, 255, 255, 0.15)"
            style={styles.stickyQrButton}
          >
            <Text style={styles.stickyQrText}>Escanear QR</Text>
          </InteractivePressable>
        </View>
      ) : null}

      {/* ── Modal escáner QR (FE-10 provisional) ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
        transparent
        visible={qrModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escáner QR de carné</Text>
              <Pressable
                accessibilityLabel="Cerrar escáner"
                onPress={() => setQrModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Icon color={NAVY} name="x" size={20} />
              </Pressable>
            </View>

            <View style={styles.qrViewfinder}>
              <View style={styles.qrCornerTL} />
              <View style={styles.qrCornerTR} />
              <View style={styles.qrCornerBL} />
              <View style={styles.qrCornerBR} />
              <Icon color={PRIMARY} name="search" size={40} />
              <Text style={styles.qrInstruction}>
                Apunta al código QR del carné del estudiante
              </Text>
            </View>

            <Text style={styles.qrNote}>
              Funciona sin señal: las lecturas se validan localmente y se
              encolan para sincronización.
            </Text>

            <View style={styles.modalActions}>
              <Button
                label="Simular escaneo de estudiante"
                onPress={handleSimulateQrScan}
                variant="primary"
              />
              <Button
                label="Cancelar"
                onPress={() => setQrModalVisible(false)}
                variant="soft"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal ficha de estudiante (FE-11) ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setSelectedStudent(null)}
        transparent
        visible={selectedStudent !== null}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ficha del estudiante</Text>
              <Pressable
                accessibilityLabel="Cerrar ficha del estudiante"
                onPress={() => setSelectedStudent(null)}
                style={styles.modalCloseBtn}
              >
                <Icon color={NAVY} name="x" size={20} />
              </Pressable>
            </View>

            {selectedStudent ? (
              <View style={styles.detailBody}>
                <Text style={styles.detailStudentName}>
                  {selectedStudent.fullName}
                </Text>
                <Text style={styles.detailStudentGrade}>
                  {selectedStudent.grade}
                </Text>
                <Text style={styles.detailAdults}>
                  Adultos autorizados: {selectedStudent.authorizedAdultsCount}{' '}
                  (RN-04)
                </Text>
                {selectedStudent.hasCustodyAlert ? (
                  <Banner
                    message="Existe restricción de custodia. Verifica el protocolo antes de autorizar la entrega (RN-04)."
                    title="Restricción de custodia"
                    variant="warning"
                  />
                ) : null}
                {selectedStudent.notes ? (
                  <Text style={styles.detailStudentNotes}>
                    Nota: {selectedStudent.notes}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                label="Cerrar"
                onPress={() => setSelectedStudent(null)}
                variant="soft"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const PRIMARY = baseTokens.colors.actionPrimary;
const NAVY = baseTokens.colors.navy900;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingTop: 12,
    paddingBottom: 20,
  },
  connectivityWrapper: {
    marginBottom: 12,
  },

  // ── Meta fila de ruta ──────────────────────────────────────────────────────
  routeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeMetaText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    color: baseTokens.colors.textMuted,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: baseTokens.sizes.touchMin,
    paddingHorizontal: 4,
  },
  updateBtnText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },

  // ── Loading skeleton ──────────────────────────────────────────────────────
  loadingContainer: { gap: 12 },
  skeletonCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  skeletonBar: { backgroundColor: '#e5e7eb', borderRadius: 6 },
  skeletonTitle: { height: 18, width: '55%' },
  skeletonLine: { height: 13, width: '85%' },
  skeletonLineSmall: { height: 11, width: '35%' },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: baseTokens.typography.section.fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 14,
    color: baseTokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Paradas ───────────────────────────────────────────────────────────────
  stopsList: { gap: 12 },
  stopCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 10,
  },
  stopCardCurrent: {
    borderColor: '#60a5fa',
    borderWidth: 1.5,
    backgroundColor: '#f8fbff',
  },
  stopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stopIconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopHeaderInfo: { flex: 1, gap: 2 },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stopName: {
    fontFamily: baseTokens.typography.section.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: NAVY,
    flex: 1,
  },
  stopMeta: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 12,
    color: baseTokens.colors.textMuted,
  },
  badgeActual: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeActualText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '500',
  },

  // ── Sub-tarjetas de estudiante ─────────────────────────────────────────────
  studentsContainer: {
    gap: 10,
    marginTop: 2,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 8,
  },
  studentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontFamily: baseTokens.typography.bodySmall.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: NAVY,
    flex: 1,
  },
  studentLinkPressable: {
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  studentLink: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  studentChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    minHeight: 24,
    justifyContent: 'center',
  },
  stateChipText: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    color: NAVY,
  },

  // ── Botón QR fijo ─────────────────────────────────────────────────────────
  stickyQrContainer: {
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
  },
  stickyQrButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: baseTokens.sizes.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyQrText: {
    fontFamily: baseTokens.typography.button.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  // ── Modal QR / Ficha ──────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: baseTokens.typography.section.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  modalCloseBtn: {
    minWidth: baseTokens.sizes.touchMin,
    minHeight: baseTokens.sizes.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrViewfinder: {
    height: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
    gap: 10,
  },
  qrCornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: PRIMARY,
  },
  qrCornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: PRIMARY,
  },
  qrCornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: PRIMARY,
  },
  qrCornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: PRIMARY,
  },
  qrInstruction: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 13,
    color: baseTokens.colors.textBody,
    textAlign: 'center',
  },
  qrNote: {
    fontFamily: baseTokens.typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: baseTokens.colors.textMuted,
  },
  modalActions: { gap: 10 },
  detailBody: { gap: 6 },
  detailStudentName: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  detailStudentGrade: {
    fontSize: 13,
    color: baseTokens.colors.textBody,
  },
  detailAdults: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  detailStudentNotes: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 4,
  },
});
