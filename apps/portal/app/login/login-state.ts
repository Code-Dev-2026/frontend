import { API_ERROR_MESSAGES, type ApiErrorCode } from '@camino/contracts/http';
import { z } from 'zod';

export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('Ingresa un correo electrónico válido.'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña.')
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export type LoginCredentialsValues = z.infer<typeof loginCredentialsSchema>;

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'Ingresa el código TOTP completo de 6 dígitos.'),
});

export type MfaCodeValues = z.infer<typeof mfaCodeSchema>;

export type LoginScreenView =
  'login' | 'mfa' | 'role_not_allowed' | 'forgot_password' | 'authenticated';

export type LoginDynamicStateId =
  | 'login-empty'
  | 'login-loading'
  | 'login-error'
  | 'mfa-empty'
  | 'mfa-loading'
  | 'mfa-error'
  | 'mfa-rate-limited'
  | 'role-not-allowed'
  | 'forgot-password';

export interface LoginAlertState {
  code: ApiErrorCode;
  title: string;
  message: string;
}

export function getAuthAlert(code: ApiErrorCode): LoginAlertState {
  switch (code) {
    case 'auth_failed':
      return {
        code,
        title: 'Error al iniciar sesión',
        message: API_ERROR_MESSAGES.auth_failed,
      };
    case 'rate_limited':
      return {
        code,
        title: 'Límite de intentos',
        message: API_ERROR_MESSAGES.rate_limited,
      };
    case 'mfa_invalid':
      return {
        code,
        title: 'Código inválido',
        message: API_ERROR_MESSAGES.mfa_invalid,
      };
    case 'role_not_allowed':
      return {
        code,
        title: 'Acceso no permitido',
        message: API_ERROR_MESSAGES.role_not_allowed,
      };
    default:
      return {
        code,
        title: 'No fue posible continuar',
        message: API_ERROR_MESSAGES.UNKNOWN,
      };
  }
}

export const ROLE_DENIED_MESSAGE = API_ERROR_MESSAGES.role_not_allowed;
export const MFA_INVALID_MESSAGE = API_ERROR_MESSAGES.mfa_invalid;

/**
 * Simulación local provisional de resultados de acceso mientras se alinea el
 * contrato de cookies httpOnly (ver decisión abierta en AGENTS.md).
 */
export function resolveMockCredentialsOutcome(
  values: LoginCredentialsValues,
): 'mfa' | 'auth_failed' | 'role_not_allowed' {
  const normalizedEmail = values.email.trim().toLowerCase();

  if (
    normalizedEmail.includes('acudiente') ||
    normalizedEmail.includes('monitora') ||
    normalizedEmail.includes('bloqueado')
  ) {
    return 'role_not_allowed';
  }

  if (normalizedEmail.includes('error') || values.password === 'error123') {
    return 'auth_failed';
  }

  return 'mfa';
}

export function resolveMockMfaOutcome(
  code: string,
  previousAttempts: number,
): 'authenticated' | 'mfa_invalid' | 'rate_limited' {
  if (code === '000000' || code === '482190') {
    return previousAttempts + 1 >= 3 ? 'rate_limited' : 'mfa_invalid';
  }

  return 'authenticated';
}
