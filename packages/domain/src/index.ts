export const STUDENT_STATES = [
  'EN_CASA',
  'A_BORDO_VEHICULO',
  'EN_COLEGIO',
  'RETORNO_SEDE_POR_FALLA_ENTREGA'
] as const;

export type StudentState = (typeof STUDENT_STATES)[number];

export const VALID_TRANSITIONS: Record<StudentState, StudentState[]> = {
  EN_CASA: ['A_BORDO_VEHICULO'],
  A_BORDO_VEHICULO: ['EN_COLEGIO', 'RETORNO_SEDE_POR_FALLA_ENTREGA'],
  EN_COLEGIO: ['RETORNO_SEDE_POR_FALLA_ENTREGA'],
  RETORNO_SEDE_POR_FALLA_ENTREGA: ['EN_CASA']
};

export const canTransitionTo = (from: StudentState, to: StudentState): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};

export const shouldShowCustodyMap = (state: StudentState): boolean => {
  return state === 'A_BORDO_VEHICULO';
};

export const assertMaxAuthorizedAdults = (count: number): boolean => {
  if (count > 3) {
    throw new Error('DENEGADO_SOBRECUPO');
  }

  return true;
};

export const createUuidV7 = (): string => {
  const now = Date.now();
  const random = crypto.getRandomValues(new Uint8Array(10));

  const timestampHex = now.toString(16).padStart(12, '0');
  const randomHex = Array.from(random)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

  return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8)}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8)}`;
};

export const STUDENT_ROLES = ['COORDINADORA_CONVIVENCIA', 'RECTORIA', 'GERENCIA_TRANSPORTE', 'JEFE_OPERACIONES', 'ADMINISTRADOR_CARTERA', 'MONITORA', 'CONDUCTOR', 'ACUDIENTE'] as const;

export type StudentRole = (typeof STUDENT_ROLES)[number];
