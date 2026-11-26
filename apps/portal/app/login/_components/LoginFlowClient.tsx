'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import {
  getAuthAlert,
  loginCredentialsSchema,
  MFA_INVALID_MESSAGE,
  mfaCodeSchema,
  resolveMockCredentialsOutcome,
  resolveMockMfaOutcome,
  ROLE_DENIED_MESSAGE,
  type LoginAlertState,
  type LoginCredentialsValues,
  type LoginDynamicStateId,
  type LoginScreenView,
} from '../login-state';

const EMPTY_OTP: string[] = ['', '', '', '', '', ''];

const STATE_OPTIONS: ReadonlyArray<{ id: LoginDynamicStateId; label: string }> =
  [
    { id: 'login-empty', label: 'Login vacío' },
    { id: 'login-loading', label: 'Login cargando' },
    { id: 'login-error', label: 'Error auth' },
    { id: 'mfa-empty', label: 'MFA vacío' },
    { id: 'mfa-loading', label: 'MFA cargando' },
    { id: 'mfa-error', label: 'MFA inválido' },
    { id: 'mfa-rate-limited', label: 'MFA bloqueado' },
    { id: 'role-not-allowed', label: 'Rol sin acceso' },
    { id: 'forgot-password', label: 'Recuperar clave' },
  ];

export function LoginFlowClient() {
  const [view, setView] = useState<LoginScreenView>('login');
  const [activePreset, setActivePreset] =
    useState<LoginDynamicStateId>('login-empty');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<LoginAlertState | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [mfaAttempts, setMfaAttempts] = useState(0);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [signedInEmail, setSignedInEmail] = useState(
    'coordinacion@colegio.edu.co',
  );

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentialsValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function clearPendingTimer() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function resetToLogin() {
    clearPendingTimer();
    setView('login');
    setActivePreset('login-empty');
    setIsSubmitting(false);
    setAlertState(null);
    setOtpDigits(EMPTY_OTP);
    setOtpError(null);
    setMfaAttempts(0);
    setRecoverySent(false);
    setRecoveryError(null);
    clearErrors();
  }

  function applyDynamicPreset(preset: LoginDynamicStateId) {
    clearPendingTimer();
    setActivePreset(preset);
    setIsSubmitting(false);
    setAlertState(null);
    setOtpError(null);
    setRecoverySent(false);
    setRecoveryError(null);
    clearErrors();

    switch (preset) {
      case 'login-empty':
        setView('login');
        setValue('email', '');
        setValue('password', '');
        break;
      case 'login-loading':
        setView('login');
        setValue('email', 'coordinacion@colegio.edu.co');
        setValue('password', 'Camino2026!');
        setIsSubmitting(true);
        break;
      case 'login-error':
        setView('login');
        setValue('email', 'coordinacion@colegio.edu.co');
        setValue('password', 'error123');
        setAlertState(getAuthAlert('auth_failed'));
        break;
      case 'mfa-empty':
        setView('mfa');
        setOtpDigits(EMPTY_OTP);
        break;
      case 'mfa-loading':
        setView('mfa');
        setOtpDigits(['4', '8', '2', '1', '9', '5']);
        setIsSubmitting(true);
        break;
      case 'mfa-error':
        setView('mfa');
        setOtpDigits(['4', '8', '2', '1', '9', '0']);
        setOtpError(MFA_INVALID_MESSAGE);
        break;
      case 'mfa-rate-limited':
        setView('mfa');
        setOtpDigits(['4', '8', '2', '1', '9', '0']);
        setAlertState(getAuthAlert('rate_limited'));
        break;
      case 'role-not-allowed':
        setView('role_not_allowed');
        break;
      case 'forgot-password':
        setView('forgot_password');
        setRecoveryEmail('');
        break;
    }
  }

  const onSubmitCredentials = handleSubmit((rawValues) => {
    clearPendingTimer();
    clearErrors();
    setAlertState(null);

    const parsed = loginCredentialsSchema.safeParse(rawValues);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'email' || field === 'password') {
          setError(field, { type: 'manual', message: issue.message });
        }
      }
      return;
    }

    setIsSubmitting(true);
    setActivePreset('login-loading');
    setSignedInEmail(parsed.data.email);

    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      const outcome = resolveMockCredentialsOutcome(parsed.data);

      if (outcome === 'auth_failed') {
        setAlertState(getAuthAlert('auth_failed'));
        setActivePreset('login-error');
        return;
      }

      if (outcome === 'role_not_allowed') {
        setView('role_not_allowed');
        setActivePreset('role-not-allowed');
        return;
      }

      setOtpDigits(EMPTY_OTP);
      setOtpError(null);
      setMfaAttempts(0);
      setView('mfa');
      setActivePreset('mfa-empty');
    }, 550);
  });

  function handleOtpChange(index: number, rawValue: string) {
    const cleaned = rawValue.replace(/\D/g, '');
    if (otpError) setOtpError(null);
    if (alertState?.code === 'rate_limited') setAlertState(null);

    if (cleaned.length > 1) {
      const next = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        next[i] = cleaned[i] ?? next[i] ?? '';
      }
      setOtpDigits(next);
      const focusIdx = Math.min(cleaned.length - 1, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);

    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const next = [...otpDigits];
      next[index - 1] = '';
      setOtpDigits(next);
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleSubmitMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearPendingTimer();
    setOtpError(null);
    setAlertState(null);

    const code = otpDigits.join('');
    const parsed = mfaCodeSchema.safeParse({ code });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? MFA_INVALID_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    setActivePreset('mfa-loading');

    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      const outcome = resolveMockMfaOutcome(parsed.data.code, mfaAttempts);

      if (outcome === 'mfa_invalid') {
        setMfaAttempts((prev) => prev + 1);
        setOtpError(MFA_INVALID_MESSAGE);
        setActivePreset('mfa-error');
        return;
      }

      if (outcome === 'rate_limited') {
        setMfaAttempts((prev) => prev + 1);
        setAlertState(getAuthAlert('rate_limited'));
        setActivePreset('mfa-rate-limited');
        return;
      }

      setView('authenticated');
    }, 550);
  }

  function handleForgotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryError(null);
    const parsed = loginCredentialsSchema.shape.email.safeParse(recoveryEmail);
    if (!parsed.success) {
      setRecoveryError(parsed.error.issues[0]?.message ?? 'Correo inválido.');
      return;
    }
    setRecoverySent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-cs-surfaceInput px-4 py-8">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
        <section
          aria-label="Acceso al portal"
          className="w-full max-w-[420px] rounded-cs-card border border-cs-borderSoft bg-cs-surface p-6 sm:p-10"
        >
          {view === 'login' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex w-full flex-col items-center gap-3 text-center">
                <div className="flex w-[160px] flex-col items-center p-4">
                  <Image
                    alt="Camino Seguro"
                    height={116}
                    priority
                    src="/logo-camino-seguro.svg"
                    width={104}
                  />
                </div>
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Iniciar sesión
                </h1>
                <p className="text-[14px] font-normal leading-[20px] text-cs-textMuted">
                  Portal de coordinación
                </p>
              </div>

              {alertState && (
                <div
                  aria-live="assertive"
                  className="flex w-full items-start gap-3 rounded-[16px] border border-cs-criticalBorder bg-cs-criticalBg p-4"
                  role="alert"
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    height={24}
                    src="/icons/triangle-alert.svg"
                    width={24}
                  />
                  <div className="flex flex-col gap-1 text-[14px] leading-[20px] text-cs-criticalText">
                    <p className="font-medium">{alertState.title}</p>
                    <p className="font-normal">{alertState.message}</p>
                  </div>
                </div>
              )}

              <form
                className="flex w-full flex-col gap-4"
                noValidate
                onSubmit={onSubmitCredentials}
              >
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[14px] font-medium leading-[20px] text-cs-textBody"
                    htmlFor="login-email"
                  >
                    Correo electrónico
                  </label>
                  <div className="flex h-12 items-center">
                    <input
                      aria-describedby={
                        errors.email ? 'login-email-error' : undefined
                      }
                      aria-invalid={Boolean(errors.email)}
                      autoComplete="email"
                      className={`h-[45px] w-full rounded-cs-input border bg-cs-surfaceInput px-4 text-[14px] leading-[20px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:opacity-70 ${
                        errors.email
                          ? 'border-cs-criticalText focus:ring-cs-criticalText'
                          : 'border-cs-borderStrong'
                      }`}
                      disabled={isSubmitting}
                      id="login-email"
                      placeholder="nombre@correo.com"
                      type="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p
                      className="text-[13px] leading-[18px] text-cs-criticalText"
                      id="login-email-error"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-[14px] font-medium leading-[20px] text-cs-textBody"
                    htmlFor="login-password"
                  >
                    Contraseña
                  </label>
                  <div className="relative flex h-12 items-center">
                    <input
                      aria-describedby={
                        errors.password ? 'login-password-error' : undefined
                      }
                      aria-invalid={Boolean(errors.password)}
                      autoComplete="current-password"
                      className={`h-[45px] w-full rounded-cs-input border bg-cs-surfaceInput pl-4 pr-12 text-[14px] leading-[20px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:opacity-70 ${
                        errors.password
                          ? 'border-cs-criticalText focus:ring-cs-criticalText'
                          : 'border-cs-borderStrong'
                      }`}
                      disabled={isSubmitting}
                      id="login-password"
                      placeholder="Ingresa tu contraseña"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                    />
                    <button
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      aria-pressed={showPassword}
                      className="absolute right-0 flex h-12 w-12 items-center justify-center rounded-r-cs-input text-cs-textMuted hover:text-cs-textStrong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                      disabled={isSubmitting}
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      <Image
                        alt=""
                        aria-hidden="true"
                        height={24}
                        src="/icons/eye.svg"
                        width={24}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className="text-[13px] leading-[18px] text-cs-criticalText"
                      id="login-password-error"
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    className="text-[14px] font-medium leading-[20px] text-cs-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                    disabled={isSubmitting}
                    onClick={() => applyDynamicPreset('forgot-password')}
                    type="button"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-cs-button bg-cs-primary px-3 text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-cs-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:text-cs-textBody"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />
                  )}
                  <span>
                    {isSubmitting ? 'Verificando…' : 'Iniciar sesión'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {view === 'mfa' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex w-full flex-col items-center gap-3 text-center">
                <div className="flex w-[160px] flex-col items-center p-4">
                  <Image
                    alt="Camino Seguro"
                    height={116}
                    priority
                    src="/logo-camino-seguro.svg"
                    width={104}
                  />
                </div>
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Verificación en dos pasos
                </h1>
                <p className="text-[14px] font-normal leading-[20px] text-cs-textMuted">
                  Ingresa el código de 6 dígitos de tu aplicación de
                  autenticación.
                </p>
              </div>

              {alertState && (
                <div
                  aria-live="assertive"
                  className="flex w-full items-start gap-3 rounded-[16px] border border-cs-criticalBorder bg-cs-criticalBg p-4"
                  role="alert"
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    height={24}
                    src="/icons/triangle-alert.svg"
                    width={24}
                  />
                  <div className="flex flex-col gap-1 text-[14px] leading-[20px] text-cs-criticalText">
                    <p className="font-medium">{alertState.title}</p>
                    <p className="font-normal">{alertState.message}</p>
                  </div>
                </div>
              )}

              <form
                className="flex w-full flex-col gap-4"
                noValidate
                onSubmit={handleSubmitMfa}
              >
                <div className="flex flex-col gap-2">
                  <span
                    className="text-[14px] font-medium leading-[20px] text-cs-textBody"
                    id="mfa-group-label"
                  >
                    Código de verificación
                  </span>
                  <div
                    aria-labelledby="mfa-group-label"
                    className="flex h-12 items-center justify-between gap-2"
                    role="group"
                  >
                    {otpDigits.map((digit, index) => (
                      <input
                        aria-invalid={Boolean(otpError)}
                        aria-label={`Dígito ${index + 1} de 6`}
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        className={`h-[45px] w-12 rounded-cs-input border bg-cs-surfaceInput text-center text-[16px] leading-[24px] text-cs-textBody placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:opacity-70 ${
                          otpError || alertState?.code === 'rate_limited'
                            ? 'border-cs-criticalText focus:ring-cs-criticalText'
                            : 'border-cs-borderStrong'
                        }`}
                        disabled={
                          isSubmitting || alertState?.code === 'rate_limited'
                        }
                        inputMode="numeric"
                        key={index}
                        maxLength={6}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        placeholder="—"
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        value={digit}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p
                      className="text-[13px] leading-[18px] text-cs-criticalText"
                      role="alert"
                    >
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-cs-button bg-cs-primary px-3 text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-cs-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-cs-disabledBg disabled:text-cs-textBody"
                  disabled={isSubmitting || alertState?.code === 'rate_limited'}
                  type="submit"
                >
                  {isSubmitting && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />
                  )}
                  <span>
                    {isSubmitting ? 'Verificando código…' : 'Verificar código'}
                  </span>
                </button>

                <button
                  className="flex h-12 w-full items-center justify-center rounded-cs-button bg-cs-surface px-3 text-[14px] font-medium leading-[20px] text-cs-primary hover:bg-cs-surfaceInput focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                  onClick={resetToLogin}
                  type="button"
                >
                  Volver a iniciar sesión
                </button>
              </form>
            </div>
          )}

          {view === 'role_not_allowed' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-cs-criticalBorder bg-cs-criticalBg">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={24}
                  src="/icons/lock-keyhole.svg"
                  width={24}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Acceso no permitido
                </h1>
                <p className="text-[16px] font-normal leading-[24px] text-cs-textBody">
                  {ROLE_DENIED_MESSAGE}
                </p>
              </div>
              <button
                className="flex h-12 w-full items-center justify-center rounded-cs-button bg-cs-primary px-3 text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-cs-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary focus-visible:ring-offset-2"
                onClick={resetToLogin}
                type="button"
              >
                Volver a iniciar sesión
              </button>
            </div>
          )}

          {view === 'forgot_password' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex w-full flex-col items-center gap-3 text-center">
                <div className="flex w-[160px] flex-col items-center p-4">
                  <Image
                    alt="Camino Seguro"
                    height={116}
                    priority
                    src="/logo-camino-seguro.svg"
                    width={104}
                  />
                </div>
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Recuperar contraseña
                </h1>
                <p className="text-[14px] font-normal leading-[20px] text-cs-textMuted">
                  Ingresa tu correo institucional para solicitar el
                  restablecimiento al equipo de soporte o backend.
                </p>
              </div>

              {recoverySent ? (
                <div
                  aria-live="polite"
                  className="w-full rounded-[16px] border border-cs-successBorder bg-cs-successBg p-4 text-[14px] leading-[20px] text-cs-successText"
                >
                  <p className="font-medium">Solicitud registrada</p>
                  <p className="mt-1">
                    Si el correo existe en la institución, recibirás
                    instrucciones para restablecer tu acceso.
                  </p>
                </div>
              ) : (
                <form
                  className="flex w-full flex-col gap-4"
                  noValidate
                  onSubmit={handleForgotSubmit}
                >
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-[14px] font-medium leading-[20px] text-cs-textBody"
                      htmlFor="recovery-email"
                    >
                      Correo electrónico
                    </label>
                    <input
                      aria-invalid={Boolean(recoveryError)}
                      className={`h-[45px] w-full rounded-cs-input border bg-cs-surfaceInput px-4 text-[14px] leading-[20px] text-cs-textStrong placeholder:text-cs-textMuted focus:outline-none focus:ring-2 focus:ring-cs-primary ${
                        recoveryError
                          ? 'border-cs-criticalText focus:ring-cs-criticalText'
                          : 'border-cs-borderStrong'
                      }`}
                      id="recovery-email"
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        if (recoveryError) setRecoveryError(null);
                      }}
                      placeholder="nombre@correo.com"
                      type="email"
                      value={recoveryEmail}
                    />
                    {recoveryError && (
                      <p
                        className="text-[13px] leading-[18px] text-cs-criticalText"
                        role="alert"
                      >
                        {recoveryError}
                      </p>
                    )}
                  </div>
                  <button
                    className="flex h-12 w-full items-center justify-center rounded-cs-button bg-cs-primary px-3 text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-cs-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                    type="submit"
                  >
                    Enviar enlace de recuperación
                  </button>
                </form>
              )}

              <button
                className="flex h-12 w-full items-center justify-center rounded-cs-button bg-cs-surface px-3 text-[14px] font-medium leading-[20px] text-cs-primary hover:bg-cs-surfaceInput focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                onClick={resetToLogin}
                type="button"
              >
                Volver a iniciar sesión
              </button>
            </div>
          )}

          {view === 'authenticated' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-cs-successBorder bg-cs-successBg text-[24px] font-bold text-cs-successText">
                ✓
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-[24px] font-bold leading-[32px] text-cs-textStrong">
                  Verificación completada
                </h1>
                <p className="text-[14px] font-normal leading-[20px] text-cs-textMuted">
                  Vista previa de flujo completado para{' '}
                  <span className="font-medium text-cs-textStrong">
                    {signedInEmail}
                  </span>
                  . La redirección por rol queda sujeta a la integración de
                  sesión por cookies httpOnly.
                </p>
              </div>
              <button
                className="flex h-12 w-full items-center justify-center rounded-cs-button bg-cs-primary px-3 text-[16px] font-semibold leading-[24px] text-white transition-colors hover:bg-cs-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary"
                onClick={resetToLogin}
                type="button"
              >
                Volver a iniciar sesión
              </button>
            </div>
          )}
        </section>

        {/* Selector discreto para inspeccionar todos los estados dinámicos del diseño */}
        <nav
          aria-label="Estados dinámicos de la interfaz de acceso"
          className="flex max-w-[680px] flex-wrap items-center justify-center gap-2 rounded-cs-card border border-cs-borderSoft bg-cs-surface px-4 py-3"
        >
          <span className="mr-1 text-[12px] font-medium text-cs-textMuted">
            Estados:
          </span>
          {STATE_OPTIONS.map((option) => {
            const isSelected =
              activePreset === option.id && view !== 'authenticated';
            return (
              <button
                aria-pressed={isSelected}
                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-primary ${
                  isSelected
                    ? 'border-cs-primary bg-cs-infoBg text-cs-navy'
                    : 'border-cs-borderSoft bg-cs-surfaceInput text-cs-textBody hover:border-cs-borderStrong'
                }`}
                key={option.id}
                onClick={() => applyDynamicPreset(option.id)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </nav>
      </div>

      <footer className="mt-6 w-full text-center text-[13px] font-normal leading-[18px] text-cs-textMuted">
        Tu tranquilidad empieza aquí
      </footer>
    </main>
  );
}
