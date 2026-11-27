'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StudentRole } from '@camino/domain';
import {
  applySimulatedTelemetryPulse,
  canAccessFleetConsole,
  filterFleetUnits,
  INITIAL_PROVISIONAL_FLEET,
  ROLE_DENIED_RF19_MESSAGE,
  ROLE_LABELS,
  type FleetConsoleViewState,
  type FleetVehicleStatus,
  type ProvisionalFleetVehicle,
} from '../telemetry-state';
import { FleetMapCanvas } from './FleetMapCanvas';

const VIEW_STATE_OPTIONS: ReadonlyArray<{
  id: FleetConsoleViewState;
  label: string;
}> = [
  { id: 'active', label: 'Activo' },
  { id: 'loading', label: 'Cargando' },
  { id: 'empty', label: 'Vacío' },
  { id: 'error', label: 'Error mapa' },
  { id: 'denied', label: 'Acceso denegado (RF-19)' },
];

const ROLE_OPTIONS: ReadonlyArray<StudentRole> = [
  'COORDINADORA_CONVIVENCIA',
  'GERENCIA_TRANSPORTE',
  'ADMINISTRADOR_CARTERA',
];

function statusBadgeStyle(status: FleetVehicleStatus): string {
  switch (status) {
    case 'En ruta':
      return 'bg-cs-infoBg text-cs-navy';
    case 'Normal':
      return 'border border-cs-successBorder bg-cs-successBg text-cs-successText';
    case 'Detenido':
      return 'bg-cs-warningBg text-cs-warningText';
  }
}

export function FleetConsoleClient() {
  const [activeRole, setActiveRole] = useState<StudentRole>(
    'COORDINADORA_CONVIVENCIA',
  );
  const [viewState, setViewState] = useState<FleetConsoleViewState>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<ProvisionalFleetVehicle[]>(() => [
    ...INITIAL_PROVISIONAL_FLEET,
  ]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    'bus-01',
  );
  const pulseCountRef = useRef(0);
  const [focusSequence, setFocusSequence] = useState(0);
  const [useFallbackCanvas, setUseFallbackCanvas] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasAccess = canAccessFleetConsole(activeRole) && viewState !== 'denied';

  const visibleVehicles = useMemo(() => {
    if (viewState === 'empty') return [];
    return filterFleetUnits(vehicles, searchQuery);
  }, [vehicles, searchQuery, viewState]);

  const selectedVehicle = useMemo(() => {
    if (visibleVehicles.length === 0) return null;
    return (
      visibleVehicles.find((v) => v.id === selectedVehicleId) ??
      visibleVehicles[0] ??
      null
    );
  }, [visibleVehicles, selectedVehicleId]);

  useEffect(() => {
    if (viewState !== 'active' || !hasAccess) return;
    const timer = setInterval(() => {
      pulseCountRef.current += 1;
      const next = pulseCountRef.current;
      setVehicles((current) => applySimulatedTelemetryPulse(current, next));
    }, 8000);

    return () => clearInterval(timer);
  }, [viewState, hasAccess]);

  function handleRoleChange(role: StudentRole) {
    setActiveRole(role);
    if (!canAccessFleetConsole(role)) {
      setViewState('denied');
    } else if (viewState === 'denied') {
      setViewState('active');
    }
  }

  function handleViewStateChange(nextState: FleetConsoleViewState) {
    setViewState(nextState);
    if (nextState === 'denied') {
      setActiveRole('ADMINISTRADOR_CARTERA');
    } else if (!canAccessFleetConsole(activeRole)) {
      setActiveRole('COORDINADORA_CONVIVENCIA');
    }
  }

  function handleSimulatePulse() {
    pulseCountRef.current += 1;
    const next = pulseCountRef.current;
    setVehicles((current) => applySimulatedTelemetryPulse(current, next));
    if (viewState !== 'active') {
      handleViewStateChange('active');
    }
  }

  const topbarTitle = (() => {
    if (!hasAccess) return 'Telemetría · Acceso restringido';
    switch (viewState) {
      case 'loading':
        return 'Telemetría · Cargando mapa...';
      case 'empty':
        return 'Telemetría · Sin vehículos activos';
      case 'error':
        return 'Telemetría · Error de carga';
      default:
        return 'Telemetría · Mapa global de flota';
    }
  })();

  const isRestrictedRole = !hasAccess;

  const navItems = isRestrictedRole
    ? [
        {
          id: 'resumen',
          label: 'Resumen',
          icon: '/icons/house.svg',
          href: '/' as const,
          active: false,
        },
        {
          id: 'cartera',
          label: 'Cartera',
          icon: '/icons/users.svg',
          href: null,
          active: false,
        },
      ]
    : [
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
          active: false,
        },
        {
          id: 'telemetria',
          label: 'Telemetría',
          icon: '/icons/bus-front-navy.svg',
          href: '/telemetria' as const,
          active: true,
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

  return (
    <div className="flex min-h-screen bg-cs-surfaceInput text-cs-textStrong">
      {/* Sidebar Desktop (240 px exacto Figma) */}
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
              {ROLE_LABELS[activeRole]}
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

      {/* Drawer móvil/tablet (768 px) */}
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
                  className="rounded-lg border border-cs-borderSoft px-2 py-1 text-xs"
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-cs-infoBg px-3 py-1 text-[13px] text-cs-navy">
                {ROLE_LABELS[activeRole]}
              </span>
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
            <p className="text-[13px] text-cs-textMuted">
              Colegio San Benito del Otún
            </p>
          </aside>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Desktop (64 px) + Tablet (768 px) */}
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
                {topbarTitle}
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-cs-infoBg px-3 py-1 text-[13px] leading-[18px] text-cs-navy sm:inline-flex">
              En línea · :3100
            </span>
            <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[13px] leading-[18px] text-cs-warningText sm:hidden">
              PROVISIONAL
            </span>
            <Link
              className="hidden h-10 items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 text-[16px] font-semibold text-cs-successText sm:inline-flex"
              href="/health"
            >
              Estado /health
            </Link>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {/* Barra discreta de control de rol y estados para pruebas FE-21 */}
          <section
            aria-label="Controles de simulación y rol RF-19"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surface px-4 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-medium text-cs-textMuted">
                Estado:
              </span>
              {VIEW_STATE_OPTIONS.map((opt) => (
                <button
                  aria-pressed={viewState === opt.id}
                  className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                    viewState === opt.id
                      ? 'border-cs-primary bg-cs-infoBg text-cs-navy'
                      : 'border-cs-borderSoft bg-cs-surfaceInput text-cs-textBody hover:border-cs-borderStrong'
                  }`}
                  key={opt.id}
                  onClick={() => handleViewStateChange(opt.id)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label
                className="text-[12px] font-medium text-cs-textMuted"
                htmlFor="fleet-role-select"
              >
                Rol (RF-19):
              </label>
              <select
                className="rounded-lg border border-cs-borderStrong bg-cs-surfaceInput px-2.5 py-1 text-[12px] font-medium text-cs-textStrong"
                id="fleet-role-select"
                onChange={(e) =>
                  handleRoleChange(e.target.value as StudentRole)
                }
                value={activeRole}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ESTADO: ACCESO DENEGADO (RF-19) */}
          {!hasAccess && (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-borderSoft bg-cs-surface p-8">
              <div className="flex max-w-[440px] flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cs-criticalBorder bg-cs-criticalBg">
                  <Image
                    alt=""
                    aria-hidden="true"
                    height={28}
                    src="/icons/triangle-alert.svg"
                    width={28}
                  />
                </div>
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Acceso denegado a la consola de flota
                </h1>
                <p className="rounded-full bg-cs-criticalBg px-3 py-1 text-[13px] font-medium text-cs-criticalText">
                  Rol sin permiso (role_not_allowed): {ROLE_DENIED_RF19_MESSAGE}
                </p>
                <p className="text-[14px] leading-[20px] text-cs-textMuted">
                  La vista global de flota es exclusiva para Coordinación y
                  Gerencia de Transporte (RF-19).
                </p>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-cs-button bg-cs-primary px-6 text-[16px] font-semibold text-white hover:bg-cs-primaryHover"
                  href="/"
                >
                  Volver a mi resumen
                </Link>
              </div>
            </section>
          )}

          {/* ESTADO: CARGANDO (solo cliente, sin SSR) */}
          {hasAccess && viewState === 'loading' && (
            <section
              aria-busy="true"
              className="flex flex-1 flex-col items-center justify-center gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-8 text-center"
            >
              <span
                aria-hidden="true"
                className="h-10 w-10 animate-spin rounded-full border-4 border-cs-infoBg border-t-cs-primary"
              />
              <h1 className="text-[20px] font-semibold text-cs-textStrong">
                Cargando mapa de flota (solo cliente)
              </h1>
              <p className="max-w-[480px] text-[14px] text-cs-textMuted">
                Importación dinámica sin SSR de maplibre-gl y sincronización
                inicial.
              </p>
            </section>
          )}

          {/* ESTADO: ERROR DE MAPA / TELEMETRÍA */}
          {hasAccess && viewState === 'error' && (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-criticalBorder bg-cs-surface p-8">
              <div className="flex max-w-[480px] flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cs-criticalBorder bg-cs-criticalBg">
                  <Image
                    alt=""
                    aria-hidden="true"
                    height={26}
                    src="/icons/triangle-alert.svg"
                    width={26}
                  />
                </div>
                <h1 className="text-[22px] font-bold text-cs-textStrong">
                  No fue posible cargar el mapa de flota
                </h1>
                <p className="text-[14px] font-medium text-cs-criticalText">
                  Error al inicializar MapLibre / telemetría
                </p>
                <p className="text-[14px] text-cs-textMuted">
                  Verifica NEXT_PUBLIC_MAPLIBRE_STYLE_URL o la conexión del
                  servicio.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <button
                    className="h-11 rounded-cs-button bg-cs-primary px-5 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                    onClick={() => {
                      setUseFallbackCanvas(false);
                      handleViewStateChange('active');
                    }}
                    type="button"
                  >
                    Reintentar
                  </button>
                  <button
                    className="h-11 rounded-cs-button border border-cs-successBorder bg-cs-successBg px-5 text-[15px] font-semibold text-cs-successText"
                    onClick={() => {
                      setUseFallbackCanvas(true);
                      handleViewStateChange('active');
                    }}
                    type="button"
                  >
                    Activar simulador
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ESTADOS: ACTIVO Y VACÍO */}
          {hasAccess && (viewState === 'active' || viewState === 'empty') && (
            <>
              {/* Toolbar superior */}
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                    Consola de Coordinación · Flota en vivo
                  </h1>
                  <p className="text-[14px] leading-[20px] text-cs-textMuted">
                    Acceso exclusivo para Coordinación y Gerencia de Transporte
                    (RF-19).
                  </p>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex w-full flex-col gap-2 sm:w-[340px]">
                    <label
                      className="text-[14px] font-medium leading-[20px] text-cs-textBody"
                      htmlFor="fleet-filter-input"
                    >
                      Filtrar ruta o unidad
                    </label>
                    <input
                      className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                      id="fleet-filter-input"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="BUS-01, Ruta Norte..."
                      type="text"
                      value={searchQuery}
                    />
                  </div>
                  <button
                    className="h-12 w-full rounded-cs-button bg-cs-primary px-5 text-[16px] font-semibold text-white transition-colors hover:bg-cs-primaryHover sm:w-[168px]"
                    onClick={handleSimulatePulse}
                    type="button"
                  >
                    Simular pulso
                  </button>
                </div>
              </div>

              {/* Split Mapa + Panel de detalle (Desktop) / Apilado (Tablet) */}
              <div className="flex flex-1 flex-col gap-5 lg:flex-row">
                {/* Contenedor Mapa MapLibre GL */}
                <section
                  aria-label="Mapa de flota"
                  className="flex min-h-[472px] flex-1 flex-col overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
                >
                  <div className="relative flex-1 overflow-hidden">
                    {visibleVehicles.length === 0 ? (
                      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
                        <h2 className="text-[18px] font-semibold text-cs-textStrong">
                          Sin recorridos para mostrar
                        </h2>
                        <p className="max-w-[360px] text-[14px] text-cs-textMuted">
                          No hay vehículos reportando recorridos activos en este
                          momento.
                        </p>
                        <button
                          className="mt-1 h-11 rounded-cs-button bg-cs-primary px-5 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                          onClick={() => {
                            setSearchQuery('');
                            handleViewStateChange('active');
                          }}
                          type="button"
                        >
                          Actualizar
                        </button>
                      </div>
                    ) : (
                      <>
                        <FleetMapCanvas
                          focusSequence={focusSequence}
                          onMapLoadError={() => setViewState('error')}
                          onSelectVehicle={(id) => setSelectedVehicleId(id)}
                          selectedVehicleId={selectedVehicle?.id ?? null}
                          useFallbackCanvas={useFallbackCanvas}
                          vehicles={visibleVehicles}
                        />
                        <div className="pointer-events-none absolute left-4 top-4 z-10">
                          <span className="inline-flex items-center rounded-full bg-cs-warningBg px-3 py-1 text-[13px] leading-[18px] text-cs-warningText shadow-sm">
                            Posiciones simuladas PROVISIONAL · Socket.IO
                            pendiente
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Leyenda inferior del mapa */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cs-borderSoft bg-cs-surface px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex rounded-full bg-cs-infoBg px-3 py-1 text-[13px] leading-[18px] text-cs-navy">
                        BUS-01 · En ruta
                      </span>
                      <span className="inline-flex rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[13px] leading-[18px] text-cs-successText">
                        BUS-02 · Normal
                      </span>
                      <span className="inline-flex rounded-full bg-cs-warningBg px-3 py-1 text-[13px] leading-[18px] text-cs-warningText">
                        BUS-03 · Detenido
                      </span>
                    </div>
                    <span className="text-[13px] leading-[18px] text-cs-textMuted">
                      MapLibre GL · Solo cliente
                    </span>
                  </div>
                </section>

                {/* Panel lateral de detalle vehículo (360 px desktop) */}
                <aside
                  aria-label="Detalle del vehículo seleccionado"
                  className="flex w-full shrink-0 flex-col gap-3.5 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 lg:w-[360px]"
                >
                  {!selectedVehicle ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
                      <h2 className="text-[18px] font-semibold text-cs-textStrong">
                        Sin vehículo seleccionado
                      </h2>
                      <p className="text-[14px] text-cs-textMuted">
                        Selecciona un marcador de bus en el mapa para
                        inspeccionar su ruta y estado.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h2 className="text-[18px] font-semibold leading-[26px] text-cs-textStrong">
                            Unidad {selectedVehicle.code}
                          </h2>
                          <p className="text-[13px] leading-[18px] text-cs-textMuted">
                            {selectedVehicle.routeName} ·{' '}
                            {selectedVehicle.routeCode}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] leading-[18px] ${statusBadgeStyle(
                            selectedVehicle.status,
                          )}`}
                        >
                          {selectedVehicle.status}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 rounded-cs-card border border-cs-cyan bg-cs-infoBg p-4 text-cs-navy">
                        <Image
                          alt=""
                          aria-hidden="true"
                          className="mt-0.5 shrink-0"
                          height={24}
                          src="/icons/info.svg"
                          width={24}
                        />
                        <div className="flex flex-col gap-1 text-[14px] leading-[20px]">
                          <p className="font-medium">Telemetría PROVISIONAL</p>
                          <p className="font-normal">
                            Sin cálculo de ETA en el cliente (RF-19).
                          </p>
                        </div>
                      </div>

                      <dl className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2 rounded-[12px] bg-cs-surfaceInput px-3 py-2.5">
                          <dt className="text-[13px] text-cs-textMuted">
                            Placa / Vehículo
                          </dt>
                          <dd className="text-[14px] font-medium text-cs-textStrong">
                            {selectedVehicle.plate} ·{' '}
                            {selectedVehicle.capacityLabel}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-[12px] bg-cs-surfaceInput px-3 py-2.5">
                          <dt className="text-[13px] text-cs-textMuted">
                            Ocupación actual
                          </dt>
                          <dd className="text-[14px] font-medium text-cs-textStrong">
                            {selectedVehicle.occupancyLabel}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-[12px] bg-cs-surfaceInput px-3 py-2.5">
                          <dt className="text-[13px] text-cs-textMuted">
                            Última parada
                          </dt>
                          <dd className="text-[14px] font-medium text-cs-textStrong">
                            {selectedVehicle.lastStop}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-[12px] bg-cs-surfaceInput px-3 py-2.5">
                          <dt className="text-[13px] text-cs-textMuted">
                            Último paquete
                          </dt>
                          <dd className="text-[14px] font-medium text-cs-textStrong">
                            {selectedVehicle.lastPacketLabel}
                          </dd>
                        </div>
                      </dl>

                      <p className="text-[14px] font-medium text-cs-textBody">
                        Flota activa (seleccionar vehículo)
                      </p>

                      <div className="flex flex-col gap-2">
                        {visibleVehicles
                          .filter((v) => v.id !== selectedVehicle.id)
                          .map((unit) => (
                            <button
                              className="flex w-full items-center justify-between rounded-[12px] border border-cs-borderSoft bg-cs-surface px-3 py-2.5 text-left transition-colors hover:border-cs-borderStrong"
                              key={unit.id}
                              onClick={() => setSelectedVehicleId(unit.id)}
                              type="button"
                            >
                              <span className="text-[14px] text-cs-textStrong">
                                {unit.code} · {unit.routeName}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] leading-[18px] ${statusBadgeStyle(
                                  unit.status,
                                )}`}
                              >
                                {unit.status}
                              </span>
                            </button>
                          ))}
                      </div>

                      <button
                        className="mt-1 flex h-11 w-full items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-3 text-[16px] font-semibold text-cs-successText transition-colors hover:bg-emerald-100"
                        onClick={() => setFocusSequence((seq) => seq + 1)}
                        type="button"
                      >
                        Centrar vehículo en mapa
                      </button>
                    </>
                  )}
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
