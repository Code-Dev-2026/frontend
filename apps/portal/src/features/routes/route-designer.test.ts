import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import { describe, expect, it } from 'vitest';
import {
  addStopBeforeDestination,
  getRouteDesignerCapabilities,
  INITIAL_ROUTE_DRAFT,
  moveStopByDelta,
  removeStopById,
  updateStopScheduleTime,
  validateAndSaveRouteMock,
} from './route-designer';

describe('FE-27 Diseñador de rutas (mapa y paradas)', () => {
  it('permite edición solo a roles autorizados y deja otros roles en solo lectura', () => {
    expect(
      getRouteDesignerCapabilities('COORDINADORA_CONVIVENCIA').canEdit,
    ).toBe(true);
    expect(getRouteDesignerCapabilities('GERENCIA_TRANSPORTE').canEdit).toBe(
      true,
    );
    expect(getRouteDesignerCapabilities('JEFE_OPERACIONES').canEdit).toBe(
      false,
    );
    expect(getRouteDesignerCapabilities('MONITORA').canEdit).toBe(false);
    expect(getRouteDesignerCapabilities('ACUDIENTE').canEdit).toBe(false);
  });

  it('agrega, reordena y elimina paradas manteniendo el destino escolar al final', () => {
    const added = addStopBeforeDestination(
      INITIAL_ROUTE_DRAFT.stops,
      { latitude: 4.8105, longitude: -75.6942 },
      'Estación Parque Olaya',
      '06:32',
    );
    expect(added.stops).toHaveLength(5);
    expect(added.stops[4]?.isSchoolDestination).toBe(true);
    expect(added.stops[3]?.name).toBe('Estación Parque Olaya');

    const moved = moveStopByDelta(added.stops, 'stop-2', -1);
    expect(moved[0]?.id).toBe('stop-2');
    expect(moved[0]?.order).toBe(1);

    const removed = removeStopById(moved, added.added.id);
    expect(removed).toHaveLength(4);
    expect(removed[3]?.isSchoolDestination).toBe(true);
  });

  it('valida horarios en secuencia contra @camino/contracts/routes y devuelve VALIDATION_ERROR', () => {
    const valid = validateAndSaveRouteMock(INITIAL_ROUTE_DRAFT);
    expect(valid.ok).toBe(true);

    const invalidStops = updateStopScheduleTime(
      INITIAL_ROUTE_DRAFT.stops,
      'stop-3',
      '06:15',
    );
    const failed = validateAndSaveRouteMock({
      ...INITIAL_ROUTE_DRAFT,
      stops: invalidStops,
    });
    expect(failed.ok).toBe(false);
    if (!failed.ok) {
      expect(failed.error.code).toBe('VALIDATION_ERROR');
      expect(failed.error.message).toBe(API_ERROR_MESSAGES.VALIDATION_ERROR);
      expect(failed.invalidStopId).toBe('stop-3');
    }
  });
});
