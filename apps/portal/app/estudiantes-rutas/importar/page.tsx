import type { Metadata } from 'next';
import { BulkImportClient } from './_components/BulkImportClient';

export const metadata: Metadata = {
  title: 'Carga masiva de matrículas · Camino Seguro Portal',
  description:
    'Importación de planillas CSV o Excel con vista previa local y reporte de inconsistencias.',
};

export default function BulkImportPage() {
  return <BulkImportClient />;
}
