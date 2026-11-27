import { ApiError } from '@camino/contracts/http';
import {
  canAccessMobileApp,
  type MobileAppRole,
  type StudentRole,
} from '@camino/domain';
import type { LoginCredentials } from '@camino/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

export type LoginValidationResult =
  { valid: true; normalizedEmail: string } | { valid: false; message: string };

export type ProvisionalLoginOutcome =
  | {
      status: 'mfa_required';
      role: StudentRole;
      maskedDestination: string;
    }
  | {
      status: 'role_blocked';
      detectedRole: StudentRole;
      error: ApiError;
    }
  | {
      status: 'error';
      error: ApiError;
    };

export type ProvisionalOtpOutcome =
  { status: 'authenticated' } | { status: 'error'; error: ApiError };

export interface AuthFlowGateway {
  submitLogin(credentials: LoginCredentials): Promise<ProvisionalLoginOutcome>;
  verifyOtp(code: string): Promise<ProvisionalOtpOutcome>;
}

export function validateLoginCredentials(
  credentials: LoginCredentials,
): LoginValidationResult {
  const normalizedEmail = credentials.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      valid: false,
      message: 'Ingresa un correo electrónico válido.',
    };
  }
  if (credentials.password.length < 8) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 8 caracteres.',
    };
  }
  return { valid: true, normalizedEmail };
}

export function validateEmailAddress(email: string): LoginValidationResult {
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      valid: false,
      message: 'Ingresa un correo electrónico válido.',
    };
  }
  return { valid: true, normalizedEmail };
}

export function maskEmailForChallenge(email: string): string {
  const [localPart = '', domain = ''] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return 'tu correo registrado';
  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
  return `${visiblePrefix}***@${domain}`;
}

// PROVISIONAL: mapea roles de demostración según el correo mientras se integra
// el endpoint real `/api/v1/auth/login` + `/api/v1/auth/verify-otp` (FE-05).
function resolveProvisionalRole(
  normalizedEmail: string,
  defaultRole: MobileAppRole,
): StudentRole {
  if (normalizedEmail.includes('monitora')) return 'MONITORA';
  if (normalizedEmail.includes('acudiente')) return 'ACUDIENTE';
  if (normalizedEmail.includes('coord') || normalizedEmail.includes('admin')) {
    return 'COORDINADORA_CONVIVENCIA';
  }
  if (normalizedEmail.includes('conductor')) return 'CONDUCTOR';
  return defaultRole;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createProvisionalAuthGateway(
  targetApp: MobileAppRole,
): AuthFlowGateway {
  return {
    async submitLogin(credentials) {
      await wait(300);
      const normalizedEmail = credentials.email.trim().toLowerCase();

      if (
        normalizedEmail.startsWith('error@') ||
        credentials.password === 'error1234'
      ) {
        return {
          status: 'error',
          error: new ApiError(401, 'auth_failed'),
        };
      }

      const detectedRole = resolveProvisionalRole(normalizedEmail, targetApp);
      if (!canAccessMobileApp(detectedRole, targetApp)) {
        return {
          status: 'role_blocked',
          detectedRole,
          error: new ApiError(403, 'role_not_allowed'),
        };
      }

      return {
        status: 'mfa_required',
        role: detectedRole,
        maskedDestination: maskEmailForChallenge(normalizedEmail),
      };
    },

    async verifyOtp(code) {
      await wait(250);
      if (!OTP_PATTERN.test(code) || code === '000000') {
        return {
          status: 'error',
          error: new ApiError(401, 'mfa_invalid'),
        };
      }
      return { status: 'authenticated' };
    },
  };
}
