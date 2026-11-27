'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ModuleCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  statusLabel: string;
  isActive: boolean;
  href:
    | '/estudiantes-rutas'
    | '/custodia'
    | '/telemetria'
    | '/comunicacion'
    | '/reportes'
    | null;
}

const MODULE_CARDS: ReadonlyArray<ModuleCardItem> = [
  {
    id: 'rutas',
    title: 'Estudiantes y rutas',
    description:
      'Gestión de paraderos, aprobaciones y asignación de rutas escolares.',
    icon: '/icons/route.svg',
    statusLabel: 'Activo',
    isActive: true,
    href: '/estudiantes-rutas',
  },
  {
    id: 'custodia',
    title: 'Custodia',
    description: 'Validación de entrega segura y seguimiento de novedades.',
    icon: '/icons/shield-check.svg',
    statusLabel: 'Activo',
    isActive: true,
    href: '/custodia',
  },
  {
    id: 'telemetria',
    title: 'Telemetría',
    description: 'Monitoreo operativo de recorridos, flota y tiempos.',
    icon: '/icons/bus-front-navy.svg',
    statusLabel: 'Activo',
    isActive: true,
    href: '/telemetria',
  },
  {
    id: 'comunicacion',
    title: 'Comunicación',
    description: 'Comunicados informativos y urgentes del colegio.',
    icon: '/icons/bell.svg',
    statusLabel: 'Activo',
    isActive: true,
    href: '/comunicacion',
  },
  {
    id: 'reportes',
    title: 'Reportes y auditoría',
    description: 'Consulta de recorridos, desvíos e incidentes certificados.',
    icon: '/icons/eye.svg',
    statusLabel: 'Activo',
    isActive: true,
    href: '/reportes',
  },
  {
    id: 'cartera',
    title: 'Cartera',
    description: 'Consulta administrativa de estado de cuenta.',
    icon: '/icons/users.svg',
    statusLabel: 'Próximamente',
    isActive: false,
    href: null,
  },
];

const PREVIEW_ROWS = [
  {
    id: 'e-01',
    student: 'Estudiante 01',
    route: 'Ruta 01',
    stateLabel: 'En Casa/Espera',
    stateIcon: '/icons/house-slate.svg',
    syncLabel: 'Estado confirmado',
    href: '/custodia' as const,
  },
  {
    id: 'e-02',
    student: 'Estudiante 02',
    route: 'Ruta 01',
    stateLabel: 'A Bordo del Vehículo',
    stateIcon: '/icons/bus-front-navy.svg',
    syncLabel: 'Estado confirmado',
    href: '/telemetria' as const,
  },
  {
    id: 'e-03',
    student: 'Estudiante 03',
    route: 'Ruta 01',
    stateLabel: 'En Custodia Institucional',
    stateIcon: '/icons/shield-check.svg',
    syncLabel: 'Estado confirmado',
    href: '/custodia' as const,
  },
] as const;

export function PortalHomeClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MODULE_CARDS;
    return MODULE_CARDS.filter(
      (mod) =>
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const navItems = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: '/icons/house.svg',
      href: '/' as const,
      active: true,
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

  const topModules = visibleModules.slice(0, 3);
  const bottomModules = visibleModules.slice(3);

  return (
    <div className="flex min-h-screen w-full bg-cs-bg">
      {/* Sidebar Desktop (240 px) */}
      <aside className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-cs-borderSoft bg-cs-surface px-4 py-5 lg:flex">
        <div className="flex flex-col gap-4">
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

          <nav
            aria-label="Navegación principal"
            className="flex flex-col gap-2"
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

        <div className="flex flex-col gap-3">
          <Link
            className="flex h-11 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput px-3 text-[13px] font-medium text-cs-textBody hover:border-cs-borderStrong hover:text-cs-navy"
            href="/login"
          >
            Cambiar sesión / Acceso
          </Link>
          <p className="text-[13px] leading-[18px] text-cs-textMuted">
            Colegio San Benito del Otún
          </p>
        </div>
      </aside>

      {/* Drawer Tablet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 flex w-[260px] flex-col justify-between bg-cs-surface px-4 py-6 shadow-xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <Image
                    alt="Camino Seguro"
                    height={36}
                    src="/logo-camino-seguro.svg"
                    width={32}
                  />
                  <span className="text-[15px] font-bold text-cs-navy">
                    Camino Seguro
                  </span>
                </div>
                <button
                  aria-label="Cerrar menú"
                  className="rounded-lg px-2 py-1 text-[16px] text-cs-textMuted hover:bg-cs-surfaceInput"
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-2">
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
            <Link
              className="flex h-11 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput px-3 text-[13px] font-medium text-cs-textBody"
              href="/login"
            >
              Cambiar sesión / Acceso
            </Link>
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
                Resumen
              </span>
              <span className="hidden text-[13px] leading-[18px] text-cs-textMuted sm:block">
                Portal administrativo · Camino Seguro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-cs-borderSoft bg-cs-surface px-3.5 text-[14px] font-medium text-cs-textBody hover:border-cs-borderStrong"
              href="/login"
            >
              Iniciar sesión
            </Link>
            <span className="hidden h-10 items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 text-[14px] font-semibold text-cs-successText sm:inline-flex">
              Operación activa
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
          {/* Buscador de módulos */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex w-full flex-col gap-1.5 sm:w-[340px]">
              <label
                className="text-[14px] font-medium text-cs-textBody"
                htmlFor="home-module-search"
              >
                Buscar módulo
              </label>
              <input
                className="h-[45px] w-full rounded-cs-input border border-cs-borderStrong bg-cs-surfaceInput px-4 text-[14px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary"
                id="home-module-search"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. Custodia, telemetría..."
                type="text"
                value={searchQuery}
              />
            </div>
            {searchQuery && (
              <button
                className="h-[45px] rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-medium text-cs-textBody hover:border-cs-borderStrong"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Módulos fila 1 */}
          <section
            aria-label="Módulos operativos"
            className="grid gap-4 md:grid-cols-3"
          >
            {topModules.map((mod) =>
              mod.href ? (
                <Link
                  className="group flex flex-col justify-between gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 transition-colors hover:border-cs-primary"
                  href={mod.href}
                  key={mod.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Image
                      alt=""
                      aria-hidden="true"
                      height={24}
                      src={mod.icon}
                      width={24}
                    />
                    <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-0.5 text-[12px] font-medium text-cs-successText">
                      {mod.statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[18px] font-semibold text-cs-textStrong group-hover:text-cs-primary">
                      {mod.title}
                    </h2>
                    <p className="text-[14px] leading-[20px] text-cs-textMuted">
                      {mod.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <article
                  className="flex flex-col justify-between gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 opacity-80"
                  key={mod.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Image
                      alt=""
                      aria-hidden="true"
                      height={24}
                      src={mod.icon}
                      width={24}
                    />
                    <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-0.5 text-[12px] text-cs-textMuted">
                      {mod.statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[18px] font-semibold text-cs-textStrong">
                      {mod.title}
                    </h2>
                    <p className="text-[14px] leading-[20px] text-cs-textMuted">
                      {mod.description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </section>

          {/* Módulos fila 2 */}
          {bottomModules.length > 0 && (
            <section
              aria-label="Módulos administrativos"
              className="grid gap-4 md:grid-cols-2"
            >
              {bottomModules.map((mod) => (
                <article
                  className="flex flex-col justify-between gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5 opacity-80"
                  key={mod.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Image
                      alt=""
                      aria-hidden="true"
                      height={24}
                      src={mod.icon}
                      width={24}
                    />
                    <span className="rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-0.5 text-[12px] text-cs-textMuted">
                      {mod.statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[18px] font-semibold text-cs-textStrong">
                      {mod.title}
                    </h2>
                    <p className="text-[14px] leading-[20px] text-cs-textMuted">
                      {mod.description}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Tabla resumen de recorridos */}
          <section
            aria-label="Estudiantes por ruta"
            className="overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
          >
            <div className="flex items-center justify-between border-b border-cs-borderSoft px-5 py-4">
              <h2 className="text-[18px] font-semibold text-cs-textStrong">
                Estudiantes por ruta
              </h2>
              <Link
                className="text-[14px] font-semibold text-cs-navy hover:underline"
                href="/telemetria"
              >
                Ver mapa en vivo →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-cs-borderSoft bg-cs-surfaceInput text-[13px] font-medium text-cs-textMuted">
                    <th className="px-5 py-3">Estudiante</th>
                    <th className="px-4 py-3">Ruta</th>
                    <th className="px-4 py-3">Último estado confirmado</th>
                    <th className="px-4 py-3">Sincronización</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW_ROWS.map((row) => (
                    <tr
                      className="border-b border-cs-borderSoft last:border-b-0"
                      key={row.id}
                    >
                      <td className="px-5 py-4 font-medium text-cs-textStrong">
                        {row.student}
                      </td>
                      <td className="px-4 py-4 text-cs-textBody">
                        {row.route}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cs-borderSoft bg-cs-surfaceInput px-3 py-1 text-[13px] text-cs-textBody">
                          <Image
                            alt=""
                            aria-hidden="true"
                            height={16}
                            src={row.stateIcon}
                            width={16}
                          />
                          {row.stateLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-cs-textMuted">
                        {row.syncLabel}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="font-semibold text-cs-navy hover:underline"
                          href={row.href}
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
