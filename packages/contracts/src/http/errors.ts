const CAPACITY_MESSAGE_PATTERN =
  /^ABORDAJE DENEGADO: El vehículo ha alcanzado su capacidad nominal estricta \(\d+ pasajeros\)\. Violación de seguridad N\+1\.$/;

export const API_ERROR_MESSAGES = {
  auth_failed: 'Credenciales inválidas o usuario inactivo.',
  mfa_invalid: 'Código TOTP de 6 dígitos inválido.',
  role_not_allowed: 'Tu rol no tiene acceso a esta aplicación.',
  rate_limited: 'Demasiados intentos. Espera antes de volver a intentarlo.',
  CAPACIDAD_AGOTADA:
    'ABORDAJE DENEGADO: El vehículo ha alcanzado su capacidad nominal estricta.',
  RESTRICCION_CUSTODIA:
    'ALERTA JUDICIAL ACTIVA: Prohibida entrega del menor a esta persona bajo orden judicial cautelar.',
  ANTICIPACION_INSUFICIENTE:
    'REGLA RN-03: La solicitud de pasajero ocasional debe radicarse con al menos 2 horas de antelación.',
  VIAJE_DATOS_INCOMPLETOS: 'Faltan datos obligatorios para programar el viaje.',
  IDEMPOTENCIA_REQUERIDA: 'Idempotency key obligatoria.',
  RECURSO_NO_ENCONTRADO: 'No se encontró el recurso solicitado.',
  VALIDATION_ERROR: 'La solicitud contiene datos inválidos.',
  UNKNOWN: 'No fue posible completar la solicitud.',
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_MESSAGES;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string = API_ERROR_MESSAGES[code],
    readonly correlationId?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiError';
  }
}

interface ApiErrorPayload {
  code?: unknown;
  message?: unknown;
  error?: unknown;
  correlationId?: unknown;
}

function isRecord(value: unknown): value is ApiErrorPayload {
  return typeof value === 'object' && value !== null;
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return (
    typeof value === 'string' &&
    Object.hasOwn(API_ERROR_MESSAGES, value) &&
    value !== 'UNKNOWN'
  );
}

export function createApiError(status: number, payload: unknown): ApiError {
  const data = isRecord(payload) ? payload : {};
  const responseMessage =
    typeof data.message === 'string' ? data.message : undefined;

  let code: ApiErrorCode = isApiErrorCode(data.code) ? data.code : 'UNKNOWN';

  if (code === 'UNKNOWN') {
    if (
      status === 409 &&
      responseMessage !== undefined &&
      CAPACITY_MESSAGE_PATTERN.test(responseMessage)
    ) {
      code = 'CAPACIDAD_AGOTADA';
    } else if (
      status === 403 &&
      responseMessage === API_ERROR_MESSAGES.RESTRICCION_CUSTODIA
    ) {
      code = 'RESTRICCION_CUSTODIA';
    } else if (
      status === 400 &&
      responseMessage === API_ERROR_MESSAGES.ANTICIPACION_INSUFICIENTE
    ) {
      code = 'ANTICIPACION_INSUFICIENTE';
    } else if (
      status === 400 &&
      responseMessage === API_ERROR_MESSAGES.VIAJE_DATOS_INCOMPLETOS
    ) {
      code = 'VIAJE_DATOS_INCOMPLETOS';
    } else if (
      status === 400 &&
      responseMessage === API_ERROR_MESSAGES.IDEMPOTENCIA_REQUERIDA
    ) {
      code = 'IDEMPOTENCIA_REQUERIDA';
    } else if (status === 401) {
      code =
        responseMessage === API_ERROR_MESSAGES.mfa_invalid
          ? 'mfa_invalid'
          : 'auth_failed';
    } else if (status === 403) {
      code = 'role_not_allowed';
    } else if (status === 404) {
      code = 'RECURSO_NO_ENCONTRADO';
    } else if (status === 429) {
      code = 'rate_limited';
    } else if (status === 400 || status === 422) {
      code = 'VALIDATION_ERROR';
    }
  }

  const isOfficialCapacityMessage =
    code === 'CAPACIDAD_AGOTADA' &&
    responseMessage !== undefined &&
    CAPACITY_MESSAGE_PATTERN.test(responseMessage);
  const message = isOfficialCapacityMessage
    ? responseMessage
    : API_ERROR_MESSAGES[code];
  const correlationId =
    typeof data.correlationId === 'string' ? data.correlationId : undefined;

  return new ApiError(status, code, message, correlationId);
}
