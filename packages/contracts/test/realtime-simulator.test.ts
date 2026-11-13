import { afterEach, describe, expect, it, vi } from 'vitest';
import { startRealtimeSimulator } from '../src/realtime-simulator';

afterEach(() => {
  vi.useRealTimers();
});

describe('provisional realtime simulator', () => {
  it('emits both provisional event types and stops when disposed', () => {
    vi.useFakeTimers();
    const emit = vi.fn();
    const stop = startRealtimeSimulator(emit, 1_000);

    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ name: 'bus.position.updated' }),
    );
    expect(emit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ name: 'student.status.changed' }),
    );

    vi.advanceTimersByTime(1_000);
    expect(emit).toHaveBeenCalledTimes(4);

    stop();
    vi.advanceTimersByTime(1_000);
    expect(emit).toHaveBeenCalledTimes(4);
  });

  it('rejects a non-positive interval', () => {
    expect(() => startRealtimeSimulator(vi.fn(), 0)).toThrow(RangeError);
  });
});
