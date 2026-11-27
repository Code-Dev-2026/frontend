import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import { describe, expect, it } from 'vitest';
import {
  approveApprovalRequest,
  BACKEND_APPROVAL_ERRORS,
  filterApprovalRequests,
  INITIAL_APPROVAL_REQUESTS,
  rejectApprovalRequest,
  validateRejectionReason,
} from './approvals-state';

describe('FE-23 Bandeja de aprobaciones', () => {
  it('filtra por estado, tipo y búsqueda', () => {
    expect(
      filterApprovalRequests(INITIAL_APPROVAL_REQUESTS, {
        status: 'En revisión',
        type: 'all',
        query: '',
      }),
    ).toHaveLength(3);

    expect(
      filterApprovalRequests(INITIAL_APPROVAL_REQUESTS, {
        status: 'all',
        type: 'Ocasional',
        query: 'Norte',
      }).map((i) => i.code),
    ).toEqual(['#SOL-205']);
  });

  it('exige motivo al rechazar y actualiza aprobar / rechazar correctamente', () => {
    expect(validateRejectionReason('   ')).not.toBeNull();
    expect(validateRejectionReason('Documento ilegible')).toBeNull();

    const approved = approveApprovalRequest(
      INITIAL_APPROVAL_REQUESTS,
      'sol-205',
    );
    expect(approved.find((i) => i.id === 'sol-205')?.status).toBe('Aprobado');
    expect(approved.find((i) => i.id === 'sol-205')?.provisionalQrCode).toBe(
      '#QR-PROV-8841',
    );

    const rejected = rejectApprovalRequest(
      INITIAL_APPROVAL_REQUESTS,
      'sol-204',
      'Documento ilegible en reverso',
    );
    expect(rejected.find((i) => i.id === 'sol-204')?.status).toBe('Rechazado');
    expect(rejected.find((i) => i.id === 'sol-204')?.rejectionReason).toBe(
      'Documento ilegible en reverso',
    );
  });

  it('usa mensajes oficiales de @camino/contracts/http para cupos y anticipación', () => {
    expect(BACKEND_APPROVAL_ERRORS[0]?.message).toBe(
      API_ERROR_MESSAGES.CAPACIDAD_AGOTADA,
    );
    expect(BACKEND_APPROVAL_ERRORS[1]?.message).toBe(
      API_ERROR_MESSAGES.ANTICIPACION_INSUFICIENTE,
    );
  });
});
