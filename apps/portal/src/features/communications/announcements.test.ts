import { describe, expect, it, vi } from 'vitest';
import {
  announcementDraftSchema,
  createContractsNotificationsGateway,
  dispatchAnnouncement,
  filterAnnouncementsHistory,
  INITIAL_ANNOUNCEMENTS,
  needsUrgentConfirmation,
  summarizeAudience,
  toggleRouteSelection,
  type NotificationsGateway,
} from './announcements';

describe('communications announcements', () => {
  it('segmenta rutas múltiples y calcula total de acudientes', () => {
    let routes = toggleRouteSelection(['ALL'], 'R-01');
    routes = toggleRouteSelection(routes, 'R-03');

    expect(routes).toEqual(['R-01', 'R-03']);
    expect(summarizeAudience(routes)).toEqual({
      recipientCount: 36,
      summaryText: 'Ruta Norte, Ruta Sur',
      compactRoutesLabel: 'Ruta Norte, Sur',
    });
  });

  it('normaliza a Todas las rutas si se seleccionan todas o ninguna', () => {
    let routes = toggleRouteSelection(['ALL'], 'R-01');
    routes = toggleRouteSelection(routes, 'R-02');
    routes = toggleRouteSelection(routes, 'R-03');
    expect(routes).toEqual(['ALL']);

    const deselectLast = toggleRouteSelection(['R-01'], 'R-01');
    expect(deselectLast).toEqual(['ALL']);
    expect(summarizeAudience(deselectLast).recipientCount).toBe(112);
  });

  it('valida asunto y mensaje oficial con Zod', () => {
    const invalid = announcementDraftSchema.safeParse({
      severity: 'INFORMATIVO',
      selectedRoutes: ['ALL'],
      title: 'Hi',
      message: 'Corto',
    });
    expect(invalid.success).toBe(false);

    const valid = announcementDraftSchema.safeParse({
      severity: 'INFORMATIVO',
      selectedRoutes: ['ALL'],
      title: 'Recordatorio de horario escolar',
      message:
        'Este viernes la salida será a las 12:30 p. m. para todas las rutas.',
    });
    expect(valid.success).toBe(true);
  });

  it('bloquea envíos urgentes sin confirmación explícita y permite los confirmados', async () => {
    const gateway: NotificationsGateway = {
      sendAnnouncement: vi.fn().mockResolvedValue({
        deliveryMode: 'api',
        deliveredCount: 36,
      }),
    };

    expect(needsUrgentConfirmation('URGENTE', false)).toBe(true);
    expect(needsUrgentConfirmation('INFORMATIVO', false)).toBe(false);

    await expect(
      dispatchAnnouncement(
        {
          severity: 'URGENTE',
          selectedRoutes: ['R-01', 'R-03'],
          title: 'Desvío temporal en Av. Circunvalar',
          message:
            'La Ruta Norte y Ruta Sur presentan desvío temporal de 15 min por cierre vial.',
        },
        gateway,
        { confirmedUrgent: false },
      ),
    ).rejects.toThrow(/confirmación explícita/i);

    const dispatched = await dispatchAnnouncement(
      {
        severity: 'URGENTE',
        selectedRoutes: ['R-01', 'R-03'],
        title: 'Desvío temporal en Av. Circunvalar',
        message:
          'La Ruta Norte y Ruta Sur presentan desvío temporal de 15 min por cierre vial.',
      },
      gateway,
      {
        confirmedUrgent: true,
        now: new Date(2026, 10, 27, 8, 15),
        id: 'com-test',
      },
    );

    expect(gateway.sendAnnouncement).toHaveBeenCalledTimes(1);
    expect(dispatched.deliveryMode).toBe('api');
    expect(dispatched.record).toMatchObject({
      id: 'com-test',
      severity: 'URGENTE',
      routesSummary: 'Ruta Norte, Sur',
      recipientCount: 36,
      deliveredCount: 36,
      sentAtLabel: 'Hoy 08:15',
      status: 'ENTREGADO',
    });
  });

  it('despacha por adaptador de contratos y cae con seguridad si no hay backend', async () => {
    const okSender = vi.fn().mockResolvedValue({
      status: 201,
      data: undefined,
      headers: new Headers(),
    });
    const okGateway = createContractsNotificationsGateway(okSender);
    const resOk = await okGateway.sendAnnouncement({
      severity: 'INFORMATIVO',
      routeIds: ['ALL'],
      recipientCount: 112,
      title: 'Aviso general',
      message: 'Comunicado institucional de prueba para verificación.',
    });
    expect(resOk).toEqual({ deliveryMode: 'api', deliveredCount: 112 });

    const failingSender = vi.fn().mockRejectedValue(new Error('Network down'));
    const fallbackGateway = createContractsNotificationsGateway(failingSender);
    const resFallback = await fallbackGateway.sendAnnouncement({
      severity: 'INFORMATIVO',
      routeIds: ['R-02'],
      recipientCount: 18,
      title: 'Aviso local',
      message: 'Comunicado institucional de respaldo sin backend.',
    });
    expect(resFallback).toEqual({ deliveryMode: 'local', deliveredCount: 18 });
  });

  it('filtra historial de comunicados por severidad', () => {
    expect(
      filterAnnouncementsHistory(INITIAL_ANNOUNCEMENTS, 'ALL'),
    ).toHaveLength(3);
    expect(
      filterAnnouncementsHistory(INITIAL_ANNOUNCEMENTS, 'URGENTE'),
    ).toHaveLength(1);
    expect(
      filterAnnouncementsHistory(INITIAL_ANNOUNCEMENTS, 'INFORMATIVO'),
    ).toHaveLength(2);
    expect(filterAnnouncementsHistory([], 'ALL')).toEqual([]);
  });
});
