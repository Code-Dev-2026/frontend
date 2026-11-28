import { canTransitionTo, type StudentState } from '@camino/domain';
import type { OfflineQueueGateway } from '../../lib/offline/offline-queue';
import type {
  ActiveRouteData,
  ActiveRouteStop,
  ActiveRouteStudent,
} from './active-route-types';

export interface ActiveRouteGateway {
  fetchRoute(): Promise<ActiveRouteData | null>;
  updateStudentState(
    studentId: string,
    stopId: string,
    newState: StudentState,
    note?: string,
  ): Promise<ActiveRouteStudent>;
}

export const PROVISIONAL_ACTIVE_ROUTE: ActiveRouteData = {
  routeCode: 'Ruta 03',
  busCode: 'Bus 07',
  scheduleLabel: 'Jornada tarde · 15:00',
  campusName: 'Sede Norte',
  driverName: 'Cond. Carlos Rojas',
  capacity: 20,
  onBoardCount: 14,
  currentStopId: 'stop-2',
  stops: [
    {
      id: 'stop-1',
      name: 'Parada 1 · Parque Principal',
      address: 'Parque Principal, Cra 7 #10-20',
      order: 1,
      scheduledTime: '15:10',
      status: 'completed',
      students: [
        {
          id: 'std-101',
          fullName: 'Sofía Gómez',
          grade: 'Primaria · 3A',
          state: 'A_BORDO_VEHICULO',
          syncStatus: 'synced',
          authorizedAdultsCount: 2,
        },
        {
          id: 'std-102',
          fullName: 'Camilo Ruiz',
          grade: 'Primaria · 4B',
          state: 'A_BORDO_VEHICULO',
          syncStatus: 'synced',
          authorizedAdultsCount: 1,
        },
      ],
    },
    {
      id: 'stop-2',
      name: 'Parada 2 · Av. Bolívar #14-20',
      address: 'Av. Bolívar #14-20',
      order: 2,
      scheduledTime: '15:25',
      status: 'current',
      students: [
        {
          id: 'std-103',
          fullName: 'Lucía Ramírez',
          grade: 'Bachillerato · 7A',
          state: 'A_BORDO_VEHICULO',
          syncStatus: 'synced',
          authorizedAdultsCount: 2,
        },
        {
          id: 'std-104',
          fullName: 'Mateo Torres',
          grade: 'Primaria · 5C',
          state: 'EN_CASA',
          syncStatus: 'synced',
          authorizedAdultsCount: 2,
        },
      ],
    },
    {
      id: 'stop-3',
      name: 'Parada 3 · Conjunto Los Pinos',
      address: 'Calle 170 #12-30',
      order: 3,
      scheduledTime: '15:35',
      status: 'upcoming',
      students: [
        {
          id: 'std-105',
          fullName: 'Nicolás Silva',
          grade: 'Bachillerato · 9A',
          state: 'EN_CASA',
          syncStatus: 'synced',
          authorizedAdultsCount: 1,
        },
        {
          id: 'std-106',
          fullName: 'Mariana Duarte',
          grade: 'Primaria · 2B',
          state: 'EN_CASA',
          syncStatus: 'synced',
          authorizedAdultsCount: 2,
        },
      ],
    },
  ],
};

function cloneRoute(route: ActiveRouteData): ActiveRouteData {
  return {
    ...route,
    stops: route.stops.map((stop) => ({
      ...stop,
      students: stop.students.map((st) => ({ ...st })),
    })),
  };
}

export function createProvisionalActiveRouteGateway(
  offlineQueue?: OfflineQueueGateway,
  initialRoute: ActiveRouteData = PROVISIONAL_ACTIVE_ROUTE,
): ActiveRouteGateway {
  let inMemoryRoute = cloneRoute(initialRoute);

  return {
    async fetchRoute(): Promise<ActiveRouteData | null> {
      // Simula latencia de consulta
      await new Promise((resolve) => setTimeout(resolve, 350));
      return cloneRoute(inMemoryRoute);
    },

    async updateStudentState(
      studentId: string,
      stopId: string,
      newState: StudentState,
      note?: string,
    ): Promise<ActiveRouteStudent> {
      let targetStudent: ActiveRouteStudent | undefined;
      let targetStop: ActiveRouteStop | undefined;

      for (const stop of inMemoryRoute.stops) {
        if (stop.id === stopId) {
          targetStop = stop;
          const found = stop.students.find((s) => s.id === studentId);
          if (found) {
            targetStudent = found;
            break;
          }
        }
      }

      if (!targetStudent || !targetStop) {
        throw new Error(
          'Estudiante o parada no encontrados en la ruta activa.',
        );
      }

      // Validar transición según reglas de dominio
      if (!canTransitionTo(targetStudent.state, newState)) {
        throw new Error(
          `Transición no permitida de ${targetStudent.state} a ${newState}.`,
        );
      }

      // Encolar en la cola offline (determina si queda synced o pending)
      let recordSyncStatus = targetStudent.syncStatus;
      if (offlineQueue) {
        const record = await offlineQueue.enqueueAttendance({
          studentId,
          stopId,
          studentState: newState,
          note,
        });
        recordSyncStatus = record.syncStatus;
      }

      // Actualizar estado en memoria
      targetStudent.state = newState;
      targetStudent.syncStatus = recordSyncStatus;
      if (note) {
        targetStudent.notes = note;
      }

      // Recalcular contador a bordo si aplica
      let onBoard = 0;
      for (const stop of inMemoryRoute.stops) {
        for (const st of stop.students) {
          if (st.state === 'A_BORDO_VEHICULO') {
            onBoard += 1;
          }
        }
      }
      inMemoryRoute.onBoardCount = onBoard;

      return { ...targetStudent };
    },
  };
}
