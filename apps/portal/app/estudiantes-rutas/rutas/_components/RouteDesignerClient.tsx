'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StudentRole } from '@camino/domain';
import {
  addStopBeforeDestination,
  getRouteDesignerCapabilities,
  INITIAL_ROUTE_DRAFT,
  moveStopByDelta,
  removeStopById,
  updateStopScheduleTime,
  validateAndSaveRouteMock,
  type DrawToolMode,
  type RouteDraftModel,
} from '../../../../src/features/routes/route-designer';
import { RouteDesignerMap } from './RouteDesignerMap';

interface RouteDesignerClientProps {
  initialRole?: StudentRole;
  initialPublishedPreview?: boolean;
}

export function RouteDesignerClient({
  initialRole = 'COORDINADORA_CONVIVENCIA',
  initialPublishedPreview = false,
}: RouteDesignerClientProps) {
  const capabilities = getRouteDesignerCapabilities(initialRole);

  const [draft, setDraft] = useState<RouteDraftModel>(() => ({
    ...INITIAL_ROUTE_DRAFT,
    status:
      initialPublishedPreview || !capabilities.canEdit
        ? 'Publicada'
        : 'Borrador',
    stops: [...INITIAL_ROUTE_DRAFT.stops],
  }));
  const [selectedStopId, setSelectedStopId] = useState<string>('stop-3');
  const [toolMode, setToolMode] = useState<DrawToolMode>('select');
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(
    initialPublishedPreview || !capabilities.canEdit,
  );
  const [validationBanner, setValidationBanner] = useState<{
    title: string;
    detail: string;
    invalidStopId: string;
  } | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveReadOnly = !capabilities.canEdit || readOnlyMode;

  const selectedStop = useMemo(
    () =>
      draft.stops.find((s) => s.id === selectedStopId) ??
      draft.stops[0] ??
      null,
    [draft.stops, selectedStopId],
  );

  function handleAddStopAtCoords(coords: {
    latitude: number;
    longitude: number;
  }) {
    if (effectiveReadOnly) return;
    setValidationBanner(null);
    setSaveFeedback(null);
    const { stops, added } = addStopBeforeDestination(draft.stops, coords);
    setDraft((prev) => ({ ...prev, stops }));
    setSelectedStopId(added.id);
    setToolMode('select');
  }

  function handleAddStopFromButton() {
    if (effectiveReadOnly) return;
    handleAddStopAtCoords({
      latitude: 4.8102 + (draft.stops.length % 3) * 0.0012,
      longitude: -75.6938 - (draft.stops.length % 3) * 0.001,
    });
  }

  function handleSelectStop(stopId: string) {
    if (!effectiveReadOnly && toolMode === 'delete') {
      const target = draft.stops.find((s) => s.id === stopId);
      if (target && !target.isSchoolDestination) {
        setDraft((prev) => ({
          ...prev,
          stops: removeStopById(prev.stops, stopId),
        }));
        setValidationBanner(null);
        setSaveFeedback(null);
        return;
      }
    }
    setSelectedStopId(stopId);
  }

  function handleMoveStop(stopId: string, delta: -1 | 1) {
    if (effectiveReadOnly) return;
    setValidationBanner(null);
    setSaveFeedback(null);
    setDraft((prev) => ({
      ...prev,
      stops: moveStopByDelta(prev.stops, stopId, delta),
    }));
  }

  function handleChangeStopTime(stopId: string, value: string) {
    if (effectiveReadOnly) return;
    setValidationBanner(null);
    setSaveFeedback(null);
    setDraft((prev) => ({
      ...prev,
      stops: updateStopScheduleTime(prev.stops, stopId, value),
    }));
  }

  function handleSaveOrPublish(publish: boolean) {
    if (!capabilities.canEdit) return;
    const result = validateAndSaveRouteMock(draft, publish);
    if (!result.ok) {
      setDraft((prev) => ({ ...prev, stops: result.stops }));
      setValidationBanner({
        title: result.error.message,
        detail: result.detailMessage,
        invalidStopId: result.invalidStopId,
      });
      setSaveFeedback(null);
      setSelectedStopId(result.invalidStopId);
      return;
    }

    setValidationBanner(null);
    setDraft((prev) => ({
      ...prev,
      stops: result.stops,
      status: publish ? 'Publicada' : 'Borrador',
      version: publish ? prev.version + 1 : prev.version,
    }));
    setSaveFeedback(
      publish
        ? 'Ruta publicada y bloqueada para operación.'
        : 'Borrador guardado correctamente.',
    );
    if (publish) {
      setReadOnlyMode(true);
    }
  }

  function handleDiscardChanges() {
    if (!capabilities.canEdit) return;
    setDraft({
      ...INITIAL_ROUTE_DRAFT,
      stops: [...INITIAL_ROUTE_DRAFT.stops],
    });
    setValidationBanner(null);
    setSaveFeedback(null);
    setSelectedStopId('stop-3');
    setToolMode('select');
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
      href: '/estudiantes-rutas' as const,
      active: true,
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

  const nonDestinationCount = draft.stops.filter(
    (s) => !s.isSchoolDestination,
  ).length;

  return (
    <div className="flex min-h-screen w-full bg-cs-bg">
      {/* Sidebar Desktop (240 px) */}
      <aside className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-cs-borderSoft bg-cs-surface px-4 py-5 lg:flex">
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
          <span className="inline-flex w-fit items-center rounded-full bg-cs-infoBg px-3 py-1 text-[12px] font-medium text-cs-navy">
            {effectiveReadOnly && !capabilities.canEdit
              ? 'SOLO LECTURA'
              : capabilities.roleLabel}
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

        <p className="text-[13px] leading-[18px] text-cs-textMuted">
          Colegio San Benito del Otún
        </p>
      </aside>

      {/* Drawer Tablet (768 px) */}
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
                      aria-disabled="true"
                      className="flex h-12 cursor-default items-center gap-3 rounded-[12px] px-3 text-[14px] font-medium text-cs-textMuted"
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
                {effectiveReadOnly
                  ? 'Estudiantes y rutas · Vista de ruta publicada'
                  : 'Estudiantes y rutas · Diseñador de rutas'}
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surface px-3.5 text-[14px] font-medium text-cs-textBody hover:border-cs-borderStrong"
              href="/estudiantes-rutas"
            >
              Aprobaciones
            </Link>
            <Link
              className="hidden h-10 items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 text-[16px] font-semibold text-cs-successText lg:inline-flex"
              href="/health"
            >
              Estado /health
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                {effectiveReadOnly
                  ? `${draft.name} (Publicada)`
                  : 'Diseñador de rutas · Mapa y paradas'}
              </h1>
              <p className="text-[14px] leading-[20px] text-cs-textMuted">
                {effectiveReadOnly
                  ? 'Vista de ruta publicada en modo solo lectura. La edición requiere rol autorizado en el portal web.'
                  : 'Ubica paradas sobre el mapa, ajusta orden y horario previsto. El trazado final se valida al guardar.'}
              </p>
            </div>

            {capabilities.canEdit ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                  onClick={() => setReadOnlyMode((prev) => !prev)}
                  type="button"
                >
                  {effectiveReadOnly
                    ? 'Volver al editor'
                    : 'Vista solo lectura'}
                </button>
                {!effectiveReadOnly && (
                  <button
                    className="h-11 rounded-cs-button bg-cs-primary px-5 text-[14px] font-semibold text-white hover:bg-cs-primaryHover"
                    onClick={() => handleSaveOrPublish(false)}
                    type="button"
                  >
                    {validationBanner ? 'Reintentar guardado' : 'Guardar ruta'}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[12px] font-medium text-cs-successText">
                  Publicada · v{draft.version}
                </span>
                <span className="inline-flex h-11 items-center rounded-cs-button border border-cs-borderSoft bg-cs-surfaceInput px-4 text-[14px] font-semibold text-cs-textMuted">
                  Solo Coordinación edita
                </span>
              </div>
            )}
          </div>

          {/* Banner de solo lectura cuando no tiene permisos */}
          {!capabilities.canEdit && (
            <div className="flex items-start gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-4">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={22}
                src="/icons/info.svg"
                width={22}
              />
              <div className="flex flex-col gap-0.5 text-[14px]">
                <p className="font-semibold text-cs-textStrong">
                  Modo solo lectura · Herramientas de edición deshabilitadas
                </p>
                <p className="text-cs-textMuted">
                  Esta ruta está publicada y bloqueada para este perfil. Solo
                  Coordinación puede modificar paradas desde el portal web.
                </p>
              </div>
            </div>
          )}

          {/* Banner de validación */}
          {validationBanner && (
            <div
              className="flex items-start gap-3 rounded-cs-card border border-cs-criticalBorder bg-cs-surface p-4"
              role="alert"
            >
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={22}
                src="/icons/triangle-alert-critical.svg"
                width={22}
              />
              <div className="flex flex-col gap-0.5 text-[14px]">
                <p className="font-semibold text-cs-criticalText">
                  {validationBanner.title}
                </p>
                <p className="text-cs-textMuted">{validationBanner.detail}</p>
              </div>
            </div>
          )}

          {/* Banner confirmación guardado */}
          {saveFeedback && !validationBanner && (
            <div
              className="flex items-center gap-3 rounded-cs-card border border-cs-successBorder bg-cs-successBg px-4 py-3 text-[14px] font-medium text-cs-successText"
              role="status"
            >
              <Image
                alt=""
                aria-hidden="true"
                height={20}
                src="/icons/circle-check.svg"
                width={20}
              />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Split Mapa + Panel derecho de paradas */}
          <div className="flex flex-1 flex-col gap-5 lg:flex-row">
            {/* Mapa */}
            <section
              aria-label="Mapa de diseño de ruta"
              className="flex flex-1 flex-col overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
            >
              <RouteDesignerMap
                invalidStopId={validationBanner?.invalidStopId ?? null}
                onAddStopAtCoords={handleAddStopAtCoords}
                onSelectStop={handleSelectStop}
                onSelectToolMode={setToolMode}
                publishedSummaryText={`Trazado validado · ${draft.publishedSummary.distanceLabel} · ${draft.publishedSummary.durationLabel}`}
                readOnly={effectiveReadOnly}
                selectedStopId={selectedStop?.id ?? null}
                stops={draft.stops}
                toolMode={toolMode}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cs-borderSoft bg-cs-surface px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
                    {effectiveReadOnly
                      ? 'Ruta publicada vigente'
                      : `1–${nonDestinationCount} Paradas`}
                  </span>
                  {!effectiveReadOnly && (
                    <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[12px] font-medium text-cs-successText">
                      {draft.stops.length} Destino colegio
                    </span>
                  )}
                  {validationBanner && (
                    <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[12px] font-medium text-cs-warningText">
                      Parada observada
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-cs-textMuted">
                  {effectiveReadOnly
                    ? 'Mapa operativo · Solo visualización'
                    : 'Editor interactivo de paradas'}
                </span>
              </div>
            </section>

            {/* Panel derecho: Paradas y horario */}
            <aside
              aria-label="Paradas y horario previsto"
              className="flex w-full shrink-0 flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 lg:w-[400px]"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[18px] font-semibold text-cs-textStrong">
                  {effectiveReadOnly
                    ? `Itinerario oficial (${draft.stops.length} paradas)`
                    : 'Paradas y horario'}
                </h2>
                <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textMuted">
                  {effectiveReadOnly
                    ? 'Bloqueada'
                    : `${draft.status} · ${draft.stops.length}`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput px-3.5 py-3">
                <div className="flex flex-col">
                  <span
                    className={`text-[14px] font-semibold ${
                      effectiveReadOnly
                        ? 'text-cs-successText'
                        : 'text-cs-textStrong'
                    }`}
                  >
                    {effectiveReadOnly
                      ? `${draft.code} · Publicada por ${draft.publishedSummary.publishedBy}`
                      : draft.name}
                  </span>
                  <span className="text-[12px] text-cs-textMuted">
                    {effectiveReadOnly
                      ? `Bus ${draft.busCode} · Salida ${draft.stops[0]?.scheduledTime ?? '06:10'} · Llegada ${draft.stops[draft.stops.length - 1]?.scheduledTime ?? '06:40'}`
                      : `Código: ${draft.code} · Bus ${draft.busCode}`}
                  </span>
                </div>
                {!effectiveReadOnly && (
                  <span className="rounded-full border border-cs-borderSoft bg-cs-surface px-2.5 py-0.5 text-[11px] font-medium text-cs-textMuted">
                    Activa
                  </span>
                )}
              </div>

              <ol className="flex flex-col gap-2.5">
                {draft.stops.map((stop, idx) => {
                  const isInvalid = stop.id === validationBanner?.invalidStopId;
                  const isSelected = stop.id === selectedStop?.id;
                  const canMoveUp =
                    !effectiveReadOnly && !stop.isSchoolDestination && idx > 0;
                  const canMoveDown =
                    !effectiveReadOnly &&
                    !stop.isSchoolDestination &&
                    idx < nonDestinationCount - 1;

                  return (
                    <li
                      className={`flex flex-col gap-2 rounded-[12px] border p-3 transition-colors ${
                        isInvalid
                          ? 'border-cs-criticalBorder bg-cs-criticalBg/40'
                          : isSelected && !effectiveReadOnly
                            ? 'border-cs-primary bg-cs-infoBg/25'
                            : 'border-cs-borderSoft bg-cs-surfaceInput'
                      }`}
                      key={stop.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus:outline-none"
                          onClick={() => handleSelectStop(stop.id)}
                          type="button"
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${
                              isInvalid
                                ? 'bg-[#dc2626]'
                                : effectiveReadOnly
                                  ? 'bg-[#047857]'
                                  : 'bg-cs-textStrong'
                            }`}
                          >
                            {stop.order}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-cs-textStrong">
                              {stop.name}
                            </p>
                            <p className="truncate text-[12px] text-cs-textMuted">
                              {stop.isSchoolDestination
                                ? stop.zoneLabel
                                : `${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)} · ${stop.zoneLabel}`}
                            </p>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center gap-1.5">
                          {effectiveReadOnly ? (
                            <span className="rounded-md border border-cs-borderSoft bg-cs-surface px-2.5 py-1 text-[13px] font-medium text-cs-textStrong">
                              {stop.scheduledTime}
                            </span>
                          ) : (
                            <>
                              <input
                                aria-label={`Horario parada ${stop.order}`}
                                className="h-8 w-[64px] rounded-md border border-cs-borderStrong bg-cs-surface px-2 text-center text-[13px] font-medium text-cs-textStrong focus:outline-none focus:ring-2 focus:ring-cs-primary"
                                onChange={(e) =>
                                  handleChangeStopTime(stop.id, e.target.value)
                                }
                                type="text"
                                value={stop.scheduledTime}
                              />
                              <div className="flex items-center gap-0.5">
                                <button
                                  aria-label={`Subir parada ${stop.order}`}
                                  className="rounded px-1 text-[12px] font-bold text-cs-textBody hover:bg-white disabled:opacity-30"
                                  disabled={!canMoveUp}
                                  onClick={() => handleMoveStop(stop.id, -1)}
                                  type="button"
                                >
                                  ↑
                                </button>
                                <button
                                  aria-label={`Bajar parada ${stop.order}`}
                                  className="rounded px-1 text-[12px] font-bold text-cs-textBody hover:bg-white disabled:opacity-30"
                                  disabled={!canMoveDown}
                                  onClick={() => handleMoveStop(stop.id, 1)}
                                  type="button"
                                >
                                  ↓
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {stop.validationIssue && (
                        <p className="text-[12px] font-medium text-cs-criticalText">
                          {stop.validationIssue}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>

              {effectiveReadOnly ? (
                <p className="text-[12px] leading-[18px] text-cs-textMuted">
                  Sin acciones de guardado ni dibujo disponibles para este
                  perfil. Cambios permitidos únicamente desde el portal web con
                  rol autorizado.
                </p>
              ) : (
                <>
                  <p className="text-[12px] leading-[18px] text-cs-textMuted">
                    El trazado y las distancias se calculan automáticamente al
                    guardar la ruta en el servidor.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {validationBanner ? (
                      <button
                        className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                        onClick={handleDiscardChanges}
                        type="button"
                      >
                        Descartar
                      </button>
                    ) : (
                      <button
                        className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                        onClick={handleAddStopFromButton}
                        type="button"
                      >
                        Agregar parada
                      </button>
                    )}
                    <button
                      className="h-11 rounded-cs-button bg-cs-primary px-4 text-[14px] font-semibold text-white hover:bg-cs-primaryHover"
                      onClick={() => handleSaveOrPublish(true)}
                      type="button"
                    >
                      Publicar ruta
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
