import type { ProvisionalRealtimeEvent } from './realtime-events';

export type RealtimeEventListener = (event: ProvisionalRealtimeEvent) => void;

export function startRealtimeSimulator(
  emit: RealtimeEventListener,
  intervalMilliseconds = 5_000,
): () => void {
  if (!Number.isFinite(intervalMilliseconds) || intervalMilliseconds < 1) {
    throw new RangeError('El intervalo del simulador debe ser positivo.');
  }

  let sequence = 0;
  const emitSnapshot = () => {
    const recordedAt = new Date().toISOString();
    emit({
      name: 'bus.position.updated',
      payload: {
        busId: 'DEMO-BUS',
        latitude: 4.8133 + sequence * 0.0001,
        longitude: -75.6961 + sequence * 0.0001,
        recordedAt,
      },
    });
    emit({
      name: 'student.status.changed',
      payload: {
        studentId: 'DEMO-STUDENT',
        status: 'A_BORDO_VEHICULO',
        changedAt: recordedAt,
      },
    });
    sequence += 1;
  };

  emitSnapshot();
  const timer = setInterval(emitSnapshot, intervalMilliseconds);
  return () => clearInterval(timer);
}
