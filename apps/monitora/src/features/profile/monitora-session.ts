export type MonitoraNavTab = 'inicio' | 'ruta' | 'perfil';

export type MonitoraHomeStatus = 'assigned' | 'offline' | 'empty' | 'loading';

export type MonitoraConnectivityStatus = 'online' | 'offline';

export type MonitoraShiftSummary = {
  routeCode: string;
  busCode: string;
  statusLabel: string;
  scheduleLabel: string;
  campusName: string;
  driverName: string;
  stopsCount: number;
  onBoardCount: number;
  capacity: number;
};

export type MonitoraProfileData = {
  fullName: string;
  shortName: string;
  initials: string;
  email: string;
  verified: boolean;
  shiftLabel: string;
  routeAssignmentLabel: string;
  vehicleLabel: string;
  campusLabel: string;
  lastSyncLabel: string;
};

export type MonitoraSessionSnapshot = {
  profile: MonitoraProfileData;
  initialPendingSyncCount: number;
};

export interface MonitoraSessionGateway {
  getSessionSnapshot(): MonitoraSessionSnapshot;
  fetchShift(): Promise<MonitoraShiftSummary | null>;
  syncOfflineQueue(): Promise<{
    pendingSyncCount: number;
    lastSyncLabel: string;
  }>;
  logout(): Promise<void>;
}

// PROVISIONAL: datos basados en los frames FE-29 de `04 App Monitora` en Figma
// mientras se conectan endpoints reales de turnos, cola offline y logout (FE-05).
const DEFAULT_PROVISIONAL_PROFILE: MonitoraProfileData = {
  fullName: 'María Camila Ríos',
  shortName: 'María Camila',
  initials: 'MC',
  email: 'monitora@caminoseguro.edu.co',
  verified: true,
  shiftLabel: 'Jornada tarde · Hoy, 15:00',
  routeAssignmentLabel: 'Ruta 03 · Jornada tarde',
  vehicleLabel: 'Bus 07 (Capacidad: 20)',
  campusLabel: 'Sede Norte',
  lastSyncLabel: 'Hoy, 15:25',
};

const PROVISIONAL_SHIFT: MonitoraShiftSummary = {
  routeCode: 'Ruta 03',
  busCode: 'Bus 07',
  statusLabel: 'Activa',
  scheduleLabel: '15:00',
  campusName: 'Sede Norte',
  driverName: 'Cond. Carlos Rojas',
  stopsCount: 3,
  onBoardCount: 14,
  capacity: 20,
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCurrentTimeLabel(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `Hoy, ${hours}:${minutes}`;
}

export function createProvisionalMonitoraSessionGateway(
  sessionEmail?: string,
): MonitoraSessionGateway {
  const normalizedEmail = sessionEmail?.trim().toLowerCase() ?? '';
  const isEmptyShiftAccount = normalizedEmail.includes('sinruta');
  const startsWithPendingQueue = normalizedEmail.includes('pendiente');

  const profile: MonitoraProfileData = {
    ...DEFAULT_PROVISIONAL_PROFILE,
    email: normalizedEmail || DEFAULT_PROVISIONAL_PROFILE.email,
    routeAssignmentLabel: isEmptyShiftAccount
      ? 'Sin ruta asignada'
      : DEFAULT_PROVISIONAL_PROFILE.routeAssignmentLabel,
    vehicleLabel: isEmptyShiftAccount
      ? 'Sin vehículo asignado'
      : DEFAULT_PROVISIONAL_PROFILE.vehicleLabel,
  };

  return {
    getSessionSnapshot() {
      return {
        profile,
        initialPendingSyncCount: startsWithPendingQueue ? 2 : 0,
      };
    },

    async fetchShift() {
      await wait(600);
      if (isEmptyShiftAccount) {
        return null;
      }
      return PROVISIONAL_SHIFT;
    },

    async syncOfflineQueue() {
      await wait(450);
      return {
        pendingSyncCount: 0,
        lastSyncLabel: formatCurrentTimeLabel(),
      };
    },

    async logout() {
      await wait(200);
    },
  };
}
