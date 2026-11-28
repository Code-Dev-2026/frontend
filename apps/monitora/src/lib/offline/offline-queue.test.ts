import { describe, expect, it } from 'vitest';
import { createProvisionalOfflineQueue } from './offline-queue';

describe('OfflineQueueGateway', () => {
  it('inicializa con conectividad en línea y estadísticas vacías', () => {
    const queue = createProvisionalOfflineQueue('online');
    expect(queue.getConnectivityState()).toBe('online');
    const stats = queue.getStats();
    expect(stats.pendingCount).toBe(0);
    expect(stats.syncedCount).toBe(0);
    expect(stats.totalCount).toBe(0);
  });

  it('guarda como sincronizado cuando está en línea', async () => {
    const queue = createProvisionalOfflineQueue('online');
    const record = await queue.enqueueAttendance({
      studentId: 'std-1',
      stopId: 'stop-1',
      studentState: 'A_BORDO_VEHICULO',
    });

    expect(record.syncStatus).toBe('synced');
    expect(record.studentId).toBe('std-1');
    expect(record.studentState).toBe('A_BORDO_VEHICULO');

    const stats = queue.getStats();
    expect(stats.pendingCount).toBe(0);
    expect(stats.syncedCount).toBe(1);
  });

  it('guarda como pendiente cuando está sin señal (offline)', async () => {
    const queue = createProvisionalOfflineQueue('offline');
    const record = await queue.enqueueAttendance({
      studentId: 'std-2',
      stopId: 'stop-2',
      studentState: 'A_BORDO_VEHICULO',
    });

    expect(record.syncStatus).toBe('pending');
    const stats = queue.getStats();
    expect(stats.pendingCount).toBe(1);
    expect(stats.syncedCount).toBe(0);
  });

  it('sincroniza registros pendientes y cambia estado a online', async () => {
    const queue = createProvisionalOfflineQueue('offline');
    await queue.enqueueAttendance({
      studentId: 'std-1',
      stopId: 'stop-1',
      studentState: 'A_BORDO_VEHICULO',
    });
    await queue.enqueueAttendance({
      studentId: 'std-2',
      stopId: 'stop-1',
      studentState: 'A_BORDO_VEHICULO',
    });

    expect(queue.getStats().pendingCount).toBe(2);

    const result = await queue.syncPending();
    expect(result.syncedCount).toBe(2);
    expect(queue.getConnectivityState()).toBe('online');
    expect(queue.getStats().pendingCount).toBe(0);
    expect(queue.getStats().syncedCount).toBe(2);
  });

  it('notifica a los suscriptores ante cambios de conectividad o registros', async () => {
    const queue = createProvisionalOfflineQueue('online');
    let callCount = 0;
    const unsubscribe = queue.subscribe(() => {
      callCount += 1;
    });

    queue.setConnectivityState('offline');
    expect(callCount).toBe(1);

    await queue.enqueueAttendance({
      studentId: 'std-3',
      stopId: 'stop-1',
      studentState: 'EN_COLEGIO',
    });
    expect(callCount).toBe(2);

    unsubscribe();
    queue.setConnectivityState('online');
    expect(callCount).toBe(2);
  });
});
