import {
  API_ERROR_MESSAGES,
  createApiError,
  type ApiError,
} from '@camino/contracts/http';
import { getRoutesControllerGetRouteUrl } from '@camino/contracts/routes';
import type { StudentRole } from '@camino/domain';

export type DrawToolMode = 'select' | 'add_stop' | 'reorder' | 'delete';

export type RouteStatus = 'Borrador' | 'Publicada';

export interface RouteStopItem {
  id: string;
  order: number;
  name: string;
  zoneLabel: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  isSchoolDestination?: boolean;
  validationIssue?: string;
}

export interface RouteDraftModel {
  id: string;
  code: string;
  name: string;
  busCode: string;
  status: RouteStatus;
  version: number;
  publishedSummary: {
    distanceLabel: string;
    durationLabel: string;
    publishedBy: string;
  };
  stops: RouteStopItem[];
}

export interface RouteDesignerCapabilities {
  canEdit: boolean;
  roleLabel: string;
}

const ROUTE_EDITOR_ROLES: ReadonlyArray<StudentRole> = [
  'COORDINADORA_CONVIVENCIA',
  'GERENCIA_TRANSPORTE',
];

const ROLE_BADGE_LABELS: Record<StudentRole, string> = {
  COORDINADORA_CONVIVENCIA: 'COORDINACIÓN',
  GERENCIA_TRANSPORTE: 'GERENCIA TRANSPORTE',
  RECTORIA: 'SOLO LECTURA',
  JEFE_OPERACIONES: 'SOLO LECTURA',
  ADMINISTRADOR_CARTERA: 'SOLO LECTURA',
  MONITORA: 'SOLO LECTURA',
  CONDUCTOR: 'SOLO LECTURA',
  ACUDIENTE: 'SOLO LECTURA',
};

export const ROUTE_VALIDATION_ERROR_MESSAGE =
  API_ERROR_MESSAGES.VALIDATION_ERROR;

export function getRouteDesignerCapabilities(
  role: StudentRole,
): RouteDesignerCapabilities {
  return {
    canEdit: ROUTE_EDITOR_ROLES.includes(role),
    roleLabel: ROLE_BADGE_LABELS[role],
  };
}

export const INITIAL_ROUTE_DRAFT: RouteDraftModel = {
  id: 'rut-nor-01',
  code: 'RUT-NOR-01',
  name: 'Ruta Norte · Jornada AM',
  busCode: 'BUS-01',
  status: 'Borrador',
  version: 3,
  publishedSummary: {
    distanceLabel: '14.2 km',
    durationLabel: '30 min',
    publishedBy: 'Coordinación',
  },
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Av. Circunvalar #14-20',
      zoneLabel: 'Zona Norte',
      latitude: 4.8124,
      longitude: -75.6911,
      scheduledTime: '06:10',
    },
    {
      id: 'stop-2',
      order: 2,
      name: 'Parque La Libertad',
      zoneLabel: 'Zona Centro',
      latitude: 4.8141,
      longitude: -75.6968,
      scheduledTime: '06:18',
    },
    {
      id: 'stop-3',
      order: 3,
      name: 'Barrio Álamos Cra 8',
      zoneLabel: 'Zona Sur',
      latitude: 4.8087,
      longitude: -75.6894,
      scheduledTime: '06:26',
    },
    {
      id: 'stop-4',
      order: 4,
      name: 'Colegio San Benito del Otún',
      zoneLabel: 'Destino institucional final',
      latitude: 4.8134,
      longitude: -75.6852,
      scheduledTime: '06:40',
      isSchoolDestination: true,
    },
  ],
};

function reindexStops(stops: ReadonlyArray<RouteStopItem>): RouteStopItem[] {
  return stops.map((stop, idx) => ({
    ...stop,
    order: idx + 1,
  }));
}

export function addStopBeforeDestination(
  stops: ReadonlyArray<RouteStopItem>,
  coords: { latitude: number; longitude: number },
  name?: string,
  scheduledTime = '06:30',
): { stops: RouteStopItem[]; added: RouteStopItem } {
  const newStop: RouteStopItem = {
    id: `stop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    order: stops.length,
    name: name?.trim() || `Parada ${stops.length}`,
    zoneLabel: 'Zona asignada',
    latitude: Number(coords.latitude.toFixed(4)),
    longitude: Number(coords.longitude.toFixed(4)),
    scheduledTime,
  };

  const destIndex = stops.findIndex((s) => s.isSchoolDestination);
  const next = [...stops];
  if (destIndex >= 0) {
    next.splice(destIndex, 0, newStop);
  } else {
    next.push(newStop);
  }

  const reindexed = reindexStops(next);
  const added =
    reindexed.find((s) => s.id === newStop.id) ??
    reindexed[reindexed.length - 1] ??
    newStop;

  return { stops: reindexed, added };
}

export function moveStopByDelta(
  stops: ReadonlyArray<RouteStopItem>,
  stopId: string,
  delta: -1 | 1,
): RouteStopItem[] {
  const index = stops.findIndex((s) => s.id === stopId);
  if (index < 0) return [...stops];
  const current = stops[index];
  if (!current || current.isSchoolDestination) return [...stops];

  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= stops.length) return [...stops];
  const target = stops[targetIndex];
  if (!target || target.isSchoolDestination) return [...stops];

  const next = [...stops];
  next[index] = target;
  next[targetIndex] = current;
  return reindexStops(next);
}

export function removeStopById(
  stops: ReadonlyArray<RouteStopItem>,
  stopId: string,
): RouteStopItem[] {
  const target = stops.find((s) => s.id === stopId);
  if (!target || target.isSchoolDestination) return [...stops];
  return reindexStops(stops.filter((s) => s.id !== stopId));
}

export function updateStopScheduleTime(
  stops: ReadonlyArray<RouteStopItem>,
  stopId: string,
  scheduledTime: string,
): RouteStopItem[] {
  return stops.map((stop) =>
    stop.id === stopId
      ? {
          ...stop,
          scheduledTime,
          validationIssue: undefined,
        }
      : stop,
  );
}

function toMinutes(hhmm: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export type SaveRouteResult =
  | {
      ok: true;
      endpoint: string;
      stops: RouteStopItem[];
    }
  | {
      ok: false;
      endpoint: string;
      error: ApiError;
      detailMessage: string;
      invalidStopId: string;
      stops: RouteStopItem[];
    };

/**
 * Simula la validación del servidor contra @camino/contracts/routes:
 * el trazado y el cálculo de distancias los realiza el backend; aquí solo se
 * reflejan observaciones devueltas (ej. horario anterior a parada previa o zona
 * fuera de cobertura) usando el catálogo oficial ApiError.
 */
export function validateAndSaveRouteMock(
  draft: RouteDraftModel,
  publish = false,
): SaveRouteResult {
  const endpoint = getRoutesControllerGetRouteUrl(draft.id);
  const stopsWithIssues: RouteStopItem[] = draft.stops.map((s) => ({
    ...s,
    validationIssue: undefined,
  }));

  if (stopsWithIssues.length < 2) {
    const firstId = stopsWithIssues[0]?.id ?? '';
    return {
      ok: false,
      endpoint,
      error: createApiError(400, { code: 'VALIDATION_ERROR' }),
      detailMessage:
        'La ruta debe incluir al menos una parada de recogida y el destino escolar.',
      invalidStopId: firstId,
      stops: stopsWithIssues,
    };
  }

  let prevMinutes = -1;
  let prevOrder = 0;
  let prevTimeLabel = '';

  for (let i = 0; i < stopsWithIssues.length; i += 1) {
    const stop = stopsWithIssues[i];
    if (!stop) continue;

    const currentMinutes = toMinutes(stop.scheduledTime);
    const isOutOfZone =
      stop.latitude < 4.78 ||
      stop.latitude > 4.85 ||
      stop.longitude < -75.75 ||
      stop.longitude > -75.64 ||
      stop.zoneLabel.toLowerCase().includes('sin zona');

    if (
      currentMinutes === null ||
      (prevMinutes >= 0 && currentMinutes <= prevMinutes)
    ) {
      const msg =
        prevMinutes >= 0
          ? `Horario (${stop.scheduledTime}) debe ser posterior a la parada ${prevOrder} (${prevTimeLabel}).`
          : `Horario inválido en parada ${stop.order}.`;
      stopsWithIssues[i] = { ...stop, validationIssue: msg };
      return {
        ok: false,
        endpoint,
        error: createApiError(400, { code: 'VALIDATION_ERROR' }),
        detailMessage: `Corrige la parada ${stop.order}: ${msg}`,
        invalidStopId: stop.id,
        stops: stopsWithIssues,
      };
    }

    if (isOutOfZone) {
      const msg = `La parada ${stop.order} (${stop.name}) se encuentra fuera del área de cobertura autorizada.`;
      stopsWithIssues[i] = { ...stop, validationIssue: msg };
      return {
        ok: false,
        endpoint,
        error: createApiError(400, { code: 'VALIDATION_ERROR' }),
        detailMessage: msg,
        invalidStopId: stop.id,
        stops: stopsWithIssues,
      };
    }

    prevMinutes = currentMinutes;
    prevOrder = stop.order;
    prevTimeLabel = stop.scheduledTime;
  }

  return {
    ok: true,
    endpoint,
    stops: stopsWithIssues.map((s) => ({ ...s, validationIssue: undefined })),
    ...(publish ? {} : {}),
  };
}
