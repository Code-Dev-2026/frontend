export default function HealthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-8 py-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Health</p>
        <h1 className="mt-2 text-2xl font-bold text-emerald-900">Portal OK</h1>
        <p className="mt-2 text-sm text-emerald-800">El frontend está listo para validación del backend.</p>
      </div>
    </main>
  );
}
