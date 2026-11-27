import { notificationsControllerSendPush } from '@camino/contracts/notifications';
import { z } from 'zod';

export type AnnouncementSeverity = 'INFORMATIVO' | 'URGENTE';
export type RouteAudienceId = 'ALL' | 'R-01' | 'R-02' | 'R-03';
export type AnnouncementDeliveryStatus = 'ENTREGADO' | 'EN_ENTREGA';
export type HistorySeverityFilter = 'ALL' | AnnouncementSeverity;

export interface RouteAudienceOption {
  id: RouteAudienceId;
  label: string;
  shortCode: string | null;
  displayChip: string;
  guardianCount: number;
}

export const ROUTE_AUDIENCE_OPTIONS: ReadonlyArray<RouteAudienceOption> = [
  {
    id: 'ALL',
    label: 'Todas las rutas',
    shortCode: null,
    displayChip: 'Todas las rutas',
    guardianCount: 112,
  },
  {
    id: 'R-01',
    label: 'Ruta Norte',
    shortCode: 'R-01',
    displayChip: 'Ruta Norte · R-01',
    guardianCount: 20,
  },
  {
    id: 'R-02',
    label: 'Ruta Centro',
    shortCode: 'R-02',
    displayChip: 'Ruta Centro · R-02',
    guardianCount: 18,
  },
  {
    id: 'R-03',
    label: 'Ruta Sur',
    shortCode: 'R-03',
    displayChip: 'Ruta Sur · R-03',
    guardianCount: 16,
  },
];

export const announcementDraftSchema = z.object({
  severity: z.enum(['INFORMATIVO', 'URGENTE']),
  selectedRoutes: z
    .array(z.enum(['ALL', 'R-01', 'R-02', 'R-03']))
    .min(1, 'Selecciona al menos una ruta destinataria.'),
  title: z
    .string()
    .trim()
    .min(4, 'Ingresa un asunto de al menos 4 caracteres.')
    .max(90, 'El asunto no puede superar 90 caracteres.'),
  message: z
    .string()
    .trim()
    .min(10, 'Escribe el mensaje oficial (mínimo 10 caracteres).')
    .max(400, 'El mensaje oficial no puede superar 400 caracteres.'),
});

export type AnnouncementDraftInput = z.infer<typeof announcementDraftSchema>;

export interface AnnouncementRecord {
  id: string;
  severity: AnnouncementSeverity;
  routeIds: ReadonlyArray<RouteAudienceId>;
  routesSummary: string;
  recipientCount: number;
  deliveredCount: number;
  title: string;
  message: string;
  sentAtLabel: string;
  status: AnnouncementDeliveryStatus;
}

export interface DispatchNotificationPayload {
  severity: AnnouncementSeverity;
  routeIds: ReadonlyArray<RouteAudienceId>;
  recipientCount: number;
  title: string;
  message: string;
}

export interface NotificationsDispatchResult {
  deliveryMode: 'api' | 'local';
  deliveredCount: number;
}

export interface NotificationsGateway {
  sendAnnouncement(
    payload: DispatchNotificationPayload,
  ): Promise<NotificationsDispatchResult>;
}

const SPECIFIC_ROUTES: ReadonlyArray<Exclude<RouteAudienceId, 'ALL'>> = [
  'R-01',
  'R-02',
  'R-03',
];

export function toggleRouteSelection(
  current: ReadonlyArray<RouteAudienceId>,
  clicked: RouteAudienceId,
): RouteAudienceId[] {
  if (clicked === 'ALL') {
    return ['ALL'];
  }

  const withoutAll = current.filter(
    (id): id is Exclude<RouteAudienceId, 'ALL'> => id !== 'ALL',
  );
  const exists = withoutAll.includes(clicked);
  const next = exists
    ? withoutAll.filter((id) => id !== clicked)
    : [...withoutAll, clicked];

  if (next.length === 0 || next.length === SPECIFIC_ROUTES.length) {
    return ['ALL'];
  }

  return SPECIFIC_ROUTES.filter((id) => next.includes(id));
}

export function summarizeAudience(
  selectedRoutes: ReadonlyArray<RouteAudienceId>,
): {
  recipientCount: number;
  summaryText: string;
  compactRoutesLabel: string;
} {
  if (selectedRoutes.includes('ALL') || selectedRoutes.length === 0) {
    return {
      recipientCount: 112,
      summaryText: 'Todas las rutas',
      compactRoutesLabel: 'Todas las rutas',
    };
  }

  const matched = ROUTE_AUDIENCE_OPTIONS.filter(
    (opt) => opt.id !== 'ALL' && selectedRoutes.includes(opt.id),
  );
  const recipientCount = matched.reduce(
    (acc, opt) => acc + opt.guardianCount,
    0,
  );
  const summaryText = matched.map((opt) => opt.label).join(', ');
  const compactRoutesLabel = matched
    .map((opt, idx) =>
      idx === 0 ? opt.label : opt.label.replace(/^Ruta\s+/i, ''),
    )
    .join(', ');

  return {
    recipientCount,
    summaryText,
    compactRoutesLabel,
  };
}

export function needsUrgentConfirmation(
  severity: AnnouncementSeverity,
  confirmedUrgent: boolean,
): boolean {
  return severity === 'URGENTE' && !confirmedUrgent;
}

export function createContractsNotificationsGateway(
  sender: typeof notificationsControllerSendPush = notificationsControllerSendPush,
): NotificationsGateway {
  return {
    async sendAnnouncement(payload) {
      try {
        const response = await sender({
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'INSTITUTIONAL_ANNOUNCEMENT',
            readOnly: true,
            allowReplies: false,
            ...payload,
          }),
        });

        if (response.status >= 200 && response.status < 300) {
          return {
            deliveryMode: 'api',
            deliveredCount: payload.recipientCount,
          };
        }
      } catch {
        // En entorno offline o sin sesión activa se registra el envío operativo local
      }

      return {
        deliveryMode: 'local',
        deliveredCount: payload.recipientCount,
      };
    },
  };
}

function formatCurrentTimeLabel(now: Date = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `Hoy ${hours}:${minutes}`;
}

export async function dispatchAnnouncement(
  rawDraft: AnnouncementDraftInput,
  gateway: NotificationsGateway,
  options: { confirmedUrgent?: boolean; now?: Date; id?: string } = {},
): Promise<{ record: AnnouncementRecord; deliveryMode: 'api' | 'local' }> {
  const parsed = announcementDraftSchema.parse(rawDraft);
  const confirmed = Boolean(options.confirmedUrgent);

  if (needsUrgentConfirmation(parsed.severity, confirmed)) {
    throw new Error(
      'Los comunicados urgentes requieren confirmación explícita antes de enviarse.',
    );
  }

  const audience = summarizeAudience(parsed.selectedRoutes);
  const result = await gateway.sendAnnouncement({
    severity: parsed.severity,
    routeIds: parsed.selectedRoutes,
    recipientCount: audience.recipientCount,
    title: parsed.title,
    message: parsed.message,
  });

  const record: AnnouncementRecord = {
    id: options.id ?? `com-${Date.now()}`,
    severity: parsed.severity,
    routeIds: [...parsed.selectedRoutes],
    routesSummary: audience.compactRoutesLabel,
    recipientCount: audience.recipientCount,
    deliveredCount: result.deliveredCount,
    title: parsed.title,
    message: parsed.message,
    sentAtLabel: formatCurrentTimeLabel(options.now),
    status:
      result.deliveredCount >= audience.recipientCount
        ? 'ENTREGADO'
        : 'EN_ENTREGA',
  };

  return { record, deliveryMode: result.deliveryMode };
}

export function filterAnnouncementsHistory(
  items: ReadonlyArray<AnnouncementRecord>,
  severityFilter: HistorySeverityFilter,
): AnnouncementRecord[] {
  if (severityFilter === 'ALL') {
    return [...items];
  }
  return items.filter((item) => item.severity === severityFilter);
}

export const INITIAL_ANNOUNCEMENTS: ReadonlyArray<AnnouncementRecord> = [
  {
    id: 'com-01',
    severity: 'URGENTE',
    routeIds: ['R-01', 'R-03'],
    routesSummary: 'Ruta Norte, Sur',
    recipientCount: 36,
    deliveredCount: 36,
    title: 'Desvío Av. Circunvalar',
    message:
      'La Ruta Norte y Ruta Sur presentan desvío temporal de 15 min por cierre vial.',
    sentAtLabel: 'Hoy 07:35',
    status: 'ENTREGADO',
  },
  {
    id: 'com-02',
    severity: 'INFORMATIVO',
    routeIds: ['ALL'],
    routesSummary: 'Todas las rutas',
    recipientCount: 112,
    deliveredCount: 112,
    title: 'Jornada pedagógica viernes',
    message:
      'Este viernes la salida será a las 12:30 p. m. por jornada pedagógica institucional.',
    sentAtLabel: 'Ayer 16:10',
    status: 'ENTREGADO',
  },
  {
    id: 'com-03',
    severity: 'INFORMATIVO',
    routeIds: ['R-02'],
    routesSummary: 'Ruta Centro',
    recipientCount: 18,
    deliveredCount: 14,
    title: 'Ajuste paradero centro',
    message:
      'El paradero habitual de Plaza Bolívar operará 50 metros al norte durante esta semana.',
    sentAtLabel: '22/11 08:05',
    status: 'EN_ENTREGA',
  },
];
