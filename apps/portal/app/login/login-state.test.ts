import { API_ERROR_MESSAGES } from '@camino/contracts/http';
import { describe, expect, it } from 'vitest';
import {
  getAuthAlert,
  loginCredentialsSchema,
  mfaCodeSchema,
  resolveMockCredentialsOutcome,
  resolveMockMfaOutcome,
} from './login-state';

describe('Portal Login UI — validación y estados dinámicos', () => {
  it('valida correo electrónico y contraseña con Zod', () => {
    const empty = loginCredentialsSchema.safeParse({ email: '', password: '' });
    expect(empty.success).toBe(false);

    const badEmail = loginCredentialsSchema.safeParse({
      email: 'correo-invalido',
      password: 'Password123',
    });
    expect(badEmail.success).toBe(false);

    const valid = loginCredentialsSchema.safeParse({
      email: 'coordinacion@colegio.edu.co',
      password: 'Password123',
    });
    expect(valid.success).toBe(true);
  });

  it('valida el código TOTP de 6 dígitos', () => {
    expect(mfaCodeSchema.safeParse({ code: '12345' }).success).toBe(false);
    expect(mfaCodeSchema.safeParse({ code: '12345a' }).success).toBe(false);
    expect(mfaCodeSchema.safeParse({ code: '123456' }).success).toBe(true);
  });

  it('usa mensajes del catálogo @camino/contracts/http en las alertas de acceso', () => {
    expect(getAuthAlert('auth_failed').message).toBe(
      API_ERROR_MESSAGES.auth_failed,
    );
    expect(getAuthAlert('mfa_invalid').message).toBe(
      API_ERROR_MESSAGES.mfa_invalid,
    );
    expect(getAuthAlert('rate_limited').message).toBe(
      API_ERROR_MESSAGES.rate_limited,
    );
    expect(getAuthAlert('role_not_allowed').message).toBe(
      API_ERROR_MESSAGES.role_not_allowed,
    );
  });

  it('resuelve transiciones dinámicas de credenciales y MFA hacia error, bloqueo o acceso denegado', () => {
    expect(
      resolveMockCredentialsOutcome({
        email: 'acudiente@correo.com',
        password: 'Password123',
      }),
    ).toBe('role_not_allowed');
    expect(
      resolveMockCredentialsOutcome({
        email: 'usuario@correo.com',
        password: 'error123',
      }),
    ).toBe('auth_failed');
    expect(
      resolveMockCredentialsOutcome({
        email: 'coordinacion@colegio.edu.co',
        password: 'Password123',
      }),
    ).toBe('mfa');

    expect(resolveMockMfaOutcome('482190', 0)).toBe('mfa_invalid');
    expect(resolveMockMfaOutcome('482190', 2)).toBe('rate_limited');
    expect(resolveMockMfaOutcome('123456', 0)).toBe('authenticated');
  });
});
