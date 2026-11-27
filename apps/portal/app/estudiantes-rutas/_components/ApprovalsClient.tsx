'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  approveApprovalRequest,
  BACKEND_APPROVAL_ERRORS,
  filterApprovalRequests,
  INITIAL_APPROVAL_REQUESTS,
  rejectApprovalRequest,
  validateRejectionReason,
  type ApprovalRequestItem,
  type ApprovalRequestStatus,
  type ApprovalRequestType,
} from '../approvals-state';

type PanelOverlayMode = 'none' | 'qr_provisional' | 'backend_errors';

function statusPillClasses(status: ApprovalRequestStatus): string {
  switch (status) {
    case 'En revisión':
      return 'bg-cs-warningBg text-cs-warningText';
    case 'Aprobado':
      return 'border border-cs-successBorder bg-cs-successBg text-cs-successText';
    case 'Rechazado':
      return 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textMuted';
  }
}

export function ApprovalsClient() {
  const [requests, setRequests] = useState<ApprovalRequestItem[]>(() => [
    ...INITIAL_APPROVAL_REQUESTS,
  ]);
  const [statusFilter, setStatusFilter] = useState<
    ApprovalRequestStatus | 'all'
  >('all');
  const [typeFilter, setTypeFilter] = useState<ApprovalRequestType | 'all'>(
    'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('sol-204');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<PanelOverlayMode>('none');
  const [triggeredErrorCode, setTriggeredErrorCode] = useState<
    'CAPACIDAD_AGOTADA' | 'ANTICIPACION_INSUFICIENTE' | null
  >(null);
  const [qrTarget, setQrTarget] = useState<{
    code: string;
    requestCode: string;
    routeName: string;
  } | null>(null);
  const [securePreviewMode, setSecurePreviewMode] = useState<
    'none' | 'photo' | 'document'
  >('none');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const counts = useMemo(
    () => ({
      all: requests.length,
      review: requests.filter((r) => r.status === 'En revisión').length,
      approved: requests.filter((r) => r.status === 'Aprobado').length,
      rejected: requests.filter((r) => r.status === 'Rechazado').length,
    }),
    [requests],
  );

  const visibleRequests = useMemo(
    () =>
      filterApprovalRequests(requests, {
        status: statusFilter,
        type: typeFilter,
        query: searchQuery,
      }),
    [requests, statusFilter, typeFilter, searchQuery],
  );

  const selectedRequest = useMemo(
    () =>
      visibleRequests.find((r) => r.id === selectedId) ??
      visibleRequests[0] ??
      null,
    [visibleRequests, selectedId],
  );

  function handleSelectRow(id: string) {
    setSelectedId(id);
    setRejectionReason('');
    setReasonError(null);
    setSecurePreviewMode('none');
  }

  function handleApprove(item: ApprovalRequestItem) {
    setReasonError(null);
    if (item.simulateBackendError) {
      setTriggeredErrorCode(item.simulateBackendError);
      setOverlayMode('backend_errors');
      return;
    }
    setTriggeredErrorCode(null);
    setRequests((prev) => approveApprovalRequest(prev, item.id));
    if (item.type === 'Ocasional') {
      setQrTarget({
        code: item.provisionalQrCode ?? '#QR-PROV-8841',
        requestCode: item.code,
        routeName: item.routeName,
      });
      setOverlayMode('qr_provisional');
    }
  }

  function handleReject(item: ApprovalRequestItem) {
    const err = validateRejectionReason(rejectionReason);
    if (err) {
      setReasonError(err);
      return;
    }
    setReasonError(null);
    setRequests((prev) =>
      rejectApprovalRequest(prev, item.id, rejectionReason),
    );
    setRejectionReason('');
  }

  function resetAllFilters() {
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
    setOverlayMode('none');
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
  ];

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
                Estudiantes y rutas · Aprobaciones
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[13px] text-cs-warningText lg:hidden">
              {counts.review} en revisión
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
          {/* Header + buscador */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                Bandeja de aprobaciones
              </h1>
              <p className="text-[14px] leading-[20px] text-cs-textMuted">
                Pasajeros ocasionales y verificación de documentos de adultos
                autorizados.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex w-full flex-col gap-1.5 sm:w-[300px]">
                <label
                  className="text-[14px] font-medium text-cs-textBody"
                  htmlFor="approvals-search-input"
                >
                  Buscar solicitud
                </label>
                <input
                  className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                  id="approvals-search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="#SOL-204, Ruta Sur..."
                  type="text"
                  value={searchQuery}
                />
              </div>
              <Link
                className="inline-flex h-[45px] items-center justify-center rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-navy transition-colors hover:border-cs-primary"
                href="/estudiantes-rutas/importar"
              >
                Carga masiva CSV/Excel →
              </Link>
              <Link
                className="inline-flex h-[45px] items-center justify-center rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-navy transition-colors hover:border-cs-primary"
                href="/estudiantes-rutas/rutas"
              >
                Diseñador de rutas →
              </Link>
            </div>
          </div>

          {/* Barra de filtros */}
          <section
            aria-label="Filtros de solicitudes"
            className="flex flex-wrap items-center gap-2 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-4 py-3"
          >
            <button
              aria-pressed={statusFilter === 'all'}
              className={`rounded-full px-3 py-1 text-[13px] ${
                statusFilter === 'all'
                  ? 'bg-cs-infoBg font-medium text-cs-navy'
                  : 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textMuted'
              }`}
              onClick={() => setStatusFilter('all')}
              type="button"
            >
              Todos ({counts.all})
            </button>
            <button
              aria-pressed={statusFilter === 'En revisión'}
              className={`rounded-full px-3 py-1 text-[13px] ${
                statusFilter === 'En revisión'
                  ? 'bg-cs-warningBg font-medium text-cs-warningText'
                  : 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-warningText'
              }`}
              onClick={() => setStatusFilter('En revisión')}
              type="button"
            >
              En revisión ({counts.review})
            </button>
            <button
              aria-pressed={statusFilter === 'Aprobado'}
              className={`rounded-full px-3 py-1 text-[13px] ${
                statusFilter === 'Aprobado'
                  ? 'border border-cs-successBorder bg-cs-successBg font-medium text-cs-successText'
                  : 'border border-cs-successBorder bg-white text-cs-successText'
              }`}
              onClick={() => setStatusFilter('Aprobado')}
              type="button"
            >
              Aprobado ({counts.approved})
            </button>
            <button
              aria-pressed={statusFilter === 'Rechazado'}
              className={`rounded-full px-3 py-1 text-[13px] ${
                statusFilter === 'Rechazado'
                  ? 'bg-cs-borderSoft font-medium text-cs-textStrong'
                  : 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textMuted'
              }`}
              onClick={() => setStatusFilter('Rechazado')}
              type="button"
            >
              Rechazado ({counts.rejected})
            </button>

            <select
              aria-label="Filtrar por tipo de solicitud"
              className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] text-cs-textBody"
              onChange={(e) =>
                setTypeFilter(e.target.value as ApprovalRequestType | 'all')
              }
              value={typeFilter}
            >
              <option value="all">Tipo: Ocasional / Autorizado</option>
              <option value="Ocasional">Solo Ocasional (RF-04)</option>
              <option value="Autorizado">Solo Autorizado (RF-05)</option>
            </select>
          </section>

          {/* Contenido principal */}
          {overlayMode === 'backend_errors' ? (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-borderSoft bg-cs-surface p-8">
              <div className="flex w-full max-w-[560px] flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-cs-textStrong">
                    No fue posible aprobar la solicitud
                  </h2>
                  <p className="text-[14px] text-cs-textMuted">
                    La ruta no cumple los requisitos de cupo u horario para este
                    abordaje ocasional.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {BACKEND_APPROVAL_ERRORS.filter(
                    (err) =>
                      !triggeredErrorCode || err.code === triggeredErrorCode,
                  ).map((err) => (
                    <div
                      className="flex items-start gap-3 rounded-[12px] border border-cs-criticalBorder bg-cs-criticalBg p-4"
                      key={err.code}
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
                      <div className="flex flex-col gap-1 text-[14px]">
                        <p className="font-semibold text-cs-criticalText">
                          {err.code === 'CAPACIDAD_AGOTADA'
                            ? 'Cupo máximo alcanzado en el vehículo'
                            : 'Fuera de la ventana mínima de anticipación'}
                        </p>
                        <p className="text-cs-textBody">{err.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <button
                    className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-5 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                    onClick={() => setOverlayMode('none')}
                    type="button"
                  >
                    Volver a la bandeja
                  </button>
                </div>
              </div>
            </section>
          ) : visibleRequests.length === 0 ? (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-borderSoft bg-cs-surface p-10 text-center">
              <div className="flex max-w-[380px] flex-col items-center gap-3">
                <h2 className="text-[18px] font-semibold text-cs-textStrong">
                  Sin recorridos para mostrar
                </h2>
                <p className="text-[14px] text-cs-textMuted">
                  No hay solicitudes de pasajeros ocasionales ni documentos por
                  revisar.
                </p>
                <button
                  className="mt-1 h-11 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                  onClick={resetAllFilters}
                  type="button"
                >
                  Actualizar
                </button>
              </div>
            </section>
          ) : (
            <div className="flex flex-1 flex-col gap-5 lg:flex-row">
              {/* Tabla izquierda */}
              <section
                aria-label="Bandeja de solicitudes"
                className="flex-1 overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
              >
                <div className="flex items-center justify-between border-b border-cs-borderSoft px-5 py-4">
                  <h2 className="text-[18px] font-semibold text-cs-textStrong">
                    Bandeja de solicitudes
                  </h2>
                  <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] text-cs-textMuted">
                    {visibleRequests.length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-cs-borderSoft bg-cs-surfaceInput text-[13px] font-medium text-cs-textMuted">
                        <th className="px-5 py-3">Solicitud</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Ruta</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-5 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRequests.map((item) => {
                        const isSelected = selectedRequest?.id === item.id;
                        return (
                          <tr
                            className={`border-b border-cs-borderSoft transition-colors ${
                              isSelected
                                ? 'bg-cs-infoBg/40'
                                : 'hover:bg-cs-surfaceInput/60'
                            }`}
                            key={item.id}
                          >
                            <td className="px-5 py-4 font-semibold text-cs-textStrong">
                              {item.code}
                            </td>
                            <td className="px-4 py-4 text-cs-textBody">
                              {item.type}
                            </td>
                            <td className="px-4 py-4 text-cs-textMuted">
                              {item.routeName}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${statusPillClasses(
                                  item.status,
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                className="font-semibold text-cs-navy hover:underline"
                                onClick={() => handleSelectRow(item.id)}
                                type="button"
                              >
                                {isSelected ? 'Viendo →' : 'Revisar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Ficha de detalle derecha (380 px) */}
              {selectedRequest && (
                <aside
                  aria-label="Detalle de solicitud seleccionada"
                  className="flex w-full shrink-0 flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 lg:w-[380px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[18px] font-semibold text-cs-textStrong">
                        Solicitud {selectedRequest.code}
                      </h2>
                      <p className="text-[13px] text-cs-textMuted">
                        {selectedRequest.summary}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${statusPillClasses(
                        selectedRequest.status,
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Aviso de privacidad / acceso restringido */}
                  <div className="flex items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3.5">
                    <Image
                      alt=""
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                      height={20}
                      src="/icons/info.svg"
                      width={20}
                    />
                    <div className="flex flex-col gap-0.5 text-[13px] leading-[18px]">
                      <p className="font-semibold text-cs-textStrong">
                        Acceso restringido por rol
                      </p>
                      <p className="text-cs-textMuted">
                        Fotos y documentos visibles solo para roles autorizados;
                        sin caché público ni logs.
                      </p>
                    </div>
                  </div>

                  {/* Previsualización de documentos y foto de autorizado */}
                  {selectedRequest.type === 'Autorizado' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className={`flex select-none flex-col items-center gap-1.5 rounded-[12px] border p-4 text-center transition-colors ${
                            securePreviewMode === 'photo'
                              ? 'border-cs-primary bg-cs-infoBg/40'
                              : 'border-cs-borderSoft bg-cs-surface hover:border-cs-borderStrong'
                          }`}
                          onClick={() =>
                            setSecurePreviewMode((m) =>
                              m === 'photo' ? 'none' : 'photo',
                            )
                          }
                          onContextMenu={(e) => e.preventDefault()}
                          type="button"
                        >
                          <Image
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            height={22}
                            src="/icons/user-round.svg"
                            width={22}
                          />
                          <span className="text-[13px] font-semibold text-cs-textStrong">
                            Foto autorizado
                          </span>
                          <span className="text-[12px] text-cs-textMuted">
                            Verificación facial
                          </span>
                        </button>

                        <button
                          className={`flex select-none flex-col items-center gap-1.5 rounded-[12px] border p-4 text-center transition-colors ${
                            securePreviewMode === 'document'
                              ? 'border-cs-primary bg-cs-infoBg/40'
                              : 'border-cs-borderSoft bg-cs-surface hover:border-cs-borderStrong'
                          }`}
                          onClick={() =>
                            setSecurePreviewMode((m) =>
                              m === 'document' ? 'none' : 'document',
                            )
                          }
                          onContextMenu={(e) => e.preventDefault()}
                          type="button"
                        >
                          <Image
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            height={22}
                            src="/icons/lock-keyhole.svg"
                            width={22}
                          />
                          <span className="text-[13px] font-semibold text-cs-textStrong">
                            Documento ID
                          </span>
                          <span className="text-[12px] text-cs-textMuted">
                            Anverso y reverso
                          </span>
                        </button>
                      </div>

                      {securePreviewMode !== 'none' && (
                        <div
                          className="select-none rounded-[12px] border border-dashed border-cs-navy bg-cs-infoBg/30 p-3 text-[12px] text-cs-navy"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          {securePreviewMode === 'photo'
                            ? `Visor protegido · Foto verificada de adulto autorizado (${selectedRequest.code}) sin caché local.`
                            : `Visor protegido · Documento de identidad anverso/reverso (${selectedRequest.code}) cifrado en sesión.`}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3.5 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-cs-textMuted">
                          Estudiante ref.
                        </span>
                        <span className="font-medium text-cs-textStrong">
                          {selectedRequest.studentRef}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cs-textMuted">Radicado</span>
                        <span className="font-medium text-cs-textStrong">
                          {selectedRequest.submittedAt}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-cs-textMuted">
                        Sujeto a cupo disponible y horario mínimo de solicitud.
                      </p>
                    </div>
                  )}

                  {selectedRequest.rejectionReason && (
                    <div className="rounded-[12px] border border-cs-criticalBorder bg-cs-criticalBg p-3 text-[13px] text-cs-criticalText">
                      <strong>Motivo registrado:</strong>{' '}
                      {selectedRequest.rejectionReason}
                    </div>
                  )}

                  {/* Campo motivo + botones Rechazar / Aprobar */}
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-[14px] font-medium text-cs-textBody"
                      htmlFor="rejection-reason-input"
                    >
                      Motivo (obligatorio al rechazar)
                    </label>
                    <input
                      aria-invalid={Boolean(reasonError)}
                      className={`h-[45px] w-full rounded-cs-input border bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary ${
                        reasonError
                          ? 'border-cs-criticalText'
                          : 'border-cs-borderStrong'
                      }`}
                      id="rejection-reason-input"
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        if (reasonError) setReasonError(null);
                      }}
                      placeholder="Ej. Documento ilegible o incompleto..."
                      type="text"
                      value={rejectionReason}
                    />
                    {reasonError && (
                      <p
                        className="text-[12px] text-cs-criticalText"
                        role="alert"
                      >
                        {reasonError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      className="h-12 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[15px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                      onClick={() => handleReject(selectedRequest)}
                      type="button"
                    >
                      Rechazar
                    </button>
                    <button
                      className="h-12 rounded-cs-button bg-cs-primary px-4 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                      onClick={() => handleApprove(selectedRequest)}
                      type="button"
                    >
                      Aprobar
                    </button>
                  </div>
                </aside>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal QR Provisional (319:2659) */}
      {overlayMode === 'qr_provisional' && qrTarget && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
        >
          <div className="flex w-full max-w-[440px] flex-col items-center gap-5 rounded-cs-card bg-cs-surface p-7 text-center shadow-xl">
            <div className="flex w-full items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-4 text-left">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={22}
                src="/icons/circle-check.svg"
                width={22}
              />
              <div>
                <p className="text-[15px] font-semibold text-cs-textStrong">
                  Pasajero ocasional aprobado
                </p>
                <p className="text-[13px] text-cs-textMuted">
                  Código QR provisional generado para el abordaje.
                </p>
              </div>
            </div>

            {/* Representación visual QR provisional */}
            <div
              aria-label={`Código QR ${qrTarget.code}`}
              className="grid h-36 w-36 grid-cols-4 grid-rows-4 gap-2 rounded-[14px] border border-cs-borderSoft bg-white p-4"
            >
              <div className="col-span-2 row-span-2 rounded bg-cs-textStrong" />
              <div className="rounded bg-cs-textStrong" />
              <div className="row-span-2 rounded bg-cs-textStrong" />
              <div className="rounded bg-cs-textStrong" />
              <div className="col-span-2 rounded bg-cs-textStrong" />
              <div className="col-span-2 rounded bg-cs-textStrong" />
              <div className="rounded bg-cs-textStrong" />
              <div className="rounded bg-cs-textStrong" />
              <div className="col-span-2 rounded bg-cs-textStrong" />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-cs-textStrong">
                Código: {qrTarget.code} · Solicitud {qrTarget.requestCode}
              </p>
              <p className="text-[13px] text-cs-textMuted">
                Válido únicamente para {qrTarget.routeName} en la jornada
                autorizada.
              </p>
            </div>

            <button
              className="h-12 w-full rounded-cs-button bg-cs-primary px-4 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
              onClick={() => setOverlayMode('none')}
              type="button"
            >
              Cerrar y volver a la bandeja
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
