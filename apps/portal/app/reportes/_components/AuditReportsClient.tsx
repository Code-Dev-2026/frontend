'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  buildAuditReportSummary,
  createContractsAuditReportsGateway,
  DEFAULT_REPORT_FILTER,
  formatReportCsvContent,
  formatReportPdfContent,
  REPORT_ROUTE_OPTIONS,
  REPORT_VEHICLE_OPTIONS,
  reportFilterSchema,
  type AuditEntryStatus,
  type AuditReportSummary,
  type ExportReportFormat,
  type ReportFilterInput,
  type ReportRouteCode,
  type ReportVehiclePlate,
} from '../../../src/features/reporting/audit-reports';
import { IncidentsChart } from './IncidentsChart';

function statusBadgeClasses(status: AuditEntryStatus): string {
  switch (status) {
    case 'Validado':
      return 'border-cs-successBorder bg-cs-successBg text-cs-successText';
    case 'Atendido':
      return 'border-cs-orange/30 bg-cs-warningBg text-cs-warningText';
    case 'Cerrado':
      return 'border-cs-borderSoft bg-cs-surfaceInput text-cs-textStrong';
    case 'Auditable':
      return 'border-cs-borderSoft bg-cs-surface text-cs-textMuted';
  }
}

export function AuditReportsClient() {
  const [filterDraft, setFilterDraft] = useState<ReportFilterInput>(
    DEFAULT_REPORT_FILTER,
  );
  const [appliedFilter, setAppliedFilter] = useState<ReportFilterInput>(
    DEFAULT_REPORT_FILTER,
  );
  const [summary, setSummary] = useState<AuditReportSummary>(() =>
    buildAuditReportSummary(DEFAULT_REPORT_FILTER),
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const generationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gateway = useMemo(() => createContractsAuditReportsGateway(), []);

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
      active: false,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '/icons/eye.svg',
      href: '/reportes' as const,
      active: true,
    },
    {
      id: 'cartera',
      label: 'Cartera',
      icon: '/icons/users.svg',
      href: null,
      active: false,
    },
  ] as const;

  const canExport =
    !isGenerating && dateError === null && summary.logs.length > 0;

  function triggerDownload(
    fileName: string,
    content: string,
    mimeType: string,
  ) {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function runReportQuery(nextFilter: ReportFilterInput) {
    setExportMessage(null);
    const parsed = reportFilterSchema.safeParse(nextFilter);
    if (!parsed.success) {
      setDateError(
        parsed.error.issues[0]?.message ?? 'Revisa las fechas indicadas.',
      );
      return;
    }

    setDateError(null);
    setIsGenerating(true);

    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
    }

    generationTimerRef.current = setTimeout(() => {
      void gateway.generateReport(parsed.data).then((nextSummary) => {
        setAppliedFilter(parsed.data);
        setSummary(nextSummary);
        setIsGenerating(false);
      });
    }, 320);
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runReportQuery(filterDraft);
  }

  function handleResetRange() {
    setFilterDraft(DEFAULT_REPORT_FILTER);
    runReportQuery(DEFAULT_REPORT_FILTER);
  }

  async function handleExport(format: ExportReportFormat) {
    if (!canExport) return;

    if (format === 'PDF') {
      const pdfBytes = formatReportPdfContent(appliedFilter, summary);
      triggerDownload(
        `reporte-auditoria-${appliedFilter.startDate}-a-${appliedFilter.endDate}.pdf`,
        pdfBytes,
        'application/pdf',
      );
    } else {
      const csvContent = formatReportCsvContent(appliedFilter, summary);
      triggerDownload(
        `reporte-auditoria-${appliedFilter.startDate}-a-${appliedFilter.endDate}.csv`,
        csvContent,
        'text/csv;charset=utf-8;',
      );
    }

    await gateway.logExportAudit(format, appliedFilter);
    setExportMessage(
      `Descarga en ${format === 'PDF' ? 'PDF' : 'Excel'} generada y registrada en auditoría.`,
    );
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
              <span className="text-[18px] font-semibold leading-[24px] text-cs-textStrong">
                Reportes · Auditoría e incidentes
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] font-medium text-cs-textBody">
            Solo lectura
          </span>
        </header>

        {/* Contenido */}
        <main className="flex flex-1 flex-col gap-4 bg-cs-surfaceInput p-4 sm:p-6">
          {/* Encabezado de página + descargas */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-bold leading-[30px] text-cs-textStrong sm:text-[24px]">
                Reportes de auditoría e incidentes
              </h1>
              <p className="text-[14px] leading-[20px] text-cs-textMuted">
                Filtra por fecha, ruta y placa. Descarga archivos certificados
                en modo solo lectura.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                className="min-h-[48px] rounded-cs-button bg-cs-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-cs-primaryHover disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:text-cs-textMuted"
                disabled={!canExport}
                onClick={() => {
                  void handleExport('PDF');
                }}
                type="button"
              >
                Descargar PDF
              </button>
              <button
                className="min-h-[48px] rounded-cs-button border border-cs-borderStrong bg-cs-surface px-5 text-[14px] font-semibold text-cs-textStrong transition-colors hover:bg-cs-surfaceInput disabled:cursor-not-allowed disabled:border-cs-borderSoft disabled:bg-cs-disabledBg disabled:text-cs-textMuted"
                disabled={!canExport}
                onClick={() => {
                  void handleExport('XLSX');
                }}
                type="button"
              >
                Descargar Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Barra de filtros */}
          <form
            className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-4"
            noValidate
            onSubmit={handleFilterSubmit}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[170px_170px_minmax(0,1fr)_minmax(0,1fr)_220px]">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-medium text-cs-textBody"
                  htmlFor="report-start-date"
                >
                  Fecha inicio
                </label>
                <input
                  className="h-11 rounded-[10px] border border-cs-borderStrong bg-cs-surface px-3 text-[14px] text-cs-textStrong focus:border-cs-primary focus:outline-none"
                  id="report-start-date"
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={filterDraft.startDate}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-medium text-cs-textBody"
                  htmlFor="report-end-date"
                >
                  Fecha fin
                </label>
                <input
                  aria-invalid={Boolean(dateError)}
                  className={`h-11 rounded-[10px] border bg-cs-surface px-3 text-[14px] text-cs-textStrong focus:border-cs-primary focus:outline-none ${
                    dateError
                      ? 'border-cs-criticalBorder bg-cs-criticalBg/30'
                      : 'border-cs-borderStrong'
                  }`}
                  id="report-end-date"
                  onChange={(event) => {
                    setFilterDraft((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }));
                    if (dateError) setDateError(null);
                  }}
                  type="date"
                  value={filterDraft.endDate}
                />
                {dateError && (
                  <span className="text-[12px] font-medium text-cs-criticalText">
                    {dateError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-medium text-cs-textBody"
                  htmlFor="report-route"
                >
                  Ruta escolar
                </label>
                <select
                  className="h-11 rounded-[10px] border border-cs-borderStrong bg-cs-surface px-3 text-[14px] text-cs-textStrong focus:border-cs-primary focus:outline-none"
                  id="report-route"
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      routeCode: event.target.value as ReportRouteCode,
                    }))
                  }
                  value={filterDraft.routeCode}
                >
                  {REPORT_ROUTE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[13px] font-medium text-cs-textBody"
                  htmlFor="report-plate"
                >
                  Placa / Vehículo
                </label>
                <select
                  className="h-11 rounded-[10px] border border-cs-borderStrong bg-cs-surface px-3 text-[14px] text-cs-textStrong focus:border-cs-primary focus:outline-none"
                  id="report-plate"
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      vehiclePlate: event.target.value as ReportVehiclePlate,
                    }))
                  }
                  value={filterDraft.vehiclePlate}
                >
                  {REPORT_VEHICLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end sm:col-span-2 xl:col-span-1">
                <button
                  className="h-11 w-full rounded-[10px] bg-cs-primary px-4 text-[14px] font-semibold text-white transition-colors hover:bg-cs-primaryHover disabled:opacity-70"
                  disabled={isGenerating}
                  type="submit"
                >
                  {isGenerating
                    ? 'Generando...'
                    : dateError
                      ? 'Reintentar consulta'
                      : 'Generar resumen'}
                </button>
              </div>
            </div>
          </form>

          {/* Banner de estado */}
          {isGenerating ? (
            <section className="flex items-start gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-4 py-3.5">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={20}
                src="/icons/info.svg"
                width={20}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-[14px] font-semibold text-cs-textStrong">
                  Generando reporte...
                </p>
                <p className="text-[13px] text-cs-textMuted">
                  Consolidando registros de rutas y eventos de custodia. La
                  descarga en PDF y Excel se habilitará al finalizar la
                  consulta.
                </p>
              </div>
            </section>
          ) : dateError ? (
            <section
              role="alert"
              className="flex items-start gap-3 rounded-cs-card border border-cs-criticalBorder bg-cs-surface px-4 py-3.5"
            >
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={20}
                src="/icons/triangle-alert-critical.svg"
                width={20}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-[14px] font-semibold text-cs-criticalText">
                  No fue posible generar el reporte
                </p>
                <p className="text-[13px] text-cs-textMuted">
                  Corrige el rango de fechas o restablece la consulta. Los
                  archivos PDF y Excel solo se habilitan con un resumen válido.
                </p>
              </div>
            </section>
          ) : (
            <section className="flex items-start gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-4 py-3.5">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={20}
                src="/icons/circle-check.svg"
                width={20}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-[14px] font-semibold text-cs-textStrong">
                  {summary.logs.length > 0
                    ? 'Reporte listo para descargar'
                    : 'Sin registros para el rango consultado'}
                </p>
                <p className="text-[13px] text-cs-textMuted">
                  {summary.logs.length > 0
                    ? `Consolidado generado (${appliedFilter.startDate} a ${appliedFilter.endDate}). Vista previa de solo lectura disponible en PDF y Excel.`
                    : `No se encontraron recorridos entre ${appliedFilter.startDate} y ${appliedFilter.endDate} con los filtros elegidos.`}
                </p>
              </div>
            </section>
          )}

          {exportMessage && (
            <div
              role="status"
              className="rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 py-2.5 text-[13px] font-medium text-cs-successText"
            >
              {exportMessage}
            </div>
          )}

          {/* Área principal: Skeleton / Error-Vacío / KPIs + Gráfica + Bitácora */}
          {isGenerating ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((slot) => (
                  <div
                    className="flex flex-col gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5"
                    key={slot}
                  >
                    <div className="h-5 w-36 animate-pulse rounded-md bg-cs-surfaceInput" />
                    <div className="h-8 w-20 animate-pulse rounded-md bg-cs-surfaceInput" />
                    <div className="h-4 w-44 animate-pulse rounded-md bg-cs-surfaceInput" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 xl:col-span-5">
                  <p className="mb-3 text-[14px] font-medium text-cs-textMuted">
                    Cargando gráfica de incidentes...
                  </p>
                  <div className="h-[240px] animate-pulse rounded-[12px] bg-cs-surfaceInput" />
                </div>
                <div className="rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 xl:col-span-7">
                  <p className="mb-3 text-[14px] font-medium text-cs-textMuted">
                    Cargando vista previa de auditoría...
                  </p>
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map((row) => (
                      <div
                        className="h-9 animate-pulse rounded-lg bg-cs-surfaceInput"
                        key={row}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : dateError || summary.logs.length === 0 ? (
            <section className="flex flex-col items-center justify-center gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={22}
                  src="/icons/route.svg"
                  width={22}
                />
              </div>
              <h2 className="text-[17px] font-semibold text-cs-textStrong">
                Sin reporte generado para el rango indicado
              </h2>
              <p className="max-w-[420px] text-[13px] leading-[18px] text-cs-textMuted">
                Ajusta las fechas desde/hasta o restablece el período por
                defecto para consultar los recorridos e incidentes disponibles.
              </p>
              <button
                className="min-h-[48px] rounded-cs-button bg-cs-primary px-6 text-[14px] font-semibold text-white transition-colors hover:bg-cs-primaryHover"
                onClick={handleResetRange}
                type="button"
              >
                Restablecer rango (30 días)
              </button>
            </section>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 3 KPIs */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <article className="flex flex-col gap-2 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-cs-textMuted">
                      Recorridos auditados
                    </span>
                    <span className="rounded-full bg-cs-surfaceInput px-2.5 py-0.5 text-[12px] font-medium text-cs-textStrong">
                      Auditado
                    </span>
                  </div>
                  <p className="text-[28px] font-bold leading-[34px] text-cs-textStrong">
                    {summary.kpis.auditedTrips}
                  </p>
                  <p className="text-[13px] text-cs-textMuted">
                    {summary.kpis.tripsDeltaLabel}
                  </p>
                </article>

                <article className="flex flex-col gap-2 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-cs-textMuted">
                      Incidentes y desvíos (&gt;300 m)
                    </span>
                    <span className="text-[12px] font-semibold text-cs-warningText">
                      Revisar
                    </span>
                  </div>
                  <p className="text-[28px] font-bold leading-[34px] text-cs-textStrong">
                    {summary.kpis.incidentsCount}
                  </p>
                  <p className="text-[13px] text-cs-textMuted">
                    {summary.kpis.incidentsDetailLabel}
                  </p>
                </article>

                <article className="flex flex-col gap-2 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-cs-textMuted">
                      Puntualidad promedio
                    </span>
                    <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-2.5 py-0.5 text-[12px] font-medium text-cs-successText">
                      Auditado
                    </span>
                  </div>
                  <p className="text-[28px] font-bold leading-[34px] text-cs-textStrong">
                    {summary.kpis.punctualityPct}
                  </p>
                  <p className="text-[13px] text-cs-textMuted">
                    Cumplimiento de paradas programadas
                  </p>
                </article>
              </div>

              {/* Gráfica + Bitácora de auditoría */}
              <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
                <section className="flex flex-col gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 xl:col-span-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[16px] font-semibold text-cs-textStrong">
                      Incidentes por ruta
                    </h2>
                    <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
                      Período consultado
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-cs-textBody">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#e14d58]" />
                      Desvíos &gt;300 m
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#f59e0b]" />
                      Retrasos anómalos
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#2563eb]" />
                      Resueltos
                    </span>
                  </div>

                  <IncidentsChart data={summary.chartData} />

                  <p className="text-[12px] text-cs-textMuted">
                    Datos consolidados en modo solo lectura.
                  </p>
                </section>

                <section className="flex flex-col gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 xl:col-span-7">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[16px] font-semibold text-cs-textStrong">
                      Vista previa auditoría e incidentes
                    </h2>
                    <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
                      Solo lectura
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-cs-borderSoft text-[12px] font-medium text-cs-textMuted">
                          <th className="py-2.5 pr-3">Fecha / Hora</th>
                          <th className="py-2.5 pr-3">Ruta · Placa</th>
                          <th className="py-2.5 pr-3">Evento registrado</th>
                          <th className="py-2.5 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cs-borderSoft text-[13px]">
                        {summary.logs.map((entry) => (
                          <tr key={entry.id}>
                            <td className="whitespace-nowrap py-3 pr-3 text-cs-textMuted">
                              {entry.dateTimeLabel}
                            </td>
                            <td className="whitespace-nowrap py-3 pr-3 font-medium text-cs-textStrong">
                              {entry.routeCode} · {entry.vehiclePlate}
                            </td>
                            <td className="py-3 pr-3 text-cs-textBody">
                              {entry.eventSummary}
                            </td>
                            <td className="whitespace-nowrap py-3 text-right">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${statusBadgeClasses(
                                  entry.status,
                                )}`}
                              >
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[12px] text-cs-textMuted">
                    Sin edición ni firma digital en cliente · Exportación
                    certificada en PDF y Excel (.xlsx).
                  </p>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
