import type { Metadata } from 'next';
import { ApprovalsClient } from './_components/ApprovalsClient';

export const metadata: Metadata = {
  title: 'Aprobaciones · Estudiantes y rutas · Camino Seguro Portal',
  description:
    'Bandeja de aprobaciones de pasajeros ocasionales y verificación documental de adultos autorizados.',
};

export default function EstudiantesRutasPage() {
  return <ApprovalsClient />;
}
