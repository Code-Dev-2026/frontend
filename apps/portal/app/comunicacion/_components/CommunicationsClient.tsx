'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  announcementDraftSchema,
  createContractsNotificationsGateway,
  dispatchAnnouncement,
  filterAnnouncementsHistory,
  INITIAL_ANNOUNCEMENTS,
  needsUrgentConfirmation,
  ROUTE_AUDIENCE_OPTIONS,
  summarizeAudience,
  toggleRouteSelection,
  type AnnouncementRecord,
  type AnnouncementSeverity,
  type HistorySeverityFilter,
  type RouteAudienceId,
} from '../../../src/features/communications/announcements';

interface ValidationErrors {
  title?: string;
  message?: string;
}

const HISTORY_FILTERS: ReadonlyArray<{
  id: HistorySeverityFilter;
  label: string;
}> = [
  { id: 'ALL', label: 'Todos' },
  { id: 'INFORMATIVO', label: 'Informativos' },
  { id: 'URGENTE', label: 'Urgentes' },
];

export function CommunicationsClient() {
  const [severity, setSeverity] = useState<AnnouncementSeverity>('INFORMATIVO');
  const [selectedRoutes, setSelectedRoutes] = useState<RouteAudienceId[]>([
    'ALL',
  ]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [history, setHistory] = useState<AnnouncementRecord[]>(() => [
    ...INITIAL_ANNOUNCEMENTS,
  ]);
  const [historyFilter, setHistoryFilter] =
    useState<HistorySeverityFilter>('ALL');
  const [confirmUrgentOpen, setConfirmUrgentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const gateway = useMemo(() => createContractsNotificationsGateway(), []);
  const audienceSummary = useMemo(
    () => summarizeAudience(selectedRoutes),
    [selectedRoutes],
  );
  const visibleHistory = useMemo(
    () => filterAnnouncementsHistory(history, historyFilter),
    [history, historyFilter],
  );

  const navItems = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: '/icons/house.svg',
      href: '/' as const,
      active: false,
    },
    {
      id: 'rutas',
      label: 'Estudiantes y rutas',
      icon: '/icons/route.svg',
      href: '/estudiantes-rutas' as const,
      active: false,
    },
    {
      id: 'custodia',
      label: 'Custodia',
      icon: '/icons/shield-check.svg',
      href: '/custodia' as const,
      active: false,
    },
    {
      id: 'telemetria',
      label: 'Telemetría',
      icon: '/icons/bus-front-navy.svg',
      href: '/telemetria' as const,
      active: false,
    },
    {
      id: 'comunicacion',
      label: 'Comunicación',
      icon: '/icons/bell.svg',
      href: '/comunicacion' as const,
      active: true,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '/icons/eye.svg',
      href: '/reportes' as const,
      active: false,
    },
    {
      id: 'cartera',
      label: 'Cartera',
      icon: '/icons/users.svg',
      href: null,
      active: false,
    },
  ] as const;

  function validateDraft(): boolean {
    const result = announcementDraftSchema.safeParse({
      severity,
      selectedRoutes,
      title,
      message,
    });

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: ValidationErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === 'title' && !nextErrors.title) {
        nextErrors.title = issue.message;
      }
      if (field === 'message' && !nextErrors.message) {
        nextErrors.message = issue.message;
      }
    }
    setErrors(nextErrors);
    return false;
  }

  async function executeDispatch(confirmedUrgent: boolean) {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const { record } = await dispatchAnnouncement(
        {
          severity,
          selectedRoutes,
          title,
          message,
        },
        gateway,
        { confirmedUrgent },
      );

      setHistory((prev) => [record, ...prev]);
      setConfirmUrgentOpen(false);
      setTitle('');
      setMessage('');
      setErrors({});
      setFeedback({
        tone: 'success',
        text: `Comunicado "${record.title}" enviado a ${record.recipientCount} acudientes.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'No fue posible registrar el envío. Intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!validateDraft()) {
      return;
    }

    if (needsUrgentConfirmation(severity, false)) {
      setConfirmUrgentOpen(true);
      return;
    }

    void executeDispatch(false);
  }

  function handleResetForm() {
    setSeverity('INFORMATIVO');
    setSelectedRoutes(['ALL']);
    setTitle('');
    setMessage('');
    setErrors({});
    setFeedback(null);
  }

  return (
    <div className="flex min-h-screen w-full bg-cs-bg">
      {/* Sidebar Desktop (240 px) */}
      <aside
        aria-label="Navegación lateral"
        className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-cs-borderSoft bg-cs-surface px-4 py-5 lg:flex"
      >
        <div className="flex flex-col gap-3">
          <div className="flex w-[140px] flex-col items-center p-2">
            <Image
              alt="Camino Seguro"
              height={116}
              priority
              src="/logo-camino-seguro.svg"
              width={104}
            />
          </div>
          <p className="px-2 text-[14px] font-medium leading-[20px] text-cs-navy">
            Portal operativo
          </p>
          <span className="inline-flex w-fit items-center rounded-full bg-cs-infoBg px-3 py-1 text-[12px] font-medium text-cs-navy">
            COORDINACIÓN
          </span>

          <nav
            aria-label="Módulos del portal"
            className="mt-1 flex flex-col gap-1"
          >
            {navItems.map((item) =>
              item.href ? (
                <Link
                  className={`flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium leading-[20px] transition-colors ${
                    item.active
                      ? 'bg-cs-infoBg text-cs-navy'
                      : 'text-cs-textBody hover:bg-cs-surfaceInput'
                  }`}
                  href={item.href}
                  key={item.id}
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    height={20}
                    src={item.icon}
                    width={20}
                  />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex h-12 cursor-default items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium leading-[20px] text-cs-textMuted"
                  key={item.id}
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    height={20}
                    src={item.icon}
                    width={20}
                  />
                  <span>{item.label}</span>
                </span>
              ),
            )}
          </nav>
        </div>

        <p className="px-2 text-[13px] leading-[18px] text-cs-textMuted">
          Colegio San Benito del Otún
        </p>
      </aside>

      {/* Drawer móvil / tablet (768 px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 flex w-[240px] flex-col justify-between bg-cs-surface p-4 shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-cs-navy">
                  Portal operativo
                </span>
                <button
                  aria-label="Cerrar menú"
                  className="min-h-[40px] rounded-lg border border-cs-borderSoft px-3 text-xs font-medium text-cs-textBody"
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-cs-infoBg px-3 py-1 text-[12px] font-medium text-cs-navy">
                COORDINACIÓN
              </span>
              <nav className="mt-1 flex flex-col gap-1">
                {navItems.map((item) =>
                  item.href ? (
                    <Link
                      className={`flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium ${
                        item.active
                          ? 'bg-cs-infoBg text-cs-navy'
                          : 'text-cs-textBody hover:bg-cs-surfaceInput'
                      }`}
                      href={item.href}
                      key={item.id}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Image
                        alt=""
                        aria-hidden="true"
                        height={20}
                        src={item.icon}
                        width={20}
                      />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium text-cs-textMuted"
                      key={item.id}
                    >
                      <Image
                        alt=""
                        aria-hidden="true"
                        height={20}
                        src={item.icon}
                        width={20}
                      />
                      <span>{item.label}</span>
                    </span>
                  ),
                )}
              </nav>
            </div>
            <p className="text-[13px] text-cs-textMuted">
              Colegio San Benito del Otún
            </p>
          </aside>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-cs-borderSoft bg-cs-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir navegación"
              className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surface text-cs-navy lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              ☰
            </button>
            <div className="flex flex-col">
              <h1 className="text-[18px] font-semibold leading-[24px] text-cs-textStrong">
                Comunicación · Comunicados
              </h1>
              <p className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[13px] font-medium text-cs-successText">
            Canal activo
          </span>
        </header>

        {/* Contenido */}
        <main className="flex flex-1 flex-col gap-4 bg-cs-surfaceInput p-4 sm:p-6">
          {/* Aviso institucional */}
          <section
            aria-label="Política de comunicación"
            className="flex items-start gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-4 py-3.5"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              height={20}
              src="/icons/info.svg"
              width={20}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-[14px] font-semibold leading-[20px] text-cs-textStrong">
                Canal institucional unidireccional
              </p>
              <p className="text-[13px] leading-[18px] text-cs-textMuted">
                Emite comunicados informativos o urgentes segmentados por ruta.
                Solo lectura para acudientes, sin chat abierto con la
                tripulación.
              </p>
            </div>
          </section>

          {/* Grid principal Redactor + Vista previa / Historial */}
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,1fr)]">
            {/* Tarjeta Redactor */}
            <section className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
              <h2 className="text-[16px] font-semibold leading-[24px] text-cs-textStrong">
                Redactar comunicado
              </h2>

              <form
                className="mt-4 flex flex-col gap-5"
                noValidate
                onSubmit={handleFormSubmit}
              >
                {/* Severidad */}
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-[14px] font-medium text-cs-textBody">
                    Severidad del comunicado
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      aria-pressed={severity === 'INFORMATIVO'}
                      className={`min-h-[48px] rounded-[12px] border px-4 text-[14px] font-medium transition-colors ${
                        severity === 'INFORMATIVO'
                          ? 'border-cs-primary bg-cs-infoBg font-semibold text-cs-navy'
                          : 'border-cs-borderSoft bg-cs-surface text-cs-textBody hover:bg-cs-surfaceInput'
                      }`}
                      onClick={() => setSeverity('INFORMATIVO')}
                      type="button"
                    >
                      Informativo
                    </button>
                    <button
                      aria-pressed={severity === 'URGENTE'}
                      className={`min-h-[48px] rounded-[12px] border px-4 text-[14px] font-medium transition-colors ${
                        severity === 'URGENTE'
                          ? 'border-cs-criticalBorder bg-cs-criticalBg font-semibold text-cs-criticalText'
                          : 'border-cs-borderSoft bg-cs-surface text-cs-warningText hover:border-cs-orange'
                      }`}
                      onClick={() => setSeverity('URGENTE')}
                      type="button"
                    >
                      Urgente (requiere confirmación)
                    </button>
                  </div>
                </fieldset>

                {/* Destinatarios */}
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-[14px] font-medium text-cs-textBody">
                    Destinatarios por ruta
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {ROUTE_AUDIENCE_OPTIONS.map((option) => {
                      const active = selectedRoutes.includes(option.id);
                      return (
                        <button
                          aria-pressed={active}
                          className={`min-h-[48px] rounded-[12px] border px-3.5 text-[13px] font-medium transition-colors ${
                            active
                              ? 'border-cs-primary bg-cs-infoBg font-semibold text-cs-navy'
                              : 'border-cs-borderSoft bg-cs-surface text-cs-textBody hover:bg-cs-surfaceInput'
                          }`}
                          key={option.id}
                          onClick={() =>
                            setSelectedRoutes((current) =>
                              toggleRouteSelection(current, option.id),
                            )
                          }
                          type="button"
                        >
                          {option.displayChip}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Asunto */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[14px] font-medium text-cs-textBody"
                    htmlFor="announcement-title"
                  >
                    Asunto
                  </label>
                  <input
                    aria-invalid={Boolean(errors.title)}
                    className={`h-12 w-full rounded-cs-input border bg-cs-surface px-3.5 text-[15px] text-cs-textStrong placeholder:text-cs-textMuted focus:border-cs-primary focus:outline-none ${
                      errors.title
                        ? 'border-cs-criticalBorder bg-cs-criticalBg/30'
                        : 'border-cs-borderStrong'
                    }`}
                    id="announcement-title"
                    maxLength={90}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (errors.title) {
                        setErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    placeholder="Ej. Desvío temporal en Av. Circunvalar"
                    type="text"
                    value={title}
                  />
                  {errors.title && (
                    <p className="text-[13px] font-medium text-cs-criticalText">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Mensaje oficial */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-[14px] font-medium text-cs-textBody"
                      htmlFor="announcement-message"
                    >
                      Mensaje oficial
                    </label>
                    <span className="text-[12px] text-cs-textMuted">
                      {message.length}/400
                    </span>
                  </div>
                  <textarea
                    aria-invalid={Boolean(errors.message)}
                    className={`min-h-[116px] w-full resize-y rounded-cs-input border bg-cs-surface px-3.5 py-3 text-[15px] leading-[22px] text-cs-textStrong placeholder:text-cs-textMuted focus:border-cs-primary focus:outline-none ${
                      errors.message
                        ? 'border-cs-criticalBorder bg-cs-criticalBg/30'
                        : 'border-cs-borderStrong'
                    }`}
                    id="announcement-message"
                    maxLength={400}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      if (errors.message) {
                        setErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    placeholder="Redacta el comunicado claro y breve para los acudientes..."
                    rows={4}
                    value={message}
                  />
                  {errors.message && (
                    <p className="text-[13px] font-medium text-cs-criticalText">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Feedback */}
                {feedback && (
                  <div
                    role="status"
                    className={`rounded-[12px] border px-4 py-3 text-[14px] font-medium ${
                      feedback.tone === 'success'
                        ? 'border-cs-successBorder bg-cs-successBg text-cs-successText'
                        : 'border-cs-criticalBorder bg-cs-criticalBg text-cs-criticalText'
                    }`}
                  >
                    {feedback.text}
                  </div>
                )}

                {/* Botonera */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    className="min-h-[48px] rounded-cs-button border border-cs-borderStrong bg-cs-surface px-5 text-[15px] font-semibold text-cs-textStrong transition-colors hover:bg-cs-surfaceInput"
                    onClick={handleResetForm}
                    type="button"
                  >
                    Limpiar
                  </button>
                  <button
                    className={`min-h-[48px] flex-1 rounded-cs-button px-5 text-[15px] font-semibold transition-colors disabled:opacity-60 ${
                      severity === 'URGENTE'
                        ? 'border border-cs-criticalBorder bg-cs-criticalBg text-cs-criticalText hover:bg-red-100'
                        : 'bg-cs-primary text-white hover:bg-cs-primaryHover'
                    }`}
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting
                      ? 'Enviando...'
                      : severity === 'URGENTE'
                        ? 'Enviar urgente'
                        : 'Enviar informativo'}
                  </button>
                </div>
              </form>
            </section>

            {/* Columna derecha: Vista previa + Historial */}
            <div className="flex flex-col gap-4">
              {/* Vista previa */}
              <section className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[16px] font-semibold leading-[24px] text-cs-textStrong">
                    Vista previa del comunicado
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                      severity === 'URGENTE'
                        ? 'bg-cs-warningBg text-cs-warningText'
                        : 'bg-cs-infoBg text-cs-navy'
                    }`}
                  >
                    {severity === 'URGENTE' ? 'Urgente' : 'Informativo'}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput/60 p-4">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    height={20}
                    src={
                      severity === 'URGENTE'
                        ? '/icons/triangle-alert-warning.svg'
                        : '/icons/info.svg'
                    }
                    width={20}
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-[14px] font-semibold text-cs-textStrong">
                      {title.trim() ||
                        (severity === 'URGENTE'
                          ? 'Asunto del comunicado urgente'
                          : 'Recordatorio institucional')}
                    </p>
                    <p className="text-[14px] leading-[20px] text-cs-textBody">
                      {message.trim() ||
                        'El mensaje redactado aparecerá aquí tal como lo verán los acudientes.'}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-[18px] text-cs-textMuted">
                  Destinatarios: {audienceSummary.summaryText} (
                  {audienceSummary.recipientCount} acudientes) · Solo lectura
                  (sin chat)
                </p>
              </section>

              {/* Historial y registro de entrega */}
              <section className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[16px] font-semibold leading-[24px] text-cs-textStrong">
                    Historial y registro de entrega
                  </h2>
                  <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
                    {visibleHistory.length}{' '}
                    {visibleHistory.length === 1 ? 'envío' : 'envíos'}
                  </span>
                </div>

                <div
                  aria-label="Filtrar historial por severidad"
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {HISTORY_FILTERS.map((filterItem) => {
                    const active = historyFilter === filterItem.id;
                    return (
                      <button
                        aria-pressed={active}
                        className={`min-h-[40px] rounded-[10px] border px-3 text-[13px] font-medium transition-colors ${
                          active
                            ? 'border-cs-primary bg-cs-infoBg font-semibold text-cs-navy'
                            : 'border-cs-borderSoft bg-cs-surface text-cs-textBody hover:bg-cs-surfaceInput'
                        }`}
                        key={filterItem.id}
                        onClick={() => setHistoryFilter(filterItem.id)}
                        type="button"
                      >
                        {filterItem.label}
                      </button>
                    );
                  })}
                </div>

                {visibleHistory.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput/50 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cs-borderSoft bg-cs-surface">
                      <Image
                        alt=""
                        aria-hidden="true"
                        height={22}
                        src="/icons/bell.svg"
                        width={22}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[15px] font-semibold text-cs-textStrong">
                        Sin comunicados para mostrar
                      </p>
                      <p className="text-[13px] text-cs-textMuted">
                        Aún no hay envíos registrados con este criterio.
                      </p>
                    </div>
                    <button
                      className="min-h-[48px] rounded-cs-button bg-cs-primary px-6 text-[14px] font-semibold text-white transition-colors hover:bg-cs-primaryHover"
                      onClick={() => setHistoryFilter('ALL')}
                      type="button"
                    >
                      Actualizar
                    </button>
                  </div>
                ) : (
                  <ul className="mt-4 flex flex-col divide-y divide-cs-borderSoft">
                    {visibleHistory.map((item) => (
                      <li
                        className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
                        key={item.id}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[14px] font-semibold text-cs-textStrong">
                            {item.title}
                          </p>
                          <span
                            className={`shrink-0 text-[12px] font-semibold ${
                              item.severity === 'URGENTE'
                                ? 'text-cs-warningText'
                                : 'text-cs-textMuted'
                            }`}
                          >
                            {item.severity === 'URGENTE'
                              ? 'Urgente'
                              : 'Informativo'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[13px] text-cs-textMuted">
                            {item.routesSummary} · {item.sentAtLabel}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
                              item.status === 'ENTREGADO'
                                ? 'border-cs-successBorder bg-cs-successBg text-cs-successText'
                                : 'border-cs-borderSoft bg-cs-surfaceInput text-cs-textBody'
                            }`}
                          >
                            {item.status === 'ENTREGADO'
                              ? 'Entregado'
                              : 'En entrega'}{' '}
                            {item.deliveredCount}/{item.recipientCount}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Confirmar envío urgente */}
      {confirmUrgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div
            aria-labelledby="confirm-urgent-title"
            aria-modal="true"
            className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-[20px] bg-cs-surface p-6 text-center shadow-xl"
            role="dialog"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput">
              <Image
                alt=""
                aria-hidden="true"
                height={22}
                src="/icons/bell.svg"
                width={22}
              />
            </div>

            <h2
              className="text-[18px] font-semibold text-cs-textStrong"
              id="confirm-urgent-title"
            >
              Confirmar envío urgente
            </h2>

            <div className="flex w-full items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput/60 p-4 text-left">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={20}
                src="/icons/triangle-alert-critical.svg"
                width={20}
              />
              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-cs-textStrong">
                  Difusión prioritaria · {audienceSummary.recipientCount}{' '}
                  acudientes
                </p>
                <p className="text-[13px] leading-[18px] text-cs-textBody">
                  Se enviará de inmediato a {audienceSummary.summaryText}. Este
                  aviso institucional es de solo lectura, sin respuestas ni
                  chat.
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 pt-1">
              <button
                className="min-h-[48px] rounded-cs-button border border-cs-borderSoft bg-cs-surface text-[15px] font-semibold text-cs-textStrong transition-colors hover:bg-cs-surfaceInput"
                disabled={isSubmitting}
                onClick={() => setConfirmUrgentOpen(false)}
                type="button"
              >
                Volver a editar
              </button>
              <button
                className="min-h-[48px] rounded-cs-button bg-cs-primary text-[15px] font-semibold text-white transition-colors hover:bg-cs-primaryHover disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => {
                  void executeDispatch(true);
                }}
                type="button"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar ahora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
