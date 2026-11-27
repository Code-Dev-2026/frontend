import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import { describe, expect, it } from 'vitest';
import {
  applySimulatedTelemetryPulse,
  canAccessFleetConsole,
  filterFleetUnits,
  INITIAL_PROVISIONAL_FLEET,
  ROLE_DENIED_RF19_MESSAGE,
} from './telemetry-state';

describe('FE-21 Consola de Coordinación — mapa global y RF-19', () => {
  it('restringe el acceso a Coordinación y Gerencia de Transporte (RF-19)', () => {
    expect(canAccessFleetConsole('COORDINADORA_CONVIVENCIA')).toBe(true);
    expect(canAccessFleetConsole('GERENCIA_TRANSPORTE')).toBe(true);
    expect(canAccessFleetConsole('ADMINISTRADOR_CARTERA')).toBe(false);
    expect(canAccessFleetConsole('MONITORA')).toBe(false);
    expect(canAccessFleetConsole('ACUDIENTE')).toBe(false);
    expect(ROLE_DENIED_RF19_MESSAGE).toBe(API_ERROR_MESSAGES.role_not_allowed);
  });

  it('filtra unidades por código, ruta, placa o parada', () => {
    expect(filterFleetUnits(INITIAL_PROVISIONAL_FLEET, '')).toHaveLength(3);
    expect(filterFleetUnits(INITIAL_PROVISIONAL_FLEET, 'Norte')).toHaveLength(
      1,
    );
    expect(
      filterFleetUnits(INITIAL_PROVISIONAL_FLEET, 'KLR-219')[0]?.code,
    ).toBe('BUS-03');
    expect(
      filterFleetUnits(INITIAL_PROVISIONAL_FLEET, 'inexistente'),
    ).toHaveLength(0);
  });

  it('actualiza posiciones simuladas PROVISIONALES sin calcular ETA en el cliente', () => {
    const updated = applySimulatedTelemetryPulse(INITIAL_PROVISIONAL_FLEET, 1);
    expect(updated[0]?.latitude).not.toBe(
      INITIAL_PROVISIONAL_FLEET[0]?.latitude,
    );
    expect(updated[0]?.lastPacketLabel).toBe('Justo ahora (simulado)');
    expect(updated[2]?.latitude).toBe(INITIAL_PROVISIONAL_FLEET[2]?.latitude);
    expect(updated[2]?.lastPacketLabel).toContain('simulado');
  });
});
