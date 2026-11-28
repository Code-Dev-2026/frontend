import type { StudentState } from '@camino/domain';

export type QueueConnectivityState = 'online' | 'offline' | 'syncing';

export type QueueSyncStatus = 'synced' | 'pending';

export type OfflineQueueRecord = {
  id: string;
  studentId: string;
  stopId: string;
  studentState: StudentState;
  timestamp: string;
  syncStatus: QueueSyncStatus;
  note?: string;
};

export type EnqueueAttendanceParams = {
  studentId: string;
  stopId: string;
  studentState: StudentState;
  note?: string;
};

export type OfflineQueueStats = {
  connectivity: QueueConnectivityState;
  pendingCount: number;
  syncedCount: number;
  totalCount: number;
  lastSyncLabel: string;
};

export interface OfflineQueueGateway {
  getConnectivityState(): QueueConnectivityState;
  setConnectivityState(state: QueueConnectivityState): void;
  getRecords(): OfflineQueueRecord[];
  getRecordForStudent(studentId: string): OfflineQueueRecord | undefined;
  getStats(): OfflineQueueStats;
  enqueueAttendance(
    params: EnqueueAttendanceParams,
  ): Promise<OfflineQueueRecord>;
  syncPending(): Promise<{ syncedCount: number; lastSyncLabel: string }>;
  subscribe(listener: () => void): () => void;
}

function formatCurrentTimeLabel(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `Hoy, ${hours}:${minutes}`;
}

export function createProvisionalOfflineQueue(
  initialConnectivity: QueueConnectivityState = 'online',
  initialRecords: OfflineQueueRecord[] = [],
): OfflineQueueGateway {
  let connectivityState: QueueConnectivityState = initialConnectivity;
  const recordsMap = new Map<string, OfflineQueueRecord>();
  let lastSyncLabel = formatCurrentTimeLabel();
  const listeners = new Set<() => void>();

  for (const record of initialRecords) {
    recordsMap.set(record.id, record);
  }

  function notify() {
    for (const listener of listeners) {
      try {
        listener();
      } catch {
        // Ignorar errores de suscriptores individuales
      }
    }
  }

  return {
    getConnectivityState() {
      return connectivityState;
    },

    setConnectivityState(state: QueueConnectivityState) {
      if (connectivityState === state) return;
      connectivityState = state;
      notify();
    },

    getRecords() {
      return Array.from(recordsMap.values());
    },

    getRecordForStudent(studentId: string) {
      for (const record of recordsMap.values()) {
        if (record.studentId === studentId) {
          return record;
        }
      }
      return undefined;
    },

    getStats() {
      let pendingCount = 0;
      let syncedCount = 0;
      for (const record of recordsMap.values()) {
        if (record.syncStatus === 'pending') {
          pendingCount += 1;
        } else {
          syncedCount += 1;
        }
      }

      return {
        connectivity: connectivityState,
        pendingCount,
        syncedCount,
        totalCount: recordsMap.size,
        lastSyncLabel,
      };
    },

    async enqueueAttendance(params: EnqueueAttendanceParams) {
      // Simula pequeña latencia de persistencia local
      await new Promise((resolve) => setTimeout(resolve, 80));

      const isOffline = connectivityState === 'offline';
      const recordId = `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newRecord: OfflineQueueRecord = {
        id: recordId,
        studentId: params.studentId,
        stopId: params.stopId,
        studentState: params.studentState,
        timestamp: new Date().toISOString(),
        syncStatus: isOffline ? 'pending' : 'synced',
        note: params.note,
      };

      recordsMap.set(recordId, newRecord);
      notify();
      return newRecord;
    },

    async syncPending() {
      connectivityState = 'syncing';
      notify();

      // Simula envío a red
      await new Promise((resolve) => setTimeout(resolve, 450));

      let newlySynced = 0;
      for (const [id, record] of recordsMap.entries()) {
        if (record.syncStatus === 'pending') {
          recordsMap.set(id, {
            ...record,
            syncStatus: 'synced',
          });
          newlySynced += 1;
        }
      }

      connectivityState = 'online';
      lastSyncLabel = formatCurrentTimeLabel();
      notify();

      return {
        syncedCount: newlySynced,
        lastSyncLabel,
      };
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
