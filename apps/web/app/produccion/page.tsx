import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function saveProduction(formData: FormData) {
  'use server';

  const machine = formData.get('machine')?.toString() ?? '';
  const rawMaterial = Number(formData.get('rawMaterial') ?? 0);
  const result = Number(formData.get('result') ?? 0);

  if (!machine || !rawMaterial || !result) {
    redirect('/produccion?status=invalid');
  }

  await prisma.productionBatch.create({
    data: {
      machine,
      rawMaterialKg: rawMaterial,
      producedBoxes: result,
    },
  });

  redirect('/produccion?status=success');
}

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 text-green-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-green-200 bg-white p-5 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Producción Jabonera</p>
          <h1 className="mt-2 text-2xl font-semibold text-green-900">Registro ágil de producción jabonera</h1>
          <p className="mt-2 text-sm text-green-700">
            Ficha móvil para capturar lotes, insumos y resultados de jabones artesanales.
          </p>
        </header>

        {status === 'success' ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Lote registrado correctamente. El equipo puede revisar los datos en el dashboard.
          </div>
        ) : null}

        {status === 'invalid' ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Completa todos los campos para guardar el lote.
          </div>
        ) : null}

        <form action={saveProduction} className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Estación jabonera
              <select
                name="machine"
                className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecciona una estación
                </option>
                <option value="Mezcladora 1">Mezcladora 1</option>
                <option value="Mezcladora 2">Mezcladora 2</option>
                <option value="Mezcladora 3">Mezcladora 3</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Insumo jabonero (kg / litros)
              <span className="text-xs text-green-700">Ej. Base de Glicerina, Sosa Cáustica, Esencias Aromáticas o Colorantes Naturales</span>
              <input
                name="rawMaterial"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej. 12.5"
                className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Producción resultante (cajas)
              <input
                name="result"
                type="number"
                min="0"
                step="1"
                placeholder="Ej. 48"
                className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700"
                required
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-green-900 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-800"
            >
              Guardar lote
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
