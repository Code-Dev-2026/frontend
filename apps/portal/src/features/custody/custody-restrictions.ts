import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import type { StudentRole } from '@camino/domain';
import { z } from 'zod';

export type CustodyRestrictionStatus = 'Activa' | 'Suspendida' | 'Archivada';

export type CustodyRestrictionMeasure =
  | 'Revocatoria patria potestad'
  | 'Orden judicial cautelar'
  | 'Medida preventiva';

export type CustodySensitiveAction =
  'revocation' | 'suspend' | 'reactivate' | 'archive';

export interface CustodyAuditEntry {
  id: string;
  actor: string;
  timestamp: string;
  summary: string;
}

export interface CustodyRestrictionOrder {
  id: string;
  studentRef: string;
  restrictedPersonRef: string;
  restrictedPersonLabel: string;
  measure: CustodyRestrictionMeasure;
  status: CustodyRestrictionStatus;
  legalSupportRef: string;
  hasRestrictedPhoto: boolean;
  hasLegalPdf: boolean;
  latestAuditLabel: string;
  auditTrail: CustodyAuditEntry[];
}

/**
 * ISP: capacidades pequeñas desacopladas de la UI para que la ficha de solo
 * lectura nunca reciba acciones de edición ni gestión de órdenes.
 */
export interface CustodyCapabilities {
  puedeVer: boolean;
  puedeEditar: boolean;
  roleLabel: string;
}

const READ_ONLY_ROLES: ReadonlyArray<StudentRole> = [
  'RECTORIA',
  'GERENCIA_TRANSPORTE',
  'JEFE_OPERACIONES',
];

const ROLE_DISPLAY_LABELS: Record<StudentRole, string> = {
  COORDINADORA_CONVIVENCIA: 'SUPERADMIN · COORD.',
  RECTORIA: 'RECTORÍA',
  GERENCIA_TRANSPORTE: 'GERENCIA TRANSPORTE',
  JEFE_OPERACIONES: 'JEFE_OPERACIONES',
  ADMINISTRADOR_CARTERA: 'ADMINISTRADOR_CARTERA',
  MONITORA: 'MONITORA',
  CONDUCTOR: 'CONDUCTOR',
  ACUDIENTE: 'ACUDIENTE',
};

export const CUSTODY_RESTRICTION_CATALOG_MESSAGE =
  API_ERROR_MESSAGES.RESTRICCION_CUSTODIA;
export const CUSTODY_ROLE_DENIED_MESSAGE = API_ERROR_MESSAGES.role_not_allowed;

export function getCustodyCapabilities(role: StudentRole): CustodyCapabilities {
  if (role === 'COORDINADORA_CONVIVENCIA') {
    return {
      puedeVer: true,
      puedeEditar: true,
      roleLabel: ROLE_DISPLAY_LABELS[role],
    };
  }

  if (READ_ONLY_ROLES.includes(role)) {
    return {
      puedeVer: true,
      puedeEditar: false,
      roleLabel: ROLE_DISPLAY_LABELS[role],
    };
  }

  return {
    puedeVer: false,
    puedeEditar: false,
    roleLabel: ROLE_DISPLAY_LABELS[role],
  };
}

export const createRestrictionSchema = z.object({
  studentRef: z
    .string()
    .trim()
    .min(3, 'Ingresa el código del estudiante (ej. #E-104).'),
  restrictedPerson: z
    .string()
    .trim()
    .min(3, 'Identifica a la persona restringida.'),
  legalSupportRef: z
    .string()
    .trim()
    .min(5, 'Ingresa el oficio o radicado legal de soporte.'),
  isRevocation: z.boolean(),
  hasAttachments: z.boolean(),
});

export type CreateRestrictionValues = z.infer<typeof createRestrictionSchema>;

export function validateAuditReason(reason: string): string | null {
  if (reason.trim().length < 5) {
    return 'Ingresa el motivo o soporte del cambio (mínimo 5 caracteres).';
  }
  return null;
}

export const INITIAL_CUSTODY_RESTRICTIONS: ReadonlyArray<CustodyRestrictionOrder> =
  [
    {
      id: 'res-e104',
      studentRef: '#E-104',
      restrictedPersonRef: '#PR-09',
      restrictedPersonLabel: '#PR-09 · Familiar no autorizado',
      measure: 'Revocatoria patria potestad',
      status: 'Activa',
      legalSupportRef: 'Oficio 2026-0412 (PDF)',
      hasRestrictedPhoto: true,
      hasLegalPdf: true,
      latestAuditLabel: 'Coordinación · hoy',
      auditTrail: [
        {
          id: 'aud-104-1',
          actor: 'Coordinación',
          timestamp: '18/11/2026 10:22',
          summary: 'Creada por Coordinación · 18/11/2026 10:22',
        },
        {
          id: 'aud-104-2',
          actor: 'Coordinación',
          timestamp: '24/11/2026 08:15',
          summary: 'Marcada revocatoria por Coordinación · 24/11/2026 08:15',
        },
      ],
    },
    {
      id: 'res-e112',
      studentRef: '#E-112',
      restrictedPersonRef: '#PR-14',
      restrictedPersonLabel: '#PR-14 · Restricción judicial',
      measure: 'Orden judicial cautelar',
      status: 'Activa',
      legalSupportRef: 'Juzgado 2º Familia · 2026-0388 (PDF)',
      hasRestrictedPhoto: true,
      hasLegalPdf: true,
      latestAuditLabel: 'Coordinación · ayer',
      auditTrail: [
        {
          id: 'aud-112-1',
          actor: 'Coordinación',
          timestamp: '26/11/2026 14:10',
          summary: 'Creada por Coordinación · 26/11/2026 14:10',
        },
      ],
    },
    {
      id: 'res-e087',
      studentRef: '#E-087',
      restrictedPersonRef: '#PR-03',
      restrictedPersonLabel: '#PR-03 · Tercero restringido',
      measure: 'Orden judicial cautelar',
      status: 'Suspendida',
      legalSupportRef: 'Oficio 2026-0319 (PDF)',
      hasRestrictedPhoto: true,
      hasLegalPdf: true,
      latestAuditLabel: 'Coordinación · 19/11',
      auditTrail: [
        {
          id: 'aud-087-1',
          actor: 'Coordinación',
          timestamp: '10/11/2026 09:05',
          summary: 'Creada por Coordinación · 10/11/2026 09:05',
        },
        {
          id: 'aud-087-2',
          actor: 'Coordinación',
          timestamp: '19/11/2026 16:40',
          summary: 'Suspendida por Coordinación · 19/11/2026 16:40',
        },
      ],
    },
    {
      id: 'res-e145',
      studentRef: '#E-145',
      restrictedPersonRef: '#PR-21',
      restrictedPersonLabel: '#PR-21 · Medida temporal',
      measure: 'Medida preventiva',
      status: 'Archivada',
      legalSupportRef: 'Acta 2026-0205 (PDF)',
      hasRestrictedPhoto: false,
      hasLegalPdf: true,
      latestAuditLabel: 'Coordinación · 04/11',
      auditTrail: [
        {
          id: 'aud-145-1',
          actor: 'Coordinación',
          timestamp: '20/10/2026 11:15',
          summary: 'Creada por Coordinación · 20/10/2026 11:15',
        },
        {
          id: 'aud-145-2',
          actor: 'Coordinación',
          timestamp: '04/11/2026 17:30',
          summary: 'Archivada por Coordinación · 04/11/2026 17:30',
        },
      ],
    },
  ];

export function filterCustodyRestrictions(
  orders: ReadonlyArray<CustodyRestrictionOrder>,
  query: string,
): CustodyRestrictionOrder[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...orders];

  return orders.filter((order) => {
    const haystack = [
      order.studentRef,
      order.restrictedPersonRef,
      order.restrictedPersonLabel,
      order.measure,
      order.status,
      order.legalSupportRef,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

function formatAuditNow(now: Date): string {
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function createCustodyRestrictionOrder(
  orders: ReadonlyArray<CustodyRestrictionOrder>,
  values: CreateRestrictionValues,
  actor = 'Coordinación',
  now = new Date(),
): { orders: CustodyRestrictionOrder[]; created: CustodyRestrictionOrder } {
  const timestamp = formatAuditNow(now);
  const personSegments = values.restrictedPerson
    .split('·')
    .map((s) => s.trim());
  const personCode = personSegments[0] || values.restrictedPerson.trim();
  const id = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const created: CustodyRestrictionOrder = {
    id,
    studentRef: values.studentRef.trim(),
    restrictedPersonRef: personCode,
    restrictedPersonLabel: values.restrictedPerson.trim(),
    measure: values.isRevocation
      ? 'Revocatoria patria potestad'
      : 'Orden judicial cautelar',
    status: 'Activa',
    legalSupportRef: `${values.legalSupportRef.trim()} (PDF)`,
    hasRestrictedPhoto: values.hasAttachments,
    hasLegalPdf: true,
    latestAuditLabel: `${actor} · hoy`,
    auditTrail: [
      {
        id: `aud-${id}-1`,
        actor,
        timestamp,
        summary: `Creada por ${actor} · ${timestamp}`,
      },
    ],
  };

  return {
    orders: [created, ...orders],
    created,
  };
}

export function applySensitiveCustodyAction(
  orders: ReadonlyArray<CustodyRestrictionOrder>,
  id: string,
  action: CustodySensitiveAction,
  reason: string,
  actor = 'Coordinación',
  now = new Date(),
): CustodyRestrictionOrder[] {
  const timestamp = formatAuditNow(now);
  const cleanReason = reason.trim();

  return orders.map((order) => {
    if (order.id !== id) return order;

    let nextMeasure = order.measure;
    let nextStatus = order.status;
    let verb = 'Actualizada';

    switch (action) {
      case 'revocation':
        nextMeasure = 'Revocatoria patria potestad';
        nextStatus = 'Activa';
        verb = 'Marcada revocatoria';
        break;
      case 'suspend':
        nextStatus = 'Suspendida';
        verb = 'Suspendida';
        break;
      case 'reactivate':
        nextStatus = 'Activa';
        verb = 'Reactivada';
        break;
      case 'archive':
        nextStatus = 'Archivada';
        verb = 'Archivada';
        break;
    }

    const entry: CustodyAuditEntry = {
      id: `aud-${order.id}-${order.auditTrail.length + 1}`,
      actor,
      timestamp,
      summary: `${verb} por ${actor} · ${timestamp} (${cleanReason})`,
    };

    return {
      ...order,
      measure: nextMeasure,
      status: nextStatus,
      latestAuditLabel: `${actor} · hoy`,
      auditTrail: [...order.auditTrail, entry],
    };
  });
}
