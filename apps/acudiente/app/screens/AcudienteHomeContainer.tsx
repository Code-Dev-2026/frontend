import { useState } from 'react';
import { shouldShowCustodyMap, type StudentState } from '@camino/domain';
import {
  AcudienteHomeScreen,
  AcudienteMapScreen,
  SwipeBackView,
  useScreenLoading,
  type AcudienteChildSummary,
  type AcudienteNavTab,
} from '@camino/ui';
import { Alert } from 'react-native';

type GuardianStudentRecord = {
  id: string;
  name: string;
  routeSummary: string;
  scheduleSummary: string;
  state: StudentState;
  statusLabel: string;
  lastUpdateLabel: string;
  etaValue?: string;
  busSummary?: string;
  stopSummary?: string;
  mapLastUpdatedLabel?: string;
};

// PROVISIONAL: datos de demostración mientras se conecta el contrato de
// autenticación y consulta de estudiantes del acudiente.
const PROVISIONAL_AVATAR_INITIALS = 'MC';

// PROVISIONAL: listado inicial basado en los frames Acudiente/Inicio y Mapa en vivo.
const PROVISIONAL_STUDENTS: readonly GuardianStudentRecord[] = [
  {
    id: 'student-lucia',
    name: 'Lucía',
    routeSummary: 'Ruta 03 · Bus 07 · Jornada tarde',
    scheduleSummary: 'Hoy · 15:30 · Parada asignada A',
    state: 'A_BORDO_VEHICULO',
    statusLabel: 'A Bordo del Vehículo',
    lastUpdateLabel: 'Última actualización: hoy, 15:25',
    etaValue: '5 min',
    busSummary: 'Bus 07 · Ruta 03',
    stopSummary: 'Parada A · Llegada estimada 15:30',
    mapLastUpdatedLabel: 'Actualizado hoy a las 15:25',
  },
  {
    id: 'student-mateo',
    name: 'Mateo',
    routeSummary: 'Ruta 03 · Jornada mañana',
    scheduleSummary: '11 nov · 06:30 · Parada asignada A',
    state: 'EN_CASA',
    statusLabel: 'En Casa/Espera',
    lastUpdateLabel: 'En casa · Próxima salida: 11 nov',
  },
];

export type AcudienteHomeContainerProps = {
  onBackToLogin: () => void;
};

export function AcudienteHomeContainer({
  onBackToLogin,
}: AcudienteHomeContainerProps) {
  const { transitionScreen } = useScreenLoading();
  const [activeTab, setActiveTab] = useState<AcudienteNavTab>('inicio');
  const [selectedMapStudentId, setSelectedMapStudentId] =
    useState<string>('student-lucia');

  const childrenCards: AcudienteChildSummary[] = PROVISIONAL_STUDENTS.map(
    (student) => {
      const canOpenMap = shouldShowCustodyMap(student.state);
      return {
        id: student.id,
        name: student.name,
        routeSummary: student.routeSummary,
        scheduleSummary: student.scheduleSummary,
        statusVariant: canOpenMap ? 'on-board' : 'at-home',
        statusLabel: student.statusLabel,
        lastUpdateLabel: student.lastUpdateLabel,
        actionLabel: canOpenMap ? 'Ver mapa' : 'Ver estado',
      };
    },
  );

  const onBoardStudent =
    PROVISIONAL_STUDENTS.find(
      (item) =>
        item.id === selectedMapStudentId && shouldShowCustodyMap(item.state),
    ) ?? PROVISIONAL_STUDENTS.find((item) => shouldShowCustodyMap(item.state));

  const handleChildAction = (childId: string) => {
    const student = PROVISIONAL_STUDENTS.find((item) => item.id === childId);
    if (!student) return;

    if (shouldShowCustodyMap(student.state)) {
      transitionScreen(
        () => {
          setSelectedMapStudentId(student.id);
          setActiveTab('mapa');
        },
        { label: 'Cargando mapa…' },
      );
      return;
    }

    Alert.alert(
      'Detalle de estado',
      'El mapa solo se habilita mientras el estudiante está a bordo del vehículo.',
    );
  };

  const handleSelectTab = (tab: AcudienteNavTab) => {
    if (tab === 'mapa') {
      if (!onBoardStudent) {
        Alert.alert(
          'Mapa no disponible',
          'El mapa solo se habilita mientras algún estudiante está a bordo del vehículo.',
        );
        return;
      }
      if (activeTab !== 'mapa') {
        transitionScreen(() => setActiveTab('mapa'), {
          label: 'Cargando mapa…',
        });
      }
      return;
    }

    if (tab === 'inicio') {
      if (activeTab !== 'inicio') {
        transitionScreen(() => setActiveTab('inicio'));
      }
      return;
    }

    Alert.alert(
      'Sección en construcción',
      'Esta sección aún no está conectada.',
    );
  };

  if (activeTab === 'mapa' && onBoardStudent) {
    return (
      <SwipeBackView
        enabled
        onBack={() => transitionScreen(() => setActiveTab('inicio'))}
      >
        <AcudienteMapScreen
          activeTab="mapa"
          busSummary={onBoardStudent.busSummary ?? onBoardStudent.routeSummary}
          custodyStatusLabel={onBoardStudent.statusLabel}
          etaSubtitle={`${onBoardStudent.name} · Llegada estimada a tu parada`}
          etaValue={onBoardStudent.etaValue ?? '—'}
          lastUpdatedLabel={
            onBoardStudent.mapLastUpdatedLabel ?? onBoardStudent.lastUpdateLabel
          }
          onPressAlerts={() => handleSelectTab('avisos')}
          onPressCoverageNotice={() =>
            Alert.alert(
              'Zona sin cobertura',
              'Se notificará si el vehículo ingresa a una zona con señal intermitente.',
            )
          }
          onSelectTab={handleSelectTab}
          stopSummary={
            onBoardStudent.stopSummary ?? onBoardStudent.scheduleSummary
          }
        />
      </SwipeBackView>
    );
  }

  return (
    <AcudienteHomeScreen
      activeTab={activeTab}
      avatarInitials={PROVISIONAL_AVATAR_INITIALS}
      childrenCards={childrenCards}
      onBack={onBackToLogin}
      onPressAvatar={() => handleSelectTab('perfil')}
      onPressChildAction={handleChildAction}
      onReportAbsence={() =>
        Alert.alert(
          'Reportar inasistencia',
          'El flujo de reporte de inasistencia aún no está conectado.',
        )
      }
      onRequestOccasionalPassenger={() =>
        Alert.alert(
          'Solicitar pasajero ocasional',
          'La solicitud de pasajero ocasional aún no está conectada.',
        )
      }
      onSelectTab={handleSelectTab}
    />
  );
}
