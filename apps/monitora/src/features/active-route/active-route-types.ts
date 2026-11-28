import type { StudentState } from '@camino/domain';
import type { QueueSyncStatus } from '../../lib/offline/offline-queue';

export type ActiveRouteStudent = {
  id: string;
  fullName: string;
  grade: string;
  state: StudentState;
  syncStatus: QueueSyncStatus;
  authorizedAdultsCount: number;
  hasCustodyAlert?: boolean;
  notes?: string;
};

export type StopStatus = 'completed' | 'current' | 'upcoming';

export type ActiveRouteStop = {
  id: string;
  name: string;
  address: string;
  order: number;
  scheduledTime: string;
  status: StopStatus;
  students: ActiveRouteStudent[];
};

export type ActiveRouteData = {
  routeCode: string;
  busCode: string;
  scheduleLabel: string;
  campusName: string;
  driverName: string;
  capacity: number;
  onBoardCount: number;
  currentStopId: string;
  stops: ActiveRouteStop[];
};

export type ActiveRouteVisualState =
  'online' | 'offline' | 'syncing' | 'loading';
