import Link from 'next/link';
import { NavShell } from '@/components/NavShell';

export default function Home() {
  return (
    <NavShell>
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col px-4 py-12 sm:px-6 lg:px-8 bg-green-50">
        <section className="flex flex-1 flex-col justify-center gap-10 text-green-900">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Artesanía Jabonera Natural
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Portal de Gestión de Jabones & Aromas
            </h1>
            <p className="text-xl leading-8 text-green-800">
              Administra inventario natural, producción artesanal y pedidos con una experiencia elegante y orgánica.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-green-900 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-800 sm:w-auto"
              >
                Ir al Dashboard
              </Link>
              <Link
                href="/produccion"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-green-700 bg-amber-50 px-6 py-3 text-base font-semibold text-green-900 shadow-lg transition hover:bg-amber-100 sm:w-auto"
              >
                Ver Producción
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/dashboard"
              className="group rounded-2xl border border-green-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-green-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-900 text-white">
                <span className="text-xl font-semibold">CRM</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-green-900">Dashboard de Inventario Natural</h2>
              <p className="mt-3 text-sm leading-6 text-green-700">
                Supervisa clientes, existencias y aromas desde un panel cálido y orgánico.
              </p>
            </Link>

            <Link
              href="/produccion"
              className="group rounded-2xl border border-green-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-green-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-green-900">
                <span className="text-xl font-semibold">PRO</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-green-900">Módulo de Producción</h2>
              <p className="mt-3 text-sm leading-6 text-green-700">
                Registra lotes de jabón, esencias y procesos artesanales con enfoque mobile-first.
              </p>
            </Link>

            <Link
              href="/pedidos"
              className="group rounded-2xl border border-green-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-green-300"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-900 text-white">
                <span className="text-xl font-semibold">PED</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-green-900">Gestión de Pedidos & Aromas</h2>
              <p className="mt-3 text-sm leading-6 text-green-700">
                Crea pedidos, reserva ingredientes y coordina envíos para tu línea de jabones.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </NavShell>
  );
}
