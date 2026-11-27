import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import type { StudentRole } from '@camino/domain';

export type FleetVehicleStatus = 'En ruta' | 'Normal' | 'Detenido';

export interface ProvisionalFleetVehicle {
  id: string;
  code: string;
  routeName: string;
  routeCode: string;
  plate: string;
  capacityLabel: string;
  occupancyLabel: string;
  lastStop: string;
  lastPacketLabel: string;
  status: FleetVehicleStatus;
  latitude: number;
  longitude: number;
}

export interface ProvisionalMapStop {
  id: string;
  label: string;
  kind: 'stop' | 'child-stop' | 'geofence';
  latitude: number;
  longitude: number;
}

export type FleetConsoleViewState =
  'active' | 'loading' | 'empty' | 'error' | 'denied';

export const ALLOWED_FLEET_ROLES: ReadonlyArray<StudentRole> = [
  'COORDINADORA_CONVIVENCIA',
  'GERENCIA_TRANSPORTE',
];

export const ROLE_LABELS: Record<StudentRole, string> = {
  COORDINADORA_CONVIVENCIA: 'COORDINACIÓN',
  RECTORIA: 'RECTORÍA',
  GERENCIA_TRANSPORTE: 'GERENCIA TRANSPORTE',
  JEFE_OPERACIONES: 'JEFE OPERACIONES',
  ADMINISTRADOR_CARTERA: 'ADMINISTRADOR_CARTERA',
  MONITORA: 'MONITORA',
  CONDUCTOR: 'CONDUCTOR',
  ACUDIENTE: 'ACUDIENTE',
};

export const ROLE_DENIED_RF19_MESSAGE = API_ERROR_MESSAGES.role_not_allowed;

/**
 * RF-19: la consola global de flota está restringida a Coordinación y
 * Gerencia de Transporte. La autorización real es responsabilidad del backend.
 */
export function canAccessFleetConsole(role: StudentRole): boolean {
  return ALLOWED_FLEET_ROLES.includes(role);
}

/**
 * Posiciones simuladas PROVISIONAL mientras el backend define el contrato de
 * eventos Socket.IO (packages/contracts/src/realtime-events.ts).
 */
export const INITIAL_PROVISIONAL_FLEET: ReadonlyArray<ProvisionalFleetVehicle> =
  [
    {
      id: 'bus-01',
      code: 'BUS-01',
      routeName: 'Ruta Norte',
      routeCode: 'R-01',
      plate: 'WPK-412',
      capacityLabel: 'Buseta 18 pax',
      occupancyLabel: '14 / 18 estudiantes a bordo',
      lastStop: 'Av. Circunvalar #14-20',
      lastPacketLabel: 'Hace 8 s (simulado)',
      status: 'En ruta',
      latitude: 4.8148,
      longitude: -75.6992,
    },
    {
      id: 'bus-02',
      code: 'BUS-02',
      routeName: 'Ruta Centro',
      routeCode: 'R-02',
      plate: 'TJM-804',
      capacityLabel: 'Buseta 22 pax',
      occupancyLabel: '18 / 22 estudiantes a bordo',
      lastStop: 'Parque La Libertad',
      lastPacketLabel: 'Hace 5 s (simulado)',
      status: 'Normal',
      latitude: 4.8124,
      longitude: -75.6915,
    },
    {
      id: 'bus-03',
      code: 'BUS-03',
      routeName: 'Ruta Sur',
      routeCode: 'R-03',
      plate: 'KLR-219',
      capacityLabel: 'Van 15 pax',
      occupancyLabel: '9 / 15 estudiantes a bordo',
      lastStop: 'Av. 30 de Agosto #42-10',
      lastPacketLabel: 'Hace 46 s (simulado)',
      status: 'Detenido',
      latitude: 4.8089,
      longitude: -75.7024,
    },
  ];

export const PROVISIONAL_ROUTE_STOPS: ReadonlyArray<ProvisionalMapStop> = [
  {
    id: 'stop-1',
    label: 'Parada',
    kind: 'stop',
    latitude: 4.8108,
    longitude: -75.6968,
  },
  {
    id: 'stop-2',
    label: 'Parada del hijo',
    kind: 'child-stop',
    latitude: 4.8152,
    longitude: -75.6894,
  },
  {
    id: 'geofence-1',
    label: 'Geocerca',
    kind: 'geofence',
    latitude: 4.8129,
    longitude: -75.6852,
  },
];

export const PROVISIONAL_ROUTE_POLYLINE: ReadonlyArray<[number, number]> = [
  [-75.7028, 4.8108],
  [-75.6968, 4.8108],
  [-75.6968, 4.8152],
  [-75.6894, 4.8152],
  [-75.6894, 4.8129],
  [-75.6845, 4.8129],
];

export function filterFleetUnits(
  vehicles: ReadonlyArray<ProvisionalFleetVehicle>,
  query: string,
): ProvisionalFleetVehicle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...vehicles];
  }

  return vehicles.filter((vehicle) => {
    const haystack = [
      vehicle.code,
      vehicle.routeName,
      vehicle.routeCode,
      vehicle.plate,
      vehicle.lastStop,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function applySimulatedTelemetryPulse(
  vehicles: ReadonlyArray<ProvisionalFleetVehicle>,
  pulseCount: number,
): ProvisionalFleetVehicle[] {
  return vehicles.map((vehicle, index) => {
    const deltaLat =
      vehicle.status === 'Detenido' ? 0 : (index % 2 === 0 ? 1 : -1) * 0.00045;
    const deltaLng = vehicle.status === 'Detenido' ? 0 : 0.00055;

    return {
      ...vehicle,
      latitude: Number((vehicle.latitude + deltaLat).toFixed(5)),
      longitude: Number((vehicle.longitude + deltaLng).toFixed(5)),
      lastPacketLabel:
        vehicle.status === 'Detenido'
          ? `Hace ${46 + pulseCount * 5} s (simulado)`
          : 'Justo ahora (simulado)',
    };
  });
}
