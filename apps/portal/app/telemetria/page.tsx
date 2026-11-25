import type { Metadata } from 'next';
import { FleetConsoleClient } from './_components/FleetConsoleClient';

export const metadata: Metadata = {
  title: 'Telemetría · Mapa global de flota · Camino Seguro Portal',
  description:
    'Consola de Coordinación con mapa MapLibre GL JS (solo cliente) y detalle de vehículos.',
};

export default function TelemetriaPage() {
  return <FleetConsoleClient />;
}
