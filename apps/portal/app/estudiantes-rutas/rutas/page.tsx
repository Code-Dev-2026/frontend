import type { Metadata } from 'next';
import type { StudentRole } from '@camino/domain';
import { RouteDesignerClient } from './_components/RouteDesignerClient';

export const metadata: Metadata = {
  title: 'Diseñador de rutas · Camino Seguro Portal',
  description:
    'Edición de paradas, orden secuencial, horario previsto y vista publicada de rutas escolares.',
};

function resolveRole(rolParam?: string): StudentRole {
  if (rolParam === 'lectura') return 'JEFE_OPERACIONES';
  return 'COORDINADORA_CONVIVENCIA';
}

export default async function RouteDesignerPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; vista?: string }>;
}) {
  const params = await searchParams;
  return (
    <RouteDesignerClient
      initialPublishedPreview={params.vista === 'publicada'}
      initialRole={resolveRole(params.rol)}
    />
  );
}
