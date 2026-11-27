import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import { describe, expect, it } from 'vitest';
import {
  applySensitiveCustodyAction,
  createCustodyRestrictionOrder,
  CUSTODY_RESTRICTION_CATALOG_MESSAGE,
  CUSTODY_ROLE_DENIED_MESSAGE,
  filterCustodyRestrictions,
  getCustodyCapabilities,
  INITIAL_CUSTODY_RESTRICTIONS,
  validateAuditReason,
} from './custody-restrictions';

describe('FE-24 Restricciones de custodia (ISP, permisos y auditoría)', () => {
  it('separa capacidades puedeVer / puedeEditar para Superadministrador, solo lectura y sin permiso', () => {
    expect(getCustodyCapabilities('COORDINADORA_CONVIVENCIA')).toEqual({
      puedeVer: true,
      puedeEditar: true,
      roleLabel: 'SUPERADMIN · COORD.',
    });

    expect(getCustodyCapabilities('JEFE_OPERACIONES')).toEqual({
      puedeVer: true,
      puedeEditar: false,
      roleLabel: 'JEFE_OPERACIONES',
    });

    expect(getCustodyCapabilities('ADMINISTRADOR_CARTERA')).toEqual({
      puedeVer: false,
      puedeEditar: false,
      roleLabel: 'ADMINISTRADOR_CARTERA',
    });

    expect(CUSTODY_RESTRICTION_CATALOG_MESSAGE).toBe(
      API_ERROR_MESSAGES.RESTRICCION_CUSTODIA,
    );
    expect(CUSTODY_ROLE_DENIED_MESSAGE).toBe(
      API_ERROR_MESSAGES.role_not_allowed,
    );
  });

  it('filtra por código de menor, persona restringida, medida o radicado', () => {
    expect(
      filterCustodyRestrictions(INITIAL_CUSTODY_RESTRICTIONS, ''),
    ).toHaveLength(4);
    expect(
      filterCustodyRestrictions(INITIAL_CUSTODY_RESTRICTIONS, '2026-0412').map(
        (o) => o.studentRef,
      ),
    ).toEqual(['#E-104']);
    expect(
      filterCustodyRestrictions(INITIAL_CUSTODY_RESTRICTIONS, 'inexistente'),
    ).toHaveLength(0);
  });

  it('crea restricción y aplica revocatoria, suspensión y archivo dejando registro de quién y cuándo', () => {
    const fixedDate = new Date(2026, 10, 27, 9, 45);
    const { orders, created } = createCustodyRestrictionOrder(
      INITIAL_CUSTODY_RESTRICTIONS,
      {
        studentRef: '#E-190',
        restrictedPerson: '#PR-30 · Familiar restringido',
        legalSupportRef: 'Juzgado 1º · 2026-0510',
        isRevocation: false,
        hasAttachments: true,
      },
      'Coordinación',
      fixedDate,
    );

    expect(orders).toHaveLength(5);
    expect(created.status).toBe('Activa');
    expect(created.auditTrail[0]?.summary).toContain('Creada por Coordinación');

    expect(validateAuditReason('   ')).not.toBeNull();
    expect(validateAuditReason('Oficio judicial vigente')).toBeNull();

    const revoked = applySensitiveCustodyAction(
      orders,
      created.id,
      'revocation',
      'Fallo definitivo emitido',
      'Coordinación',
      fixedDate,
    );
    expect(revoked[0]?.measure).toBe('Revocatoria patria potestad');
    expect(revoked[0]?.auditTrail).toHaveLength(2);

    const archived = applySensitiveCustodyAction(
      revoked,
      created.id,
      'archive',
      'Levantamiento por oficio judicial',
      'Coordinación',
      fixedDate,
    );
    expect(archived[0]?.status).toBe('Archivada');
    expect(archived[0]?.auditTrail).toHaveLength(3);
  });
});
