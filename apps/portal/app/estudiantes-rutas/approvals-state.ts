import { API_ERROR_MESSAGES, type ApiErrorCode } from '@camino/contracts/http';

export type ApprovalRequestType = 'Autorizado' | 'Ocasional';
export type ApprovalRequestStatus = 'En revisión' | 'Aprobado' | 'Rechazado';

export interface ApprovalRequestItem {
  id: string;
  code: string;
  type: ApprovalRequestType;
  routeName: string;
  status: ApprovalRequestStatus;
  studentRef: string;
  submittedAt: string;
  summary: string;
  hasPhoto?: boolean;
  hasDocumentId?: boolean;
  rejectionReason?: string;
  provisionalQrCode?: string;
  simulateBackendError?: 'CAPACIDAD_AGOTADA' | 'ANTICIPACION_INSUFICIENTE';
}

export interface ApprovalFilterCriteria {
  status: ApprovalRequestStatus | 'all';
  type: ApprovalRequestType | 'all';
  query: string;
}

export const INITIAL_APPROVAL_REQUESTS: ReadonlyArray<ApprovalRequestItem> = [
  {
    id: 'sol-204',
    code: '#SOL-204',
    type: 'Autorizado',
    routeName: 'Ruta Sur',
    status: 'En revisión',
    studentRef: '#E-104',
    submittedAt: 'Hoy · 07:35',
    summary: 'Adulto autorizado · Ruta Sur',
    hasPhoto: true,
    hasDocumentId: true,
  },
  {
    id: 'sol-205',
    code: '#SOL-205',
    type: 'Ocasional',
    routeName: 'Ruta Norte',
    status: 'En revisión',
    studentRef: '#E-112',
    submittedAt: 'Hoy · 07:42',
    summary: 'Pasajero ocasional · Ruta Norte',
    provisionalQrCode: '#QR-PROV-8841',
  },
  {
    id: 'sol-209',
    code: '#SOL-209',
    type: 'Ocasional',
    routeName: 'Ruta Sur',
    status: 'En revisión',
    studentRef: '#E-115',
    submittedAt: 'Hoy · 07:50',
    summary: 'Pasajero ocasional · Ruta Sur (cupo completo)',
    simulateBackendError: 'CAPACIDAD_AGOTADA',
  },
  {
    id: 'sol-206',
    code: '#SOL-206',
    type: 'Ocasional',
    routeName: 'Ruta Centro',
    status: 'Aprobado',
    studentRef: '#E-109',
    submittedAt: 'Ayer · 15:20',
    summary: 'Pasajero ocasional · Ruta Centro',
    provisionalQrCode: '#QR-PROV-8834',
  },
  {
    id: 'sol-207',
    code: '#SOL-207',
    type: 'Autorizado',
    routeName: 'Ruta Norte',
    status: 'Aprobado',
    studentRef: '#E-118',
    submittedAt: 'Ayer · 14:10',
    summary: 'Adulto autorizado · Ruta Norte',
    hasPhoto: true,
    hasDocumentId: true,
  },
  {
    id: 'sol-208',
    code: '#SOL-208',
    type: 'Ocasional',
    routeName: 'Ruta Sur',
    status: 'Rechazado',
    studentRef: '#E-121',
    submittedAt: 'Ayer · 11:05',
    summary: 'Pasajero ocasional · Ruta Sur',
    rejectionReason: 'Documento ilegible o incompleto al verificar identidad.',
  },
];

export const BACKEND_APPROVAL_ERRORS: ReadonlyArray<{
  code: Extract<
    ApiErrorCode,
    'CAPACIDAD_AGOTADA' | 'ANTICIPACION_INSUFICIENTE'
  >;
  httpLabel: string;
  message: string;
}> = [
  {
    code: 'CAPACIDAD_AGOTADA',
    httpLabel: 'CAPACIDAD_AGOTADA (409 Conflict)',
    message: API_ERROR_MESSAGES.CAPACIDAD_AGOTADA,
  },
  {
    code: 'ANTICIPACION_INSUFICIENTE',
    httpLabel: 'ANTICIPACION_INSUFICIENTE (400 Bad Request)',
    message: API_ERROR_MESSAGES.ANTICIPACION_INSUFICIENTE,
  },
];

export function filterApprovalRequests(
  items: ReadonlyArray<ApprovalRequestItem>,
  filters: ApprovalFilterCriteria,
): ApprovalRequestItem[] {
  const q = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }
    if (filters.type !== 'all' && item.type !== filters.type) {
      return false;
    }
    if (q) {
      const text = [
        item.code,
        item.type,
        item.routeName,
        item.status,
        item.studentRef,
      ]
        .join(' ')
        .toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

export function validateRejectionReason(reason: string): string | null {
  if (reason.trim().length < 5) {
    return 'Ingresa un motivo obligatorio (mínimo 5 caracteres) al rechazar.';
  }
  return null;
}

export function approveApprovalRequest(
  items: ReadonlyArray<ApprovalRequestItem>,
  id: string,
): ApprovalRequestItem[] {
  return items.map((item) =>
    item.id === id
      ? {
          ...item,
          status: 'Aprobado',
          rejectionReason: undefined,
          provisionalQrCode:
            item.type === 'Ocasional'
              ? (item.provisionalQrCode ?? '#QR-PROV-8841')
              : item.provisionalQrCode,
        }
      : item,
  );
}

export function rejectApprovalRequest(
  items: ReadonlyArray<ApprovalRequestItem>,
  id: string,
  reason: string,
): ApprovalRequestItem[] {
  return items.map((item) =>
    item.id === id
      ? {
          ...item,
          status: 'Rechazado',
          rejectionReason: reason.trim(),
        }
      : item,
  );
}
