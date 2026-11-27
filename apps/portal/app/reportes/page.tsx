import type { Metadata } from 'next';
import { AuditReportsClient } from './_components/AuditReportsClient';

export const metadata: Metadata = {
  title: 'Reportes de auditoría e incidentes · Camino Seguro Portal',
  description:
    'Consulta de recorridos auditados, desvíos, retrasos anómalos y exportación certificada de solo lectura.',
};

export default function ReportesPage() {
  return <AuditReportsClient />;
}
