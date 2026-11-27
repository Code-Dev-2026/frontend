import type { Metadata } from 'next';
import { CommunicationsClient } from './_components/CommunicationsClient';

export const metadata: Metadata = {
  title: 'Comunicados por severidad · Camino Seguro Portal',
  description:
    'Emisión de comunicados institucionales informativos y urgentes segmentados por ruta escolar.',
};

export default function ComunicacionPage() {
  return <CommunicationsClient />;
}
