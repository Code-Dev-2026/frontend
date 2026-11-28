import { describe, expect, it } from 'vitest';
import { createProvisionalOfflineQueue } from '../../lib/offline/offline-queue';
import { createProvisionalActiveRouteGateway } from './active-route-gateway';

describe('ActiveRouteGateway', () => {
  it('obtiene la ruta activa inicial con 3 paradas y ocupación inicial', async () => {
    const queue = createProvisionalOfflineQueue('online');
    const gateway = createProvisionalActiveRouteGateway(queue);

    const route = await gateway.fetchRoute();
    expect(route).toBeDefined();
    expect(route?.routeCode).toBe('Ruta 03');
    expect(route?.busCode).toBe('Bus 07');
    expect(route?.stops.length).toBe(3);
    expect(route?.currentStopId).toBe('stop-2');
    expect(route?.stops[1]?.status).toBe('current');
  });

  it('permite transición válida EN_CASA -> A_BORDO_VEHICULO y actualiza ocupación', async () => {
    const queue = createProvisionalOfflineQueue('online');
    const gateway = createProvisionalActiveRouteGateway(queue);

    // std-104 en stop-2 está inicialmente EN_CASA
    const updated = await gateway.updateStudentState(
      'std-104',
      'stop-2',
      'A_BORDO_VEHICULO',
    );

    expect(updated.state).toBe('A_BORDO_VEHICULO');
    expect(updated.syncStatus).toBe('synced');

    const route = await gateway.fetchRoute();
    expect(route).toBeDefined();
    const stop2 = route?.stops.find((s) => s.id === 'stop-2');
    const student = stop2?.students.find((s) => s.id === 'std-104');
    expect(student?.state).toBe('A_BORDO_VEHICULO');
    expect(student?.syncStatus).toBe('synced');
  });

  it('rechaza transición no permitida por reglas de dominio (ej. EN_CASA -> EN_COLEGIO)', async () => {
    const queue = createProvisionalOfflineQueue('online');
    const gateway = createProvisionalActiveRouteGateway(queue);

    await expect(
      gateway.updateStudentState('std-105', 'stop-3', 'EN_COLEGIO'),
    ).rejects.toThrow('Transición no permitida de EN_CASA a EN_COLEGIO.');
  });

  it('marca syncStatus como pending cuando la cola está sin señal', async () => {
    const queue = createProvisionalOfflineQueue('offline');
    const gateway = createProvisionalActiveRouteGateway(queue);

    const updated = await gateway.updateStudentState(
      'std-104',
      'stop-2',
      'A_BORDO_VEHICULO',
    );

    expect(updated.state).toBe('A_BORDO_VEHICULO');
    expect(updated.syncStatus).toBe('pending');

    const stats = queue.getStats();
    expect(stats.pendingCount).toBe(1);
  });

  it('arroja error si el estudiante o parada no existen', async () => {
    const queue = createProvisionalOfflineQueue('online');
    const gateway = createProvisionalActiveRouteGateway(queue);

    await expect(
      gateway.updateStudentState(
        'std-inexistente',
        'stop-1',
        'A_BORDO_VEHICULO',
      ),
    ).rejects.toThrow('Estudiante o parada no encontrados en la ruta activa.');
  });
});
