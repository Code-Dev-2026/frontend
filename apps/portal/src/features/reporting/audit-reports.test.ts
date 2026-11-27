import { describe, expect, it, vi } from 'vitest';
import {
  buildAuditReportSummary,
  createContractsAuditReportsGateway,
  DEFAULT_REPORT_FILTER,
  formatReportCsvContent,
  formatReportPdfContent,
  reportFilterSchema,
} from './audit-reports';

describe('audit reports domain', () => {
  it('rechaza rangos donde Fecha fin es anterior a Fecha inicio', () => {
    const invalid = reportFilterSchema.safeParse({
      ...DEFAULT_REPORT_FILTER,
      startDate: '2026-11-24',
      endDate: '2026-11-01',
    });

    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe(
        'Fecha fin debe ser >= Fecha inicio.',
      );
    }
  });

  it('filtra recorridos, incidentes y gráfica por ruta y fecha', () => {
    const allSummary = buildAuditReportSummary(DEFAULT_REPORT_FILTER);
    expect(allSummary.logs.length).toBeGreaterThan(0);
    expect(allSummary.chartData).toHaveLength(4);
    expect(allSummary.kpis.auditedTrips).toBeGreaterThan(0);

    const northOnly = buildAuditReportSummary({
      ...DEFAULT_REPORT_FILTER,
      routeCode: 'RUT-NOR',
    });
    expect(northOnly.chartData).toHaveLength(1);
    expect(northOnly.chartData[0]?.routeCode).toBe('RUT-NOR');
    expect(northOnly.logs.every((item) => item.routeCode === 'RUT-NOR')).toBe(
      true,
    );

    const emptyRange = buildAuditReportSummary({
      ...DEFAULT_REPORT_FILTER,
      startDate: '2025-01-01',
      endDate: '2025-01-15',
    });
    expect(emptyRange.logs).toEqual([]);
    expect(emptyRange.chartData).toEqual([]);
    expect(emptyRange.kpis.auditedTrips).toBe(0);
  });

  it('registra auditoría de exportación con respaldo seguro sin backend', async () => {
    const senderOk = vi.fn().mockResolvedValue({
      status: 201,
      data: undefined,
      headers: new Headers(),
    });
    const gatewayOk = createContractsAuditReportsGateway(senderOk);
    const okRes = await gatewayOk.logExportAudit('PDF', DEFAULT_REPORT_FILTER);
    expect(okRes).toEqual({ registered: 'api' });
    expect(senderOk).toHaveBeenCalledTimes(1);

    const senderFail = vi.fn().mockRejectedValue(new Error('Offline'));
    const gatewayFallback = createContractsAuditReportsGateway(senderFail);
    const localRes = await gatewayFallback.logExportAudit(
      'XLSX',
      DEFAULT_REPORT_FILTER,
    );
    expect(localRes).toEqual({ registered: 'local' });
  });

  it('genera contenido CSV y PDF válido en modo solo lectura', () => {
    const summary = buildAuditReportSummary(DEFAULT_REPORT_FILTER);
    const csv = formatReportCsvContent(DEFAULT_REPORT_FILTER, summary);
    expect(csv).toContain('Fecha / Hora,Ruta,Placa,Evento registrado,Estado');
    expect(csv).toContain('ABC-123');

    const pdf = formatReportPdfContent(DEFAULT_REPORT_FILTER, summary);
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('%%EOF');
  });
});
