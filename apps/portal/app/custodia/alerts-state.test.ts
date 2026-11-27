import { STUDENT_STATES } from '@camino/domain';
import { describe, expect, it } from 'vitest';
import {
  appendDomainTransition,
  filterConsoleAlerts,
  INITIAL_ALERTS,
  INITIAL_TIMELINES,
} from './alerts-state';

describe('FE-22 Consola de alertas rojas, desvíos y transiciones', () => {
  it('ordena por severidad y filtra por tipo, ruta, estado y búsqueda', () => {
    const activeAll = filterConsoleAlerts(INITIAL_ALERTS, {
      category: 'all',
      routeName: 'all',
      status: 'active',
      query: '',
    });
    expect(activeAll.map((a) => a.severity)).toEqual([
      'critical',
      'high',
      'medium',
    ]);

    const onlyDeviations = filterConsoleAlerts(INITIAL_ALERTS, {
      category: 'deviation',
      routeName: 'Ruta Sur',
      status: 'active',
      query: '420',
    });
    expect(onlyDeviations).toHaveLength(1);
    expect(onlyDeviations[0]?.unitCode).toBe('BUS-03');
  });

  it('valida transiciones de estado del estudiante con reglas de @camino/domain', () => {
    const base = [
      INITIAL_TIMELINES['#E-104']![0]!,
      INITIAL_TIMELINES['#E-104']![1]!,
    ];
    const invalid = appendDomainTransition(
      base,
      STUDENT_STATES[0], // A_BORDO_VEHICULO -> EN_CASA no permitida directo
      '08:00',
      'Transición inválida',
    );
    expect(invalid).toHaveLength(2);

    const valid = appendDomainTransition(
      base,
      STUDENT_STATES[3], // A_BORDO_VEHICULO -> RETORNO_SEDE_POR_FALLA_ENTREGA
      '08:01',
      'Falla de entrega',
    );
    expect(valid).toHaveLength(3);
    expect(valid[2]?.state).toBe('RETORNO_SEDE_POR_FALLA_ENTREGA');
  });
});
