import { describe, expect, it } from 'vitest';
import { assertMaxAuthorizedAdults, canTransitionTo, shouldShowCustodyMap, STUDENT_STATES, createUuidV7 } from './index';

describe('domain state machine', () => {
  it('allows valid transitions', () => {
    expect(canTransitionTo('EN_CASA', 'A_BORDO_VEHICULO')).toBe(true);
    expect(canTransitionTo('A_BORDO_VEHICULO', 'EN_COLEGIO')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransitionTo('EN_COLEGIO', 'A_BORDO_VEHICULO')).toBe(false);
  });

  it('enforces capacity guard', () => {
    expect(() => assertMaxAuthorizedAdults(4)).toThrow('DENEGADO_SOBRECUPO');
    expect(assertMaxAuthorizedAdults(3)).toBe(true);
  });

  it('shows the map only while the student is aboard', () => {
    expect(shouldShowCustodyMap('A_BORDO_VEHICULO')).toBe(true);
    expect(shouldShowCustodyMap('EN_CASA')).toBe(false);
  });

  it('keeps the canonical state list and valid v7 uuid generation', () => {
    expect(STUDENT_STATES).toHaveLength(4);
    expect(createUuidV7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
