import { describe, expect, it } from 'vitest';
import {
  buildInconsistenciesCsv,
  buildMockBulkImportResult,
  buildSampleEnrollmentCsv,
  MAX_IMPORT_FILE_BYTES,
  validateImportFile,
} from './bulk-import';
import { parseCsvTextPreview, PREVIEW_PARSERS } from './parsers';

describe('FE-26 Carga masiva CSV/Excel de matrículas', () => {
  it('valida tipo (.csv / .xlsx) y tamaño máximo de 10 MB en cliente', () => {
    expect(
      validateImportFile({ name: 'matriculas_2026.xlsx', size: 1_400_000 })
        .valid,
    ).toBe(true);
    expect(
      validateImportFile({ name: 'matriculas.csv', size: 2048 }).valid,
    ).toBe(true);

    const wrongType = validateImportFile({
      name: 'listado_sin_formato.pdf',
      size: 2048,
    });
    expect(wrongType.valid).toBe(false);
    if (!wrongType.valid) {
      expect(wrongType.reasonCode).toBe('invalid_type');
    }

    const tooBig = validateImportFile({
      name: 'matriculas_enorme.xlsx',
      size: MAX_IMPORT_FILE_BYTES + 1,
    });
    expect(tooBig.valid).toBe(false);
    if (!tooBig.valid) {
      expect(tooBig.reasonCode).toBe('too_large');
    }
  });

  it('parsea las primeras 5 filas del CSV sin exponer logs y mantiene parsers desacoplados (OCP)', () => {
    expect(PREVIEW_PARSERS.map((p) => p.id)).toEqual(['csv', 'xlsx']);

    const rows = parseCsvTextPreview(buildSampleEnrollmentCsv());
    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual({
      rowNumber: 1,
      studentCode: '#MAT-2026-201',
      grade: 'Grado 4°',
      zoneStop: 'Zona Norte · P-04',
      status: 'Lista',
    });

    const semicolonRows = parseCsvTextPreview(
      '#MAT-2026-301;Grado 5°;Zona Sur · P-01\n#MAT-2026-302;;Zona Norte',
    );
    expect(semicolonRows).toHaveLength(2);
    expect(semicolonRows[1]?.status).toBe('Incompleta');
  });

  it('genera reporte de inconsistencias descargable en CSV', () => {
    const preview = parseCsvTextPreview(buildSampleEnrollmentCsv());
    const result = buildMockBulkImportResult('matriculas_2026.csv', preview);

    expect(result.inconsistencies.length).toBeGreaterThan(0);
    const csv = buildInconsistenciesCsv(result.inconsistencies);
    expect(csv).toContain('Fila,Código,Tipo,Detalle reportado');
    expect(csv).toContain('#MAT-2026-214');
  });
});
