'use client';

import { useState } from 'react';
import { ApiError } from '@camino/contracts/http';
import { schoolsControllerGetSanBenito } from '../../src/lib/api';

export default function HealthPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState<string>();

  async function checkApi() {
    setStatus('checking');
    setMessage(undefined);

    try {
      await schoolsControllerGetSanBenito();
      setStatus('ok');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof ApiError
          ? error.message
          : 'No fue posible verificar la API.',
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-8 py-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Integración
        </p>
        <h1 className="mt-2 text-2xl font-bold text-emerald-900">
          Backend Camino Seguro
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          Prueba de integración con el cliente OpenAPI tipado.
        </p>
        <button
          className="mt-5 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={status === 'checking'}
          onClick={checkApi}
          type="button"
        >
          {status === 'checking' ? 'Verificando…' : 'Verificar backend'}
        </button>
        {status === 'ok' && (
          <p aria-live="polite" className="mt-3 text-sm text-emerald-800">
            Backend disponible.
          </p>
        )}
        {status === 'error' && (
          <p aria-live="polite" className="mt-3 text-sm text-red-700">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
