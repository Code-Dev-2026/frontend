export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Acceso
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Este es un placeholder seguro; el auth real se integra con el backend.
        </p>
        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            Usuario
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            Contraseña
          </div>
          <button className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white">
            Continuar
          </button>
        </div>
      </section>
    </main>
  );
}
