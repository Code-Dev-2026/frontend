import {
  canTransitionTo,
  STUDENT_STATES,
  type StudentState,
} from '@camino/domain';

export type AlertCategory = 'red_alert' | 'deviation' | 'delay';
export type AlertStatus = 'active' | 'resolved';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'resolved';

export interface ConsoleAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  badgeLabel: string;
  title: string;
  description: string;
  routeName: string;
  unitCode: string;
  studentRef: string;
  deviationMeters?: number;
  delayMinutes?: number;
  highlightOnMap: boolean;
  priorityTag: string;
  actionLabel: string;
  coordinates: {
    normal: [number, number];
    deviated?: [number, number];
  };
}

export interface StudentTransitionEntry {
  id: string;
  time: string;
  state: StudentState;
  detail: string;
}

export interface AlertFilterCriteria {
  category: AlertCategory | 'all';
  routeName: string | 'all';
  status: AlertStatus | 'all';
  query: string;
}

const SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  resolved: 3,
};

export const INITIAL_ALERTS: ReadonlyArray<ConsoleAlert> = [
  {
    id: 'alert-red-1',
    category: 'red_alert',
    severity: 'critical',
    status: 'active',
    badgeLabel: 'CRÍTICA · 07:52',
    title: 'Alerta roja · Custodia no validada',
    description:
      'Entrega bloqueada en Ruta Sur (BUS-03): adulto no autorizado. Transición a RETORNO_SEDE_POR_FALLA_ENTREGA.',
    routeName: 'Ruta Sur',
    unitCode: 'BUS-03',
    studentRef: '#E-104',
    highlightOnMap: false,
    priorityTag: 'Prioridad Alta',
    actionLabel: 'Ver transición →',
    coordinates: {
      normal: [-75.6968, 4.8128],
    },
  },
  {
    id: 'alert-dev-1',
    category: 'deviation',
    severity: 'high',
    status: 'active',
    badgeLabel: 'DESVÍO · 07:49',
    title: 'Desvío mayor a 300 m (+420 m)',
    description:
      'La unidad BUS-03 salió del corredor asignado en Ruta Sur. Resaltado en mapa de consola.',
    routeName: 'Ruta Sur',
    unitCode: 'BUS-03',
    studentRef: '#E-104',
    deviationMeters: 420,
    highlightOnMap: true,
    priorityTag: 'Desvío > 300 m',
    actionLabel: 'Ver en mapa →',
    coordinates: {
      normal: [-75.6968, 4.8128],
      deviated: [-75.6914, 4.8102],
    },
  },
  {
    id: 'alert-delay-1',
    category: 'delay',
    severity: 'medium',
    status: 'active',
    badgeLabel: 'RETRASO · 07:44',
    title: 'Retraso anómalo (+29 min)',
    description:
      'La unidad BUS-02 superó la holgura máxima de 25 minutos reportada por backend.',
    routeName: 'Ruta Centro',
    unitCode: 'BUS-02',
    studentRef: '#E-109',
    delayMinutes: 29,
    highlightOnMap: false,
    priorityTag: 'Control',
    actionLabel: 'Ver ruta →',
    coordinates: {
      normal: [-75.692, 4.8142],
    },
  },
  {
    id: 'alert-res-1',
    category: 'deviation',
    severity: 'resolved',
    status: 'resolved',
    badgeLabel: 'RESUELTA · 07:20',
    title: 'Desvío corregido · Ruta Norte',
    description:
      'Unidad BUS-01 retomó su trazado habitual sin novedades pendientes.',
    routeName: 'Ruta Norte',
    unitCode: 'BUS-01',
    studentRef: '#E-112',
    highlightOnMap: false,
    priorityTag: 'Control',
    actionLabel: 'Archivada',
    coordinates: {
      normal: [-75.6992, 4.8148],
    },
  },
];

export const INITIAL_TIMELINES: Record<string, StudentTransitionEntry[]> = {
  '#E-104': [
    {
      id: 't-104-1',
      time: '07:05',
      state: STUDENT_STATES[0], // EN_CASA
      detail: 'Registro inicial en paradero',
    },
    {
      id: 't-104-2',
      time: '07:18',
      state: STUDENT_STATES[1], // A_BORDO_VEHICULO
      detail: 'Abordaje confirmado · BUS-03',
    },
    {
      id: 't-104-3',
      time: '07:52',
      state: STUDENT_STATES[3], // RETORNO_SEDE_POR_FALLA_ENTREGA
      detail: 'Entrega no validada · Alerta roja',
    },
  ],
  '#E-109': [
    {
      id: 't-109-1',
      time: '06:55',
      state: STUDENT_STATES[0],
      detail: 'Registro inicial en paradero',
    },
    {
      id: 't-109-2',
      time: '07:12',
      state: STUDENT_STATES[1],
      detail: 'Abordaje confirmado · BUS-02 (+29 min)',
    },
  ],
  '#E-112': [
    {
      id: 't-112-1',
      time: '06:48',
      state: STUDENT_STATES[0],
      detail: 'Registro inicial en paradero',
    },
    {
      id: 't-112-2',
      time: '07:04',
      state: STUDENT_STATES[1],
      detail: 'Abordaje confirmado · BUS-01',
    },
    {
      id: 't-112-3',
      time: '07:38',
      state: STUDENT_STATES[2], // EN_COLEGIO
      detail: 'Entrega validada en sede escolar',
    },
  ],
};

export const STUDENT_STATE_CHIP_META: Record<
  StudentState,
  { label: string; icon: string; toneClass: string }
> = {
  EN_CASA: {
    label: 'En Casa/Espera',
    icon: '/icons/house-slate.svg',
    toneClass: 'bg-cs-surfaceInput text-cs-textBody border-cs-surfaceInput',
  },
  A_BORDO_VEHICULO: {
    label: 'A Bordo del Vehículo',
    icon: '/icons/bus-front-navy.svg',
    toneClass: 'bg-cs-infoBg text-cs-navy border-cs-infoBg',
  },
  EN_COLEGIO: {
    label: 'En Sede Escolar',
    icon: '/icons/circle-check.svg',
    toneClass: 'bg-cs-successBg text-cs-successText border-cs-successBorder',
  },
  RETORNO_SEDE_POR_FALLA_ENTREGA: {
    label: 'Retorno Seguro a Sede Escolar',
    icon: '/icons/school.svg',
    toneClass: 'bg-cs-warningBg text-cs-warningText border-cs-warningBg',
  },
};

export function sortAlertsByPriority(
  alerts: ReadonlyArray<ConsoleAlert>,
): ConsoleAlert[] {
  return [...alerts].sort(
    (a, b) => SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity],
  );
}

export function filterConsoleAlerts(
  alerts: ReadonlyArray<ConsoleAlert>,
  filters: AlertFilterCriteria,
): ConsoleAlert[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = alerts.filter((alert) => {
    if (filters.category !== 'all' && alert.category !== filters.category) {
      return false;
    }
    if (filters.routeName !== 'all' && alert.routeName !== filters.routeName) {
      return false;
    }
    if (filters.status !== 'all' && alert.status !== filters.status) {
      return false;
    }
    if (normalizedQuery) {
      const text = [
        alert.title,
        alert.description,
        alert.routeName,
        alert.unitCode,
        alert.studentRef,
      ]
        .join(' ')
        .toLowerCase();
      if (!text.includes(normalizedQuery)) return false;
    }
    return true;
  });

  return sortAlertsByPriority(filtered);
}

export function appendDomainTransition(
  timeline: ReadonlyArray<StudentTransitionEntry>,
  nextState: StudentState,
  time: string,
  detail: string,
): StudentTransitionEntry[] {
  const last = timeline[timeline.length - 1];
  if (last && !canTransitionTo(last.state, nextState)) {
    return [...timeline];
  }

  return [
    ...timeline,
    {
      id: `t-${Date.now()}-${timeline.length + 1}`,
      time,
      state: nextState,
      detail,
    },
  ];
}
