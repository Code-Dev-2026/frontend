import type { Metadata } from 'next';
import type { StudentRole } from '@camino/domain';
import { RestrictionsClient } from './_components/RestrictionsClient';

export const metadata: Metadata = {
  title: 'Restricciones de custodia · Camino Seguro Portal',
  description:
    'Gestión de órdenes judiciales de restricción y revocatorias de patria potestad.',
};

function resolveInitialRole(rolParam?: string): StudentRole {
  switch (rolParam) {
    case 'lectura':
      return 'JEFE_OPERACIONES';
    case 'sin-acceso':
      return 'ADMINISTRADOR_CARTERA';
    default:
      return 'COORDINADORA_CONVIVENCIA';
  }
}

export default async function CustodyRestrictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const params = await searchParams;
  return <RestrictionsClient initialRole={resolveInitialRole(params.rol)} />;
}
