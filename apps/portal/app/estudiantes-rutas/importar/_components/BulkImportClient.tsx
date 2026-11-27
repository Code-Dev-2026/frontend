'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  buildInconsistenciesCsv,
  buildMockBulkImportResult,
  buildSampleEnrollmentCsv,
  formatFileSize,
  validateImportFile,
  type BulkImportServerResult,
  type InconsistencyType,
} from '../../../../src/features/students/bulk-import';
import {
  parseEnrollmentPreviewFile,
  type EnrollmentPreviewRow,
} from '../../../../src/features/students/parsers';

type ImportFlowStage =
  | { status: 'idle' }
  | {
      status: 'error';
      fileName: string;
      formattedSize: string;
      extensionLabel: string;
      reasonCode: 'invalid_type' | 'too_large' | 'empty_file' | 'parse_error';
      message: string;
    }
  | {
      status: 'preview';
      file: File;
      extension: '.csv' | '.xlsx';
      formattedSize: string;
      rows: EnrollmentPreviewRow[];
    }
  | {
      status: 'uploading';
      fileName: string;
      progress: number;
    }
  | {
      status: 'completed';
      result: BulkImportServerResult;
    };

function inconsistencyPillClasses(type: InconsistencyType): string {
  switch (type) {
    case 'Duplicado':
      return 'bg-cs-warningBg text-cs-warningText';
    case 'Zona inválida':
      return 'border border-cs-borderSoft bg-cs-surfaceInput text-cs-textBody';
    case 'Dato faltante':
      return 'bg-cs-warningBg font-semibold text-cs-warningText';
  }
}

export function BulkImportClient() {
  const [stage, setStage] = useState<ImportFlowStage>({ status: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  function clearProgressTimer() {
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleSelectedFile(file: File | undefined | null) {
    if (!file) return;
    clearProgressTimer();

    const validation = validateImportFile({
      name: file.name,
      size: file.size,
    });

    if (!validation.valid) {
      setStage({
        status: 'error',
        fileName: file.name,
        formattedSize: validation.formattedSize,
        extensionLabel: validation.extensionLabel,
        reasonCode: validation.reasonCode,
        message: validation.message,
      });
      return;
    }

    try {
      const rows = await parseEnrollmentPreviewFile(file);
      if (rows.length === 0) {
        setStage({
          status: 'error',
          fileName: file.name,
          formattedSize: validation.formattedSize,
          extensionLabel: validation.extension,
          reasonCode: 'parse_error',
          message:
            'No se encontraron filas de matrícula válidas en la planilla seleccionada.',
        });
        return;
      }

      setStage({
        status: 'preview',
        file,
        extension: validation.extension,
        formattedSize: formatFileSize(file.size),
        rows,
      });
    } catch {
      setStage({
        status: 'error',
        fileName: file.name,
        formattedSize: validation.formattedSize,
        extensionLabel: validation.extension,
        reasonCode: 'parse_error',
        message:
          'No fue posible leer la estructura del archivo. Verifica que sea una planilla .csv o .xlsx válida.',
      });
    }
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    void handleSelectedFile(file);
    event.target.value = '';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    void handleSelectedFile(file);
  }

  function handleSubmitImport() {
    if (stage.status !== 'preview') return;
    clearProgressTimer();

    const fileName = stage.file.name;
    const previewRows = stage.rows;
    let progress = 20;

    setStage({
      status: 'uploading',
      fileName,
      progress,
    });

    progressTimerRef.current = setInterval(() => {
      progress = Math.min(progress + 25, 100);
      if (progress >= 100) {
        clearProgressTimer();
        setStage({
          status: 'completed',
          result: buildMockBulkImportResult(fileName, previewRows),
        });
        return;
      }
      setStage({
        status: 'uploading',
        fileName,
        progress,
      });
    }, 260);
  }

  function handleDownloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function handleResetImport() {
    clearProgressTimer();
    setStage({ status: 'idle' });
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

  return (
    <div className="flex min-h-screen w-full bg-cs-bg">
      {/* Input oculto para selección de planillas */}
      <input
        accept=".csv,.xlsx"
        aria-label="Seleccionar planilla CSV o Excel"
        className="sr-only"
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />

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
                Estudiantes y rutas · Carga masiva
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
              Bandeja de aprobaciones
            </Link>
            <Link
              className="hidden h-10 items-center justify-center rounded-[12px] border border-cs-successBorder bg-cs-successBg px-4 text-[16px] font-semibold text-cs-successText lg:inline-flex"
              href="/health"
            >
              Estado /health
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
          {/* Aviso informativo superior */}
          {(stage.status === 'idle' || stage.status === 'preview') && (
            <div className="flex flex-col justify-between gap-3 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
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
                    Carga masiva de matrículas
                  </p>
                  <p className="text-cs-textMuted">
                    La vista previa muestra las primeras filas localmente; el
                    procesamiento y cruce de duplicados se realiza al enviar la
                    planilla.
                  </p>
                </div>
              </div>

              <button
                className="h-10 shrink-0 rounded-cs-button border border-cs-borderSoft bg-cs-surfaceInput px-4 text-[13px] font-semibold text-cs-navy hover:border-cs-borderStrong"
                onClick={() =>
                  handleDownloadCsv(
                    buildSampleEnrollmentCsv(),
                    'plantilla_matriculas.csv',
                  )
                }
                type="button"
              >
                Descargar plantilla (.csv)
              </button>
            </div>
          )}

          {/* Zona Dropzone: Idle o Preview o Error */}
          {(stage.status === 'idle' ||
            stage.status === 'preview' ||
            stage.status === 'error') && (
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-cs-card border-2 border-dashed p-8 text-center transition-colors ${
                stage.status === 'error'
                  ? 'border-cs-criticalBorder bg-cs-surface'
                  : isDragging
                    ? 'border-cs-primary bg-cs-infoBg/30'
                    : 'border-cs-borderStrong bg-cs-surface'
              }`}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDrop={handleDrop}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cs-borderSoft bg-cs-surfaceInput">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={24}
                  src={
                    stage.status === 'error'
                      ? '/icons/triangle-alert.svg'
                      : '/icons/route.svg'
                  }
                  width={24}
                />
              </div>

              {stage.status === 'idle' && (
                <>
                  <h1 className="text-[18px] font-semibold text-cs-textStrong">
                    Arrastra y suelta tu planilla CSV o Excel (.xlsx)
                  </h1>
                  <p className="text-[14px] text-cs-textMuted">
                    Formatos permitidos: .csv y .xlsx · Tamaño máximo: 10 MB
                  </p>
                  <button
                    className="mt-1 h-11 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                    onClick={triggerFilePicker}
                    type="button"
                  >
                    Seleccionar archivo
                  </button>
                </>
              )}

              {stage.status === 'preview' && (
                <>
                  <h1 className="text-[18px] font-semibold text-cs-textStrong">
                    Arrastra y suelta tu planilla CSV o Excel (.xlsx)
                  </h1>
                  <p className="text-[14px] text-cs-textMuted">
                    Archivo seleccionado:{' '}
                    <span className="font-medium text-cs-textStrong">
                      {stage.file.name}
                    </span>{' '}
                    ({stage.formattedSize}) · Límite: 10 MB
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[12px] font-medium text-cs-successText">
                      Tipo válido ({stage.extension})
                    </span>
                    <span className="text-[13px] font-medium text-cs-textStrong">
                      {stage.formattedSize} / 10 MB
                    </span>
                  </div>
                </>
              )}

              {stage.status === 'error' && (
                <>
                  <h1 className="text-[18px] font-semibold text-cs-textStrong">
                    Archivo rechazado: {stage.fileName} ({stage.formattedSize})
                  </h1>
                  <p className="text-[14px] text-cs-textMuted">
                    Tipo no permitido o supera el límite de 10 MB.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[12px] font-medium text-cs-warningText">
                      {stage.reasonCode === 'invalid_type'
                        ? `Formato inválido (${stage.extensionLabel})`
                        : stage.reasonCode === 'too_large'
                          ? 'Supera 10 MB'
                          : 'Archivo sin filas válidas'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Banner + botón de error (328:3674) */}
          {stage.status === 'error' && (
            <>
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
                  <p className="font-semibold text-cs-textStrong">
                    Error de validación de archivo
                  </p>
                  <p className="text-cs-textMuted">{stage.message}</p>
                </div>
              </div>

              <div>
                <button
                  className="h-12 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                  onClick={triggerFilePicker}
                  type="button"
                >
                  Seleccionar otro archivo
                </button>
              </div>
            </>
          )}

          {/* Vista previa primeras 5 filas (328:3230) */}
          {stage.status === 'preview' && (
            <>
              <section
                aria-label="Vista previa de primeras filas"
                className="overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cs-borderSoft px-5 py-4">
                  <h2 className="text-[18px] font-semibold text-cs-textStrong">
                    Vista previa (primeras {stage.rows.length} filas)
                  </h2>
                  <span className="text-[13px] font-medium text-cs-textMuted">
                    Solo vista previa · Sin PII en logs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-cs-borderSoft bg-cs-surfaceInput text-[13px] font-medium text-cs-textMuted">
                        <th className="px-5 py-3">Fila</th>
                        <th className="px-4 py-3">Código matrícula</th>
                        <th className="px-4 py-3">Grado</th>
                        <th className="px-4 py-3">Zona / Paradero</th>
                        <th className="px-5 py-3 text-right">Pre-chequeo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage.rows.map((row) => (
                        <tr
                          className="border-b border-cs-borderSoft last:border-b-0"
                          key={row.rowNumber}
                        >
                          <td className="px-5 py-3.5 text-cs-textMuted">
                            {row.rowNumber}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-cs-textStrong">
                            {row.studentCode}
                          </td>
                          <td className="px-4 py-3.5 text-cs-textBody">
                            {row.grade}
                          </td>
                          <td className="px-4 py-3.5 text-cs-textMuted">
                            {row.zoneStop}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={`inline-flex rounded-full px-3 py-0.5 text-[12px] font-medium ${
                                row.status === 'Lista'
                                  ? 'border border-cs-successBorder bg-cs-successBg text-cs-successText'
                                  : 'bg-cs-warningBg text-cs-warningText'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-[13px] text-cs-textMuted">
                  Privacidad: el contenido del archivo no se registra en consola
                  ni logs.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="h-12 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-5 text-[15px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                    onClick={triggerFilePicker}
                    type="button"
                  >
                    Cambiar archivo
                  </button>
                  <button
                    className="h-12 rounded-cs-button bg-cs-primary px-6 text-[15px] font-semibold text-white hover:bg-cs-primaryHover"
                    onClick={handleSubmitImport}
                    type="button"
                  >
                    Enviar planilla
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Progreso de envío */}
          {stage.status === 'uploading' && (
            <section
              aria-busy="true"
              className="flex flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[18px] font-semibold text-cs-textStrong">
                  Procesando planilla: {stage.fileName}
                </h2>
                <span className="text-[14px] font-semibold text-cs-primary">
                  {stage.progress}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-cs-surfaceInput">
                <div
                  className="h-full rounded-full bg-cs-primary transition-all duration-200"
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
              <p className="text-[13px] text-cs-textMuted">
                Validando duplicados, zonas de cobertura y campos obligatorios…
              </p>
            </section>
          )}

          {/* Resultado completado + tabla de inconsistencias (328:3409) */}
          {stage.status === 'completed' && (
            <>
              <section className="flex flex-col gap-4 rounded-cs-card border border-cs-borderSoft bg-cs-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-[18px] font-semibold text-cs-textStrong">
                    Procesamiento completado: {stage.result.fileName}
                  </h1>
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full border border-cs-successBorder bg-cs-successBg px-3 py-1 text-[13px] font-medium text-cs-successText">
                      {stage.result.validCount} válidas
                    </span>
                    <span className="rounded-full bg-cs-warningBg px-3 py-1 text-[13px] font-medium text-cs-warningText">
                      {stage.result.inconsistencies.length} inconsistencias
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-cs-primary" />

                <div className="flex items-start gap-3 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput p-4 text-[14px]">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    height={22}
                    src="/icons/triangle-alert-warning.svg"
                    width={22}
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-cs-textStrong">
                      Carga procesada con observaciones
                    </p>
                    <p className="text-cs-textMuted">
                      Se detectaron duplicados e inconsistencias. Descarga el
                      reporte para corregirlo en origen.
                    </p>
                  </div>
                </div>
              </section>

              <section
                aria-label="Reporte de inconsistencias y duplicados"
                className="overflow-hidden rounded-cs-card border border-cs-borderSoft bg-cs-surface"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cs-borderSoft px-5 py-4">
                  <h2 className="text-[18px] font-semibold text-cs-textStrong">
                    Reporte de inconsistencias y duplicados
                  </h2>
                  <button
                    className="h-11 rounded-cs-button border border-cs-borderSoft bg-cs-surface px-4 text-[14px] font-semibold text-cs-textStrong hover:bg-cs-surfaceInput"
                    onClick={() =>
                      handleDownloadCsv(
                        buildInconsistenciesCsv(stage.result.inconsistencies),
                        'reporte_inconsistencias.csv',
                      )
                    }
                    type="button"
                  >
                    Descargar reporte (.csv)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-cs-borderSoft bg-cs-surfaceInput text-[13px] font-medium text-cs-textMuted">
                        <th className="px-5 py-3">Fila</th>
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-5 py-3">Detalle reportado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage.result.inconsistencies.map((inc, idx) => (
                        <tr
                          className="border-b border-cs-borderSoft last:border-b-0"
                          key={`${inc.rowNumber}-${inc.studentCode}-${idx}`}
                        >
                          <td className="px-5 py-3.5 text-cs-textMuted">
                            {inc.rowNumber}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-cs-textStrong">
                            {inc.studentCode}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-3 py-0.5 text-[12px] font-medium ${inconsistencyPillClasses(
                                inc.type,
                              )}`}
                            >
                              {inc.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-cs-textMuted">
                            {inc.detail}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  className="h-11 rounded-cs-button bg-cs-primary px-5 text-[14px] font-semibold text-white hover:bg-cs-primaryHover"
                  onClick={handleResetImport}
                  type="button"
                >
                  Cargar otra planilla
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
