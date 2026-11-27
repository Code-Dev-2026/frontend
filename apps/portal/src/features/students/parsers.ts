export interface EnrollmentPreviewRow {
  rowNumber: number;
  studentCode: string;
  grade: string;
  zoneStop: string;
  status: 'Lista' | 'Incompleta';
}

/**
 * OCP: cada formato compatible implementa esta interfaz sin modificar
 * el componente de carga ni la tabla de inconsistencias.
 */
export interface EnrollmentPreviewParser {
  readonly id: string;
  supports: (fileName: string) => boolean;
  parsePreview: (file: File) => Promise<EnrollmentPreviewRow[]>;
}

const MAX_PREVIEW_ROWS = 5;

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i] ?? '';
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  cells.push(current.trim());
  return cells;
}

function mapRawRowToPreview(
  cells: ReadonlyArray<string>,
  rowNumber: number,
): EnrollmentPreviewRow {
  const studentCode = (cells[0] ?? '').trim() || `FILA-${rowNumber}`;
  const grade = (cells[1] ?? '').trim();
  const zoneStop = (cells[2] ?? '').trim();

  return {
    rowNumber,
    studentCode,
    grade: grade || 'Sin grado',
    zoneStop: zoneStop || 'Sin zona/paradero',
    status:
      Boolean((cells[0] ?? '').trim()) && Boolean(grade) && Boolean(zoneStop)
        ? 'Lista'
        : 'Incompleta',
  };
}

function isHeaderRow(cells: ReadonlyArray<string>): boolean {
  return cells.some((rawCell) => {
    const cell = rawCell.trim().toLowerCase();
    if (!cell || cell.startsWith('#') || /\d/.test(cell)) {
      return false;
    }
    return (
      cell === 'grado' ||
      cell.includes('código') ||
      cell.includes('codigo') ||
      cell.includes('matricula') ||
      cell.includes('matrícula') ||
      cell.includes('paradero')
    );
  });
}

export function parseCsvTextPreview(csvText: string): EnrollmentPreviewRow[] {
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const headerLine = lines[0] ?? '';
  const delimiter =
    headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';

  const firstCells = splitCsvLine(headerLine, delimiter);
  const dataLines = isHeaderRow(firstCells) ? lines.slice(1) : lines;

  return dataLines.slice(0, MAX_PREVIEW_ROWS).map((line, index) => {
    const cells = splitCsvLine(line, delimiter);
    return mapRawRowToPreview(cells, index + 1);
  });
}

export const csvPreviewParser: EnrollmentPreviewParser = {
  id: 'csv',
  supports: (fileName: string) => fileName.toLowerCase().endsWith('.csv'),
  parsePreview: async (file: File) => {
    const text = await file.text();
    return parseCsvTextPreview(text);
  },
};

export const xlsxPreviewParser: EnrollmentPreviewParser = {
  id: 'xlsx',
  supports: (fileName: string) => fileName.toLowerCase().endsWith('.xlsx'),
  parsePreview: async (file: File) => {
    const { readSheet } = await import('read-excel-file/browser');
    const sheetRows = await readSheet(file);
    const normalizedRows = sheetRows
      .map((row) => row.map((cell) => (cell == null ? '' : String(cell))))
      .filter((row) => row.some((cell) => cell.trim().length > 0));

    if (normalizedRows.length === 0) return [];

    const firstRow = normalizedRows[0] ?? [];
    const dataRows = isHeaderRow(firstRow)
      ? normalizedRows.slice(1)
      : normalizedRows;

    return dataRows
      .slice(0, MAX_PREVIEW_ROWS)
      .map((row, index) => mapRawRowToPreview(row, index + 1));
  },
};

export const PREVIEW_PARSERS: ReadonlyArray<EnrollmentPreviewParser> = [
  csvPreviewParser,
  xlsxPreviewParser,
];

export async function parseEnrollmentPreviewFile(
  file: File,
): Promise<EnrollmentPreviewRow[]> {
  const parser = PREVIEW_PARSERS.find((candidate) =>
    candidate.supports(file.name),
  );
  if (!parser) {
    throw new Error('Formato de planilla no soportado para vista previa.');
  }
  return parser.parsePreview(file);
}
