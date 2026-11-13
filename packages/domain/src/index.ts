export const STUDENT_STATES = [
  'EN_CASA',
  'A_BORDO_VEHICULO',
  'EN_COLEGIO',
  'RETORNO_SEDE_POR_FALLA_ENTREGA',
] as const;

export type StudentState = (typeof STUDENT_STATES)[number];

export const VALID_TRANSITIONS: Record<StudentState, StudentState[]> = {
  EN_CASA: ['A_BORDO_VEHICULO'],
  A_BORDO_VEHICULO: ['EN_COLEGIO', 'RETORNO_SEDE_POR_FALLA_ENTREGA'],
  EN_COLEGIO: ['RETORNO_SEDE_POR_FALLA_ENTREGA'],
  RETORNO_SEDE_POR_FALLA_ENTREGA: ['EN_CASA'],
};

export const canTransitionTo = (
  from: StudentState,
  to: StudentState,
): boolean => {
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
  const timestampBytes = new Uint8Array(6);
  let timestamp = now;
  for (let index = timestampBytes.length - 1; index >= 0; index -= 1) {
    timestampBytes[index] = timestamp & 0xff;
    timestamp = Math.floor(timestamp / 256);
  }

  const random = crypto.getRandomValues(new Uint8Array(10));
  const randomByte0 = random[0];
  const randomByte1 = random[1];
  const randomByte2 = random[2];
  if (
    randomByte0 === undefined ||
    randomByte1 === undefined ||
    randomByte2 === undefined
  ) {
    throw new Error('No fue posible generar un UUID v7 seguro.');
  }

  const bytes = new Uint8Array(16);
  bytes.set(timestampBytes);
  bytes[6] = 0x70 | (randomByte0 & 0x0f);
  bytes[7] = randomByte1;
  bytes[8] = 0x80 | (randomByte2 & 0x3f);
  bytes.set(random.slice(3), 9);

  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10).join(''),
  ].join('-');
};

export const STUDENT_ROLES = [
  'COORDINADORA_CONVIVENCIA',
  'RECTORIA',
  'GERENCIA_TRANSPORTE',
  'JEFE_OPERACIONES',
  'ADMINISTRADOR_CARTERA',
  'MONITORA',
  'CONDUCTOR',
  'ACUDIENTE',
] as const;

export type StudentRole = (typeof STUDENT_ROLES)[number];
