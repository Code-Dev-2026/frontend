'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  filterConsoleAlerts,
  INITIAL_ALERTS,
  INITIAL_TIMELINES,
  STUDENT_STATE_CHIP_META,
  type AlertCategory,
  type AlertStatus,
  type ConsoleAlert,
  type StudentTransitionEntry,
} from '../alerts-state';
import { DeviationMapPreview } from './DeviationMapPreview';

function alertCardStyle(alert: ConsoleAlert): string {
  switch (alert.severity) {
    case 'critical':
      return 'border-cs-criticalBorder bg-cs-criticalBg';
    case 'high':
    case 'medium':
      return 'border-[#fed7aa] bg-cs-warningBg';
    case 'resolved':
      return 'border-cs-borderSoft bg-cs-surface';
  }
}

function alertTitleColor(alert: ConsoleAlert): string {
  switch (alert.severity) {
    case 'critical':
      return 'text-cs-criticalText';
    case 'high':
    case 'medium':
      return 'text-cs-warningText';
    case 'resolved':
      return 'text-cs-textStrong';
  }
}

function alertIconPath(alert: ConsoleAlert): string {
  switch (alert.severity) {
    case 'critical':
      return '/icons/triangle-alert-critical.svg';
    case 'high':
    case 'medium':
      return '/icons/triangle-alert-warning.svg';
    case 'resolved':
      return '/icons/circle-check.svg';
  }
}

export function CustodiaAlertsClient() {
  const [alerts] = useState<ConsoleAlert[]>(() => [...INITIAL_ALERTS]);
  const [timelines] = useState<Record<string, StudentTransitionEntry[]>>(
    () => ({
      ...INITIAL_TIMELINES,
    }),
  );
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'all'>(
    'all',
  );
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>(
    'active',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentRef, setSelectedStudentRef] =
    useState<string>('#E-104');
  const [focusedMapAlertId, setFocusedMapAlertId] =
    useState<string>('alert-dev-1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleAlerts = useMemo(
    () =>
      filterConsoleAlerts(alerts, {
        category: categoryFilter,
        routeName: routeFilter,
        status: statusFilter,
        query: searchQuery,
      }),
    [alerts, categoryFilter, routeFilter, statusFilter, searchQuery],
  );

  const activeCount = useMemo(
    () => alerts.filter((a) => a.status === 'active').length,
    [alerts],
  );

  const delayBannerAlert = useMemo(
    () =>
      alerts.find((a) => a.category === 'delay' && a.status === 'active') ??
      null,
    [alerts],
  );

  const focusedMapAlert = useMemo(
    () =>
      alerts.find((a) => a.id === focusedMapAlertId) ??
      alerts.find((a) => a.highlightOnMap) ??
      visibleAlerts[0] ??
      null,
    [alerts, focusedMapAlertId, visibleAlerts],
  );

  const currentTimeline = timelines[selectedStudentRef] ?? [];

  function resetFilters() {
    setCategoryFilter('all');
    setRouteFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  }

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
      href: null,
      active: false,
    },
    {
      id: 'custodia',
      label: 'Custodia',
      icon: '/icons/shield-check.svg',
      href: '/custodia' as const,
      active: true,
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
      href: null,
      active: false,
    },
    {
      id: 'cartera',
      label: 'Cartera',
      icon: '/icons/users.svg',
      href: null,
      active: false,
    },
  ];

  const isEmpty = visibleAlerts.length === 0;

  return (
    <div className="flex min-h-screen bg-cs-surfaceInput text-cs-textStrong">
      {/* Sidebar Desktop */}
      <aside
        aria-label="Navegación lateral"
        className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-cs-borderSoft bg-cs-surface p-4 lg:flex"
      >
        <div className="flex flex-col gap-3">
          <div className="flex w-[140px] flex-col items-center p-4">
            <Image
              alt="Camino Seguro"
              height={116}
              priority
              src="/logo-camino-seguro.svg"
              width={104}
            />
          </div>
          <p className="text-[14px] font-medium leading-[20px] text-cs-navy">
            Portal operativo
          </p>
          <div>
            <span className="inline-flex items-center rounded-full bg-cs-infoBg px-3 py-1 text-[13px] leading-[18px] text-cs-navy">
              COORDINACIÓN
            </span>
          </div>

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
                  className="flex h-12 cursor-default items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium leading-[20px] text-cs-textBody"
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

        <p className="text-[13px] leading-[18px] text-cs-textMuted">
          Colegio San Benito del Otún
        </p>
      </aside>

      {/* Drawer Tablet */}
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
                  className="rounded-lg border border-cs-borderSoft px-2 py-1 text-xs"
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
              <nav className="mt-2 flex flex-col gap-1">
                {navItems.map((item) =>
                  item.href ? (
                    <Link
                      className={`flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium ${
                        item.active
                          ? 'bg-cs-infoBg text-cs-navy'
                          : 'text-cs-textBody'
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
                      className="flex h-12 items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium text-cs-textBody"
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
          </aside>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-cs-borderSoft bg-cs-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir navegación"
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-cs-borderSoft bg-cs-surface text-cs-navy lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              ☰
            </button>
            <div className="flex flex-col">
              <span className="text-[18px] font-semibold leading-[26px] text-cs-textStrong">
                {isEmpty
                  ? 'Custodia y Alertas · Sin novedades'
                  : 'Custodia y Alertas · Consola operativa'}
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[13px] text-cs-warningText lg:hidden">
              {activeCount} alertas activas
            </span>
            <span className="hidden rounded-full bg-cs-infoBg px-3 py-1 text-[13px] text-cs-navy lg:inline-flex">
              En línea · :3100
            </span>
            <Link
              className="hidden h-10 items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 text-[16px] font-semibold text-cs-successText lg:inline-flex"
              href="/health"
            >
              Estado /health
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
              Alertas rojas, desvíos y retrasos anómalos
            </h1>
            <p className="text-[14px] leading-[20px] text-cs-textMuted">
              Monitoreo de desvíos de ruta, retrasos anómalos y alertas de
              custodia activas.
            </p>
          </div>

          {/* Alarma de retraso anómalo (> 25 min) */}
          {delayBannerAlert && (
            <div
              className="flex items-start gap-3 rounded-cs-card border border-[#fdba74] bg-cs-warningBg p-4 text-cs-warningText"
              role="status"
            >
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={24}
                src="/icons/triangle-alert-warning.svg"
                width={24}
              />
              <div className="flex flex-col gap-0.5 text-[14px] leading-[20px]">
                <p className="font-medium">
                  Alarma de retraso anómalo (&gt; 25 min de holgura)
                </p>
                <p>
                  {delayBannerAlert.routeName} ({delayBannerAlert.unitCode})
                  supera los 25 minutos de holgura operativa (+
                  {delayBannerAlert.delayMinutes ?? 29} min).
                </p>
              </div>
            </div>
          )}

          {/* Barra de filtros por tipo, ruta y estado */}
          <section
            aria-label="Filtros de alertas"
            className="flex flex-col justify-between gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-4 lg:flex-row lg:items-end"
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                aria-pressed={categoryFilter === 'all'}
                className={`rounded-full px-3 py-1 text-[13px] ${
                  categoryFilter === 'all'
                    ? 'bg-cs-infoBg font-medium text-cs-navy'
                    : 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textMuted'
                }`}
                onClick={() => setCategoryFilter('all')}
                type="button"
              >
                Tipo: Todos ({alerts.length})
              </button>
              <button
                aria-pressed={categoryFilter === 'red_alert'}
                className={`rounded-full px-3 py-1 text-[13px] ${
                  categoryFilter === 'red_alert'
                    ? 'bg-cs-criticalBg font-medium text-cs-criticalText'
                    : 'bg-cs-warningBg text-cs-warningText'
                }`}
                onClick={() => setCategoryFilter('red_alert')}
                type="button"
              >
                Alerta roja (
                {alerts.filter((a) => a.category === 'red_alert').length})
              </button>
              <button
                aria-pressed={categoryFilter === 'deviation'}
                className={`rounded-full px-3 py-1 text-[13px] ${
                  categoryFilter === 'deviation'
                    ? 'bg-cs-infoBg font-medium text-cs-navy'
                    : 'bg-cs-warningBg text-cs-warningText'
                }`}
                onClick={() => setCategoryFilter('deviation')}
                type="button"
              >
                Desvío &gt; 300 m (
                {alerts.filter((a) => a.category === 'deviation').length})
              </button>
              <button
                aria-pressed={categoryFilter === 'delay'}
                className={`rounded-full px-3 py-1 text-[13px] ${
                  categoryFilter === 'delay'
                    ? 'bg-cs-infoBg font-medium text-cs-navy'
                    : 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textMuted'
                }`}
                onClick={() => setCategoryFilter('delay')}
                type="button"
              >
                Retraso &gt; 25 min (
                {alerts.filter((a) => a.category === 'delay').length})
              </button>

              <select
                aria-label="Filtrar por ruta"
                className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] text-cs-textBody"
                onChange={(e) => setRouteFilter(e.target.value)}
                value={routeFilter}
              >
                <option value="all">Ruta: Todas</option>
                <option value="Ruta Sur">Ruta Sur</option>
                <option value="Ruta Centro">Ruta Centro</option>
                <option value="Ruta Norte">Ruta Norte</option>
              </select>

              <select
                aria-label="Filtrar por estado"
                className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[13px] text-cs-successText"
                onChange={(e) =>
                  setStatusFilter(e.target.value as AlertStatus | 'all')
                }
                value={statusFilter}
              >
                <option value="active">Estado: Activas</option>
                <option value="all">Estado: Todas</option>
                <option value="resolved">Estado: Resueltas</option>
              </select>
            </div>

            <div className="flex w-full flex-col gap-1.5 lg:w-[270px]">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="alert-search-input"
              >
                Buscar alerta
              </label>
              <input
                className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                id="alert-search-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUS-03, Ruta Sur..."
                type="text"
                value={searchQuery}
              />
            </div>
          </section>

          {/* Contenido principal: Vacío o Split Lista + Mapa/Timeline */}
          {isEmpty ? (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-borderSoft bg-cs-surface p-10 text-center">
              <div className="flex max-w-[400px] flex-col items-center gap-3">
                <h2 className="text-[18px] font-semibold text-cs-textStrong">
                  Sin recorridos para mostrar
                </h2>
                <p className="text-[14px] text-cs-textMuted">
                  Sin alertas rojas, desvíos (&gt; 300 m) ni retrasos anómalos
                  (&gt; 25 min) para los filtros actuales.
                </p>
                <button
                  className="mt-2 h-11 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                  onClick={resetFilters}
                  type="button"
                >
                  Actualizar
                </button>
              </div>
            </section>
          ) : (
            <div className="flex flex-1 flex-col gap-5 lg:flex-row">
              {/* Lista de alertas por prioridad */}
              <section
                aria-label="Listado priorizado de alertas"
                className="flex flex-1 flex-col gap-3"
              >
                {visibleAlerts.map((alert) => (
                  <article
                    className={`flex flex-col gap-2.5 rounded-cs-card border p-4 ${alertCardStyle(
                      alert,
                    )}`}
                    key={alert.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Image
                          alt=""
                          aria-hidden="true"
                          height={20}
                          src={alertIconPath(alert)}
                          width={20}
                        />
                        <h2
                          className={`text-[17px] font-semibold ${alertTitleColor(
                            alert,
                          )}`}
                        >
                          {alert.title}
                        </h2>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                          alert.severity === 'resolved'
                            ? 'border border-cs-successBorder bg-cs-successBg text-cs-successText'
                            : 'bg-white/70 text-cs-textBody'
                        }`}
                      >
                        {alert.badgeLabel}
                      </span>
                    </div>

                    <p
                      className={`text-[14px] leading-[20px] ${
                        alert.severity === 'critical'
                          ? 'text-cs-criticalText'
                          : alert.severity === 'resolved'
                            ? 'text-cs-textMuted'
                            : 'text-cs-warningText'
                      }`}
                    >
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cs-borderSoft bg-white px-3 py-0.5 text-[12px] text-cs-textMuted">
                          {alert.priorityTag}
                        </span>
                        {alert.highlightOnMap && (
                          <span className="rounded-full bg-cs-infoBg px-3 py-0.5 text-[12px] text-cs-navy">
                            Resaltado en mapa
                          </span>
                        )}
                      </div>

                      <button
                        className={`text-[13px] font-semibold hover:underline ${alertTitleColor(
                          alert,
                        )}`}
                        onClick={() => {
                          setSelectedStudentRef(alert.studentRef);
                          setFocusedMapAlertId(alert.id);
                        }}
                        type="button"
                      >
                        {alert.actionLabel}
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              {/* Columna derecha: Mini-mapa desvío + Línea de tiempo (@camino/domain) */}
              <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[380px]">
                {/* Tarjeta mini-mapa de desvío */}
                <div className="overflow-hidden rounded-cs-card border border-cs-criticalBorder bg-cs-surface">
                  <div className="relative">
                    <DeviationMapPreview focusedAlert={focusedMapAlert} />
                    <div className="pointer-events-none absolute left-3 top-3 z-10">
                      <span className="inline-flex rounded-full bg-cs-warningBg px-3 py-1 text-[12px] font-medium text-cs-warningText shadow-sm">
                        {focusedMapAlert?.deviationMeters
                          ? `Desvío +${focusedMapAlert.deviationMeters} m · ${focusedMapAlert.unitCode}`
                          : `${focusedMapAlert?.unitCode ?? 'BUS-03'} · Vista consola`}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-cs-criticalBorder bg-cs-criticalBg px-4 py-2.5 text-[13px] font-medium text-cs-criticalText">
                    Desvío superior a 300 m (
                    {focusedMapAlert?.routeName ?? 'Ruta Sur'})
                  </div>
                </div>

                {/* Línea de tiempo de transiciones */}
                <div className="flex flex-col gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[18px] font-semibold text-cs-textStrong">
                      Transiciones · {selectedStudentRef}
                    </h2>
                    <span className="rounded-full bg-cs-infoBg px-3 py-1 text-[12px] font-medium text-cs-navy">
                      {currentTimeline.length} registros
                    </span>
                  </div>

                  <ol className="flex flex-col gap-3">
                    {currentTimeline.map((entry) => {
                      const chip = STUDENT_STATE_CHIP_META[entry.state];
                      return (
                        <li
                          className="flex flex-col gap-2 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3"
                          key={entry.id}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold text-cs-textStrong">
                              {entry.time} · {chip.label}
                            </span>
                            <span className="text-[12px] text-cs-textMuted">
                              {entry.detail}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 text-[13px] font-medium ${chip.toneClass}`}
                          >
                            <Image
                              alt=""
                              aria-hidden="true"
                              height={20}
                              src={chip.icon}
                              width={20}
                            />
                            <span>{chip.label}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
