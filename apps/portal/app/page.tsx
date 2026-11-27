import type { Metadata } from 'next';
import { PortalHomeClient } from './_components/PortalHomeClient';

export const metadata: Metadata = {
  title: 'Resumen · Camino Seguro Portal',
  description:
    'Panel operativo de Camino Seguro con acceso directo a telemetría y custodia.',
};

export default function Page() {
  return <PortalHomeClient />;
}
