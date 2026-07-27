import Link from 'next/link';
import { NavShell } from '@/components/NavShell';

export default function Home() {
  return (
    <NavShell>
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col px-4 py-12 sm:px-6 lg:px-8">
        <section className="flex flex-1 flex-col justify-center gap-10 text-slate-900">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">
              ERP/CRM Industrial
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Punto de entrada para operaciones, inventario y planta.
            </h1>
            <p className="text-xl leading-8 text-slate-600">
              Plataforma web moderna para gestión de inventario, producción móvil y logística transaccional.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700 sm:w-auto"
              >
                Ir al Dashboard
              </Link>
              <Link
                href="/produccion"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-300 sm:w-auto"
              >
                Ver Producción
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/dashboard"
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <span className="text-xl font-semibold">CRM</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">Tablero CRM & Inventario</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Controla clientes, productos y stock desde un panel centralizado.
              </p>
            </Link>

            <Link
              href="/produccion"
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <span className="text-xl font-semibold">PRO</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">Módulo de Producción</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Registra lotes, procesos y datos de planta con enfoque mobile-first.
              </p>
            </Link>

            <Link
              href="/pedidos"
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <span className="text-xl font-semibold">LOG</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">Gestión de Pedidos & Logística</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Crea órdenes, reserva stock y coordina envíos desde un solo flujo.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </NavShell>
  );
}
