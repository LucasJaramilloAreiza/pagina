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
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Producción</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Registro rápido de lote</h1>
          <p className="mt-2 text-sm text-slate-600">
            Formulario pensado para tablets y celulares, para reemplazar el registro en papel en planta.
          </p>
        </header>

        {status === 'success' ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Lote registrado correctamente. El gerente podrá ver la información en el tablero.
          </div>
        ) : null}

        {status === 'invalid' ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Completa todos los campos para guardar el lote.
          </div>
        ) : null}

        <form action={saveProduction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Máquina
              <select
                name="machine"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecciona una máquina
                </option>
                <option value="Línea 1">Línea 1</option>
                <option value="Línea 2">Línea 2</option>
                <option value="Línea 3">Línea 3</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Materia Prima (kg)
              <input
                name="rawMaterial"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej. 120"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Producto Resultante (cajas)
              <input
                name="result"
                type="number"
                min="0"
                step="1"
                placeholder="Ej. 48"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500"
                required
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
            >
              Guardar lote
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
