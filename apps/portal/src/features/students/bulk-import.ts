import type { EnrollmentPreviewRow } from './parsers';

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMPORT_EXTENSIONS = ['.csv', '.xlsx'] as const;

export type FileValidationErrorCode =
  'invalid_type' | 'too_large' | 'empty_file';

export type FileValidationResult =
  | {
      valid: true;
      extension: '.csv' | '.xlsx';
      formattedSize: string;
    }
  | {
      valid: false;
      reasonCode: FileValidationErrorCode;
      extensionLabel: string;
      formattedSize: string;
      message: string;
    };

export type InconsistencyType = 'Duplicado' | 'Zona inválida' | 'Dato faltante';

export interface BulkImportInconsistency {
  rowNumber: number;
  studentCode: string;
  type: InconsistencyType;
  detail: string;
}

export interface BulkImportServerResult {
  fileName: string;
  validCount: number;
  inconsistencies: BulkImportInconsistency[];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : '';
}

export function validateImportFile(file: {
  name: string;
  size: number;
}): FileValidationResult {
  const ext = getFileExtension(file.name);
  const formattedSize = formatFileSize(file.size);

  if (ext !== '.csv' && ext !== '.xlsx') {
    return {
      valid: false,
      reasonCode: 'invalid_type',
      extensionLabel: ext || 'sin extensión',
      formattedSize,
      message:
        'Solo se admiten planillas .csv o .xlsx de hasta 10 MB. Selecciona un archivo válido.',
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      reasonCode: 'empty_file',
      extensionLabel: ext,
      formattedSize,
      message: 'El archivo seleccionado está vacío. Verifica la planilla.',
    };
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return {
      valid: false,
      reasonCode: 'too_large',
      extensionLabel: ext,
      formattedSize,
      message:
        'Tipo no permitido o supera el límite de 10 MB. Reduce el tamaño del archivo e intenta nuevamente.',
    };
  }

  return {
    valid: true,
    extension: ext,
    formattedSize,
  };
}

export function buildSampleEnrollmentCsv(): string {
  const lines = [
    'Código matrícula,Grado,Zona / Paradero',
    '#MAT-2026-201,Grado 4°,Zona Norte · P-04',
    '#MAT-2026-202,Grado 6°,Zona Centro · P-11',
    '#MAT-2026-203,Grado 2°,Zona Sur · P-08',
    '#MAT-2026-204,Grado 9°,Zona Norte · P-02',
    '#MAT-2026-205,Grado 1°,Zona Sur · P-15',
  ];
  return `${lines.join('\n')}\n`;
}

const DEFAULT_INCONSISTENCIES: ReadonlyArray<BulkImportInconsistency> = [
  {
    rowNumber: 14,
    studentCode: '#MAT-2026-214',
    type: 'Duplicado',
    detail: 'Matrícula ya registrada en período activo',
  },
  {
    rowNumber: 29,
    studentCode: '#MAT-2026-229',
    type: 'Duplicado',
    detail: 'Registro duplicado dentro de la planilla',
  },
  {
    rowNumber: 48,
    studentCode: '#MAT-2026-248',
    type: 'Zona inválida',
    detail: 'Paradero sin cobertura en rutas activas',
  },
  {
    rowNumber: 73,
    studentCode: '#MAT-2026-273',
    type: 'Dato faltante',
    detail: 'Grado escolar obligatorio',
  },
];

/**
 * Simulación de respuesta del backend para FE-26: el portal nunca homologa ni
 * unifica registros en el cliente; solo refleja el reporte devuelto por el API.
 */
export function buildMockBulkImportResult(
  fileName: string,
  previewRows: ReadonlyArray<EnrollmentPreviewRow>,
): BulkImportServerResult {
  const detectedFromPreview: BulkImportInconsistency[] = [];
  const seenCodes = new Set<string>();

  for (const row of previewRows) {
    if (seenCodes.has(row.studentCode)) {
      detectedFromPreview.push({
        rowNumber: row.rowNumber,
        studentCode: row.studentCode,
        type: 'Duplicado',
        detail: 'Registro duplicado dentro de la planilla',
      });
    }
    seenCodes.add(row.studentCode);

    if (row.status === 'Incompleta') {
      detectedFromPreview.push({
        rowNumber: row.rowNumber,
        studentCode: row.studentCode,
        type: 'Dato faltante',
        detail: 'Grado o zona/paradero obligatorio en la fila',
      });
    }
  }

  const inconsistencies =
    detectedFromPreview.length > 0
      ? detectedFromPreview
      : [...DEFAULT_INCONSISTENCIES];

  return {
    fileName,
    validCount: Math.max(previewRows.length, 115),
    inconsistencies,
  };
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildInconsistenciesCsv(
  inconsistencies: ReadonlyArray<BulkImportInconsistency>,
): string {
  const header = 'Fila,Código,Tipo,Detalle reportado';
  const rows = inconsistencies.map((item) =>
    [
      String(item.rowNumber),
      escapeCsvCell(item.studentCode),
      escapeCsvCell(item.type),
      escapeCsvCell(item.detail),
    ].join(','),
  );
  return `${[header, ...rows].join('\n')}\n`;
}
