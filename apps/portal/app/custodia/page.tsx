import type { Metadata } from 'next';
import { CustodiaAlertsClient } from './_components/CustodiaAlertsClient';

export const metadata: Metadata = {
  title: 'Custodia y Alertas · Camino Seguro Portal',
  description:
    'Consola operativa de alertas rojas, desvíos > 300 m, retrasos anómalos y transiciones de custodia.',
};

export default function CustodiaPage() {
  return <CustodiaAlertsClient />;
}
