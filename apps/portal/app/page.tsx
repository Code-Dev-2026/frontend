export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Camino Seguro</h1>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">Operación</span>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {['Estudiantes y rutas', 'Custodia', 'Telemetría'].map((title) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Módulo</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-3 text-sm text-slate-600">Esqueleto del frontend con documentación de módulo y estructura de trabajo.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
