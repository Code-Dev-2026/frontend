'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StudentRole } from '@camino/domain';
import {
  applySensitiveCustodyAction,
  createCustodyRestrictionOrder,
  createRestrictionSchema,
  CUSTODY_RESTRICTION_CATALOG_MESSAGE,
  CUSTODY_ROLE_DENIED_MESSAGE,
  filterCustodyRestrictions,
  getCustodyCapabilities,
  INITIAL_CUSTODY_RESTRICTIONS,
  validateAuditReason,
  type CustodyRestrictionOrder,
  type CustodyRestrictionStatus,
  type CustodySensitiveAction,
} from '../../../../src/features/custody/custody-restrictions';

function statusPillClasses(status: CustodyRestrictionStatus): string {
  switch (status) {
    case 'Activa':
      return 'bg-cs-warningBg text-cs-warningText';
    case 'Suspendida':
      return 'bg-cs-surfaceInput font-semibold text-cs-textStrong';
    case 'Archivada':
      return 'border border-cs-borderSoft bg-cs-surface text-cs-textMuted';
  }
}

function sensitiveActionTitle(action: CustodySensitiveAction): string {
  switch (action) {
    case 'revocation':
      return 'Confirmar revocatoria';
    case 'suspend':
      return 'Confirmar suspensión';
    case 'reactivate':
      return 'Confirmar reactivación';
    case 'archive':
      return 'Confirmar archivo de orden';
  }
}

function sensitiveActionDescription(
  action: CustodySensitiveAction,
  studentRef: string,
): string {
  switch (action) {
    case 'revocation':
      return `Se marcará la restricción de ${studentRef} como revocatoria de patria potestad dejando registro de quién y cuándo la ejecutó.`;
    case 'suspend':
      return `Se suspenderá temporalmente la restricción de ${studentRef} dejando registro de quién y cuándo la ejecutó.`;
    case 'reactivate':
      return `Se reactivará la orden vigente de ${studentRef} dejando registro de quién y cuándo la ejecutó.`;
    case 'archive':
      return `Se archivará la restricción de ${studentRef} dejando registro de quién y cuándo la ejecutó.`;
  }
}

interface ProtectedSupportTilesProps {
  order: CustodyRestrictionOrder;
  previewMode: 'none' | 'photo' | 'legal';
  onTogglePreview: (mode: 'photo' | 'legal') => void;
}

function ProtectedSupportTiles({
  order,
  previewMode,
  onTogglePreview,
}: ProtectedSupportTilesProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          className={`flex select-none flex-col items-center gap-1.5 rounded-[12px] border p-4 text-center transition-colors ${
            previewMode === 'photo'
              ? 'border-cs-primary bg-cs-infoBg/40'
              : 'border-cs-borderSoft bg-cs-surface hover:border-cs-borderStrong'
          }`}
          onClick={() => onTogglePreview('photo')}
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
            Foto restringido
          </span>
          <span className="text-[12px] text-cs-textMuted">
            Solo roles con permiso
          </span>
        </button>

        <button
          className={`flex select-none flex-col items-center gap-1.5 rounded-[12px] border p-4 text-center transition-colors ${
            previewMode === 'legal'
              ? 'border-cs-primary bg-cs-infoBg/40'
              : 'border-cs-borderSoft bg-cs-surface hover:border-cs-borderStrong'
          }`}
          onClick={() => onTogglePreview('legal')}
          onContextMenu={(e) => e.preventDefault()}
          type="button"
        >
          <Image
            alt=""
            aria-hidden="true"
            draggable={false}
            height={22}
            src="/icons/shield-check.svg"
            width={22}
          />
          <span className="text-[13px] font-semibold text-cs-textStrong">
            Soporte legal
          </span>
          <span className="text-[12px] text-cs-textMuted">
            {order.legalSupportRef}
          </span>
        </button>
      </div>

      {previewMode !== 'none' && (
        <div
          className="select-none rounded-[12px] border border-dashed border-cs-navy bg-cs-infoBg/30 p-3 text-[12px] text-cs-navy"
          onContextMenu={(e) => e.preventDefault()}
        >
          {previewMode === 'photo'
            ? order.hasRestrictedPhoto
              ? `Visor protegido · Fotografía de ${order.restrictedPersonRef} disponible únicamente en sesión autorizada.`
              : `No hay fotografía adjunta para ${order.restrictedPersonRef}.`
            : `Documento legal protegido · ${order.legalSupportRef} (uso exclusivo para verificación institucional).`}
        </div>
      )}
    </>
  );
}

interface EditableDetailProps {
  order: CustodyRestrictionOrder;
  previewMode: 'none' | 'photo' | 'legal';
  onTogglePreview: (mode: 'photo' | 'legal') => void;
  onRequestAction: (action: CustodySensitiveAction) => void;
}

/**
 * Ficha editable exclusiva para Superadministrador (Coordinación).
 */
function EditableRestrictionDetail({
  order,
  previewMode,
  onTogglePreview,
  onRequestAction,
}: EditableDetailProps) {
  const isRevocation = order.measure === 'Revocatoria patria potestad';
  const isSuspended = order.status === 'Suspendida';
  const isArchived = order.status === 'Archivada';

  return (
    <aside
      aria-label="Detalle de restricción"
      className="flex w-full shrink-0 flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 lg:w-[380px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-semibold text-cs-textStrong">
            Menor {order.studentRef} · {order.restrictedPersonRef}
          </h2>
          <p className="text-[13px] text-cs-textMuted">{order.measure}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${statusPillClasses(
            order.status,
          )}`}
        >
          {order.status}
        </span>
      </div>

      <ProtectedSupportTiles
        onTogglePreview={onTogglePreview}
        order={order}
        previewMode={previewMode}
      />

      <div className="flex flex-col gap-1.5 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3.5 text-[12px]">
        <p className="font-semibold text-cs-textStrong">
          Registro de quién y cuándo
        </p>
        <ul className="flex flex-col gap-1 text-cs-textMuted">
          {order.auditTrail.map((entry) => (
            <li key={entry.id}>• {entry.summary}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-3 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isRevocation || isArchived}
          onClick={() => onRequestAction('revocation')}
          type="button"
        >
          {isRevocation ? 'Revocatoria activa' : 'Revocatoria'}
        </button>

        <button
          className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-3 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isArchived}
          onClick={() =>
            onRequestAction(isSuspended ? 'reactivate' : 'suspend')
          }
          type="button"
        >
          {isSuspended ? 'Reactivar' : 'Suspender'}
        </button>
      </div>

      <button
        className="h-12 w-full rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isArchived}
        onClick={() => onRequestAction('archive')}
        type="button"
      >
        {isArchived ? 'Orden archivada' : 'Archivar orden'}
      </button>
    </aside>
  );
}

interface ReadOnlyDetailProps {
  order: CustodyRestrictionOrder;
  previewMode: 'none' | 'photo' | 'legal';
  onTogglePreview: (mode: 'photo' | 'legal') => void;
}

/**
 * ISP: ficha de solo lectura sin recibir acciones ni mutadores de edición.
 */
function ReadOnlyRestrictionDetail({
  order,
  previewMode,
  onTogglePreview,
}: ReadOnlyDetailProps) {
  return (
    <aside
      aria-label="Detalle de restricción en solo lectura"
      className="flex w-full shrink-0 flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 lg:w-[380px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-semibold text-cs-textStrong">
            Menor {order.studentRef} · {order.restrictedPersonRef}
          </h2>
          <p className="text-[13px] text-cs-textMuted">{order.measure}</p>
        </div>
        <span className="inline-flex rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
          Solo lectura
        </span>
      </div>

      <ProtectedSupportTiles
        onTogglePreview={onTogglePreview}
        order={order}
        previewMode={previewMode}
      />

      <div className="flex flex-col gap-1.5 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3.5 text-[12px]">
        <p className="font-semibold text-cs-textStrong">
          Registro de quién y cuándo
        </p>
        <ul className="flex flex-col gap-1 text-cs-textMuted">
          {order.auditTrail.map((entry) => (
            <li key={entry.id}>• {entry.summary}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-3.5 text-[13px]">
        <Image
          alt=""
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          height={20}
          src="/icons/info.svg"
          width={20}
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-cs-textStrong">Solo lectura</p>
          <p className="text-cs-textMuted">
            Tu perfil no puede crear, marcar ni suspender restricciones.
          </p>
        </div>
      </div>
    </aside>
  );
}

interface RestrictionsClientProps {
  initialRole?: StudentRole;
}

export function RestrictionsClient({
  initialRole = 'COORDINADORA_CONVIVENCIA',
}: RestrictionsClientProps) {
  const capabilities = getCustodyCapabilities(initialRole);

  const [orders, setOrders] = useState<CustodyRestrictionOrder[]>(() => [
    ...INITIAL_CUSTODY_RESTRICTIONS,
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('res-e104');
  const [previewMode, setPreviewMode] = useState<'none' | 'photo' | 'legal'>(
    'none',
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dialog Nueva restricción
  const [createOpen, setCreateOpen] = useState(false);
  const [formStudentRef, setFormStudentRef] = useState('');
  const [formRestrictedPerson, setFormRestrictedPerson] = useState('');
  const [formLegalSupport, setFormLegalSupport] = useState('');
  const [formIsRevocation, setFormIsRevocation] = useState(false);
  const [formHasAttachments, setFormHasAttachments] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // Dialog Confirmación sensible
  const [pendingAction, setPendingAction] =
    useState<CustodySensitiveAction | null>(null);
  const [auditReason, setAuditReason] = useState('');
  const [auditReasonError, setAuditReasonError] = useState<string | null>(null);

  const visibleOrders = useMemo(
    () => filterCustodyRestrictions(orders, searchQuery),
    [orders, searchQuery],
  );

  const selectedOrder = useMemo(
    () =>
      visibleOrders.find((item) => item.id === selectedId) ??
      visibleOrders[0] ??
      null,
    [visibleOrders, selectedId],
  );

  function handleTogglePreview(mode: 'photo' | 'legal') {
    setPreviewMode((prev) => (prev === mode ? 'none' : mode));
  }

  function handleSelectRow(id: string) {
    setSelectedId(id);
    setPreviewMode('none');
  }

  function handleOpenCreateDialog() {
    if (!capabilities.puedeEditar) return;
    setFormStudentRef('');
    setFormRestrictedPerson('');
    setFormLegalSupport('');
    setFormIsRevocation(false);
    setFormHasAttachments(true);
    setCreateError(null);
    setCreateOpen(true);
  }

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!capabilities.puedeEditar) return;

    const parsed = createRestrictionSchema.safeParse({
      studentRef: formStudentRef,
      restrictedPerson: formRestrictedPerson,
      legalSupportRef: formLegalSupport,
      isRevocation: formIsRevocation,
      hasAttachments: formHasAttachments,
    });

    if (!parsed.success) {
      setCreateError(
        parsed.error.issues[0]?.message ?? 'Completa los campos obligatorios.',
      );
      return;
    }

    const result = createCustodyRestrictionOrder(
      orders,
      parsed.data,
      'Coordinación',
    );
    setOrders(result.orders);
    setSelectedId(result.created.id);
    setPreviewMode('none');
    setCreateOpen(false);
  }

  function handleRequestSensitiveAction(action: CustodySensitiveAction) {
    if (!capabilities.puedeEditar || !selectedOrder) return;
    setAuditReason('');
    setAuditReasonError(null);
    setPendingAction(action);
  }

  function handleConfirmSensitiveAction(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!capabilities.puedeEditar || !selectedOrder || !pendingAction) return;

    const error = validateAuditReason(auditReason);
    if (error) {
      setAuditReasonError(error);
      return;
    }

    setOrders((prev) =>
      applySensitiveCustodyAction(
        prev,
        selectedOrder.id,
        pendingAction,
        auditReason,
        'Coordinación',
      ),
    );
    setPendingAction(null);
    setAuditReason('');
    setAuditReasonError(null);
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
      active: false,
    },
    {
      id: 'custodia',
      label: capabilities.puedeEditar ? 'Custodia' : 'Custodia (lectura)',
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
      href: '/comunicacion' as const,
      active: false,
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

  if (!capabilities.puedeVer) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-cs-bg p-6">
        <section className="flex w-full max-w-[440px] flex-col items-center gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cs-criticalBorder bg-cs-criticalBg">
            <Image
              alt=""
              aria-hidden="true"
              height={28}
              src="/icons/triangle-alert-critical.svg"
              width={28}
            />
          </div>
          <h1 className="text-[22px] font-bold text-cs-textStrong">
            Acceso no permitido
          </h1>
          <p className="rounded-full bg-cs-criticalBg px-3 py-1 text-[13px] font-medium text-cs-criticalText">
            {CUSTODY_ROLE_DENIED_MESSAGE}
          </p>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
            href="/"
          >
            Volver al resumen
          </Link>
        </section>
      </div>
    );
  }

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
          <span className="inline-flex w-fit items-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] font-medium text-cs-textBody">
            {capabilities.roleLabel}
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
              <span className="inline-flex w-fit items-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[12px] text-cs-textBody">
                {capabilities.roleLabel}
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
                {capabilities.puedeEditar
                  ? 'Custodia · Restricciones judiciales'
                  : 'Custodia · Restricciones (solo lectura)'}
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surface px-3.5 text-[14px] font-medium text-cs-textBody hover:border-cs-borderStrong"
              href="/custodia"
            >
              Alertas de custodia
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
          {capabilities.puedeEditar && (
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1">
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Restricciones de custodia
                </h1>
                <p className="text-[14px] leading-[20px] text-cs-textMuted">
                  Gestión exclusiva de Coordinación (Superadministrador) con
                  confirmación y auditoría.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex w-full flex-col gap-1.5 sm:w-[280px]">
                  <label
                    className="text-[14px] font-medium text-cs-textBody"
                    htmlFor="restrictions-search-input"
                  >
                    Buscar menor o radicado
                  </label>
                  <input
                    className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                    id="restrictions-search-input"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="#E-104, 2026-0412..."
                    type="text"
                    value={searchQuery}
                  />
                </div>
                <button
                  className="h-[45px] rounded-cs-button bg-cs-primary px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cs-primaryHover"
                  onClick={handleOpenCreateDialog}
                  type="button"
                >
                  + Nueva restricción
                </button>
              </div>
            </div>
          )}

          {/* Banner contextual de restricción activa o solo lectura */}
          {capabilities.puedeEditar ? (
            selectedOrder?.status === 'Activa' && (
              <div
                className="flex items-start gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-4"
                role="status"
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
                  <p className="font-semibold text-cs-textStrong">
                    Orden judicial activa · {selectedOrder.studentRef}
                  </p>
                  <p className="text-cs-textMuted">
                    {CUSTODY_RESTRICTION_CATALOG_MESSAGE}
                  </p>
                </div>
              </div>
            )
          ) : (
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
                  Vista de solo lectura
                </p>
                <p className="text-cs-textMuted">
                  Solo el perfil Superadministrador (Coordinación) puede crear,
                  marcar revocatoria, suspender o archivar restricciones.
                </p>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          {visibleOrders.length === 0 ? (
            <section className="flex flex-1 items-center justify-center rounded-cs-card border border-cs-borderSoft bg-cs-surface p-10 text-center">
              <div className="flex max-w-[380px] flex-col items-center gap-3">
                <h2 className="text-[18px] font-semibold text-cs-textStrong">
                  Sin restricciones para mostrar
                </h2>
                <p className="text-[14px] text-cs-textMuted">
                  No se encontraron órdenes con el criterio de búsqueda actual.
                </p>
                <button
                  className="mt-1 h-11 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  Restablecer búsqueda
                </button>
              </div>
            </section>
          ) : (
            <div className="flex flex-1 flex-col gap-5 lg:flex-row">
              {/* Tabla izquierda */}
              <section
                aria-label="Órdenes de restricción y revocatorias"
                className="flex-1 overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
              >
                <div className="flex items-center justify-between border-b border-cs-borderSoft px-5 py-4">
                  <h2 className="text-[18px] font-semibold text-cs-textStrong">
                    Órdenes de restricción y revocatorias
                  </h2>
                  <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] text-cs-textMuted">
                    {visibleOrders.length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-cs-borderSoft bg-cs-surfaceInput text-[13px] font-medium text-cs-textMuted">
                        <th className="px-5 py-3">Menor</th>
                        <th className="px-4 py-3">Restringido</th>
                        <th className="px-4 py-3">Medida</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-5 py-3">Auditoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((item) => {
                        const isSelected = selectedOrder?.id === item.id;
                        return (
                          <tr
                            className={`cursor-pointer border-b border-cs-borderSoft transition-colors ${
                              isSelected
                                ? 'bg-cs-infoBg/40'
                                : 'hover:bg-cs-surfaceInput/60'
                            }`}
                            key={item.id}
                            onClick={() => handleSelectRow(item.id)}
                          >
                            <td className="px-5 py-4 font-semibold text-cs-textStrong">
                              <button
                                className="text-left hover:underline focus:outline-none"
                                onClick={() => handleSelectRow(item.id)}
                                type="button"
                              >
                                {item.studentRef}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-cs-textBody">
                              {item.restrictedPersonRef}
                            </td>
                            <td className="px-4 py-4 text-cs-textBody">
                              {item.measure}
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
                            <td className="px-5 py-4 text-[13px] text-cs-textMuted">
                              {item.latestAuditLabel}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Ficha derecha (ISP: editable vs solo lectura desacopladas) */}
              {selectedOrder &&
                (capabilities.puedeEditar ? (
                  <EditableRestrictionDetail
                    onRequestAction={handleRequestSensitiveAction}
                    onTogglePreview={handleTogglePreview}
                    order={selectedOrder}
                    previewMode={previewMode}
                  />
                ) : (
                  <ReadOnlyRestrictionDetail
                    onTogglePreview={handleTogglePreview}
                    order={selectedOrder}
                    previewMode={previewMode}
                  />
                ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal: Nueva restricción (322:2950) */}
      {createOpen && capabilities.puedeEditar && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
        >
          <form
            className="flex w-full max-w-[420px] flex-col gap-4 rounded-cs-card bg-cs-surface p-7 shadow-xl"
            onSubmit={handleCreateSubmit}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-bold text-cs-textStrong">
                Nueva restricción de custodia
              </h2>
              <p className="text-[13px] text-cs-textMuted">
                Solo Superadministrador (Coordinación). Se registra usuario y
                marca de tiempo.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="new-restriction-student"
              >
                Código del estudiante
              </label>
              <input
                className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                id="new-restriction-student"
                onChange={(e) => setFormStudentRef(e.target.value)}
                placeholder="#E-104"
                type="text"
                value={formStudentRef}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="new-restriction-person"
              >
                Persona restringida
              </label>
              <input
                className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                id="new-restriction-person"
                onChange={(e) => setFormRestrictedPerson(e.target.value)}
                placeholder="#PR-09 · Familiar no autorizado"
                type="text"
                value={formRestrictedPerson}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="new-restriction-support"
              >
                Soporte legal (oficio / radicado)
              </label>
              <input
                className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                id="new-restriction-support"
                onChange={(e) => setFormLegalSupport(e.target.value)}
                placeholder="Juzgado 3º Familia · 2026-0412"
                type="text"
                value={formLegalSupport}
              />
            </div>

            <div className="flex flex-col gap-2 text-[13px]">
              <label className="flex items-center gap-2 font-medium text-cs-warningText">
                <input
                  checked={formIsRevocation}
                  className="h-4 w-4 rounded border-cs-borderStrong"
                  onChange={(e) => setFormIsRevocation(e.target.checked)}
                  type="checkbox"
                />
                <span>Revocatoria patria potestad</span>
              </label>
              <label className="flex items-center gap-2 text-cs-textBody">
                <input
                  checked={formHasAttachments}
                  className="h-4 w-4 rounded border-cs-borderStrong"
                  onChange={(e) => setFormHasAttachments(e.target.checked)}
                  type="checkbox"
                />
                <span>Foto + PDF adjuntos</span>
              </label>
            </div>

            {createError && (
              <p className="text-[13px] text-cs-criticalText" role="alert">
                {createError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                className="h-12 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[15px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                onClick={() => setCreateOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-12 rounded-cs-button bg-cs-primary px-4 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                type="submit"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Confirmación sensible (322:3074) */}
      {pendingAction && selectedOrder && capabilities.puedeEditar && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
        >
          <form
            className="flex w-full max-w-[420px] flex-col gap-4 rounded-cs-card bg-cs-surface p-7 shadow-xl"
            onSubmit={handleConfirmSensitiveAction}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput">
              <Image
                alt=""
                aria-hidden="true"
                height={26}
                src="/icons/triangle-alert.svg"
                width={26}
              />
            </div>

            <h2 className="text-center text-[20px] font-bold text-cs-textStrong">
              {sensitiveActionTitle(pendingAction)}
            </h2>

            <div className="flex items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-4 text-[13px]">
              <Image
                alt=""
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                height={20}
                src="/icons/triangle-alert-critical.svg"
                width={20}
              />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-cs-textStrong">
                  Acción auditada
                </p>
                <p className="text-cs-textMuted">
                  {sensitiveActionDescription(
                    pendingAction,
                    selectedOrder.studentRef,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="audit-reason-input"
              >
                Motivo / soporte del cambio
              </label>
              <input
                aria-invalid={Boolean(auditReasonError)}
                className={`h-[45px] w-full rounded-cs-input border bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary ${
                  auditReasonError
                    ? 'border-cs-criticalText'
                    : 'border-cs-borderStrong'
                }`}
                id="audit-reason-input"
                onChange={(e) => {
                  setAuditReason(e.target.value);
                  if (auditReasonError) setAuditReasonError(null);
                }}
                placeholder="Levantamiento por oficio judicial..."
                type="text"
                value={auditReason}
              />
              {auditReasonError && (
                <p className="text-[12px] text-cs-criticalText" role="alert">
                  {auditReasonError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                className="h-12 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[15px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                onClick={() => setPendingAction(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-12 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[15px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                type="submit"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
