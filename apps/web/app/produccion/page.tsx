import { PrismaClient, TransactionType, TransactionReason } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function saveProduction(formData: FormData) {
  'use server';

  const stationId = formData.get('stationId')?.toString() ?? '';
  const rawMaterialId = formData.get('rawMaterialId')?.toString() ?? '';
  const rawMaterialQuantity = Number(formData.get('rawMaterialQuantity') ?? 0);
  const finishedProductId = formData.get('finishedProductId')?.toString() ?? '';
  const finishedProductQuantity = Number(formData.get('finishedProductQuantity') ?? 0);

  if (!stationId || !rawMaterialId || !rawMaterialQuantity || !finishedProductId || !finishedProductQuantity) {
    redirect('/produccion?status=invalid');
  }

  let errorMessage: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const rawMaterial = await tx.inventoryItem.findUnique({ where: { id: rawMaterialId } });
      if (!rawMaterial) throw new Error('Insumo no encontrado');
      if (rawMaterial.stock < rawMaterialQuantity) {
        throw new Error(`Stock insuficiente de ${rawMaterial.name}. Hay ${rawMaterial.stock}${rawMaterial.unit}`);
      }

      const finishedProduct = await tx.inventoryItem.findUnique({ where: { id: finishedProductId } });
      if (!finishedProduct) throw new Error('Producto final no encontrado');

      const batch = await tx.productionBatch.create({
        data: {
          stationId,
          status: 'COMPLETED',
        },
      });

      await tx.batchInput.create({
        data: {
          batchId: batch.id,
          itemId: rawMaterial.id,
          quantity: rawMaterialQuantity,
        },
      });

      await tx.batchOutput.create({
        data: {
          batchId: batch.id,
          itemId: finishedProduct.id,
          quantity: finishedProductQuantity,
        },
      });

      await tx.inventoryItem.update({
        where: { id: rawMaterial.id },
        data: { stock: rawMaterial.stock - rawMaterialQuantity },
      });
      await tx.inventoryItem.update({
        where: { id: finishedProduct.id },
        data: { stock: finishedProduct.stock + finishedProductQuantity },
      });

      await tx.inventoryTransaction.create({
        data: {
          itemId: rawMaterial.id,
          type: TransactionType.OUT,
          quantity: rawMaterialQuantity,
          reason: TransactionReason.PRODUCTION_CONSUMPTION,
          referenceId: batch.id,
        },
      });
      await tx.inventoryTransaction.create({
        data: {
          itemId: finishedProduct.id,
          type: TransactionType.IN,
          quantity: finishedProductQuantity,
          reason: TransactionReason.PRODUCTION_YIELD,
          referenceId: batch.id,
        },
      });
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el lote.';
  }

  if (errorMessage) {
    redirect(`/produccion?status=error&message=${encodeURIComponent(errorMessage)}`);
  }

  redirect('/produccion?status=success');
}

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  // Cargar datos dinámicos de la base de datos para los selectores
  const [stations, rawMaterials, finishedProducts] = await Promise.all([
    prisma.productionStation.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventoryItem.findMany({ where: { type: 'RAW_MATERIAL' }, orderBy: { name: 'asc' } }),
    prisma.inventoryItem.findMany({ where: { type: 'FINISHED' }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 text-green-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-green-200 bg-white p-5 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Producción Jabonera</p>
          <h1 className="mt-2 text-2xl font-semibold text-green-900">Registro ágil de producción jabonera</h1>
          <p className="mt-2 text-sm text-green-700">
            Ficha móvil para capturar lotes, descontar insumos y sumar resultados al inventario de jabones.
          </p>
        </header>

        {status === 'success' ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Lote registrado correctamente. Los insumos se descontaron y el producto se sumó al inventario.
          </div>
        ) : null}

        {status === 'invalid' ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Completa todos los campos para guardar el lote.
          </div>
        ) : null}

        {status === 'error' && message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <form action={saveProduction} className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg sm:p-6">
          <div className="flex flex-col gap-5">
            
            {/* 1. SELECCIÓN DE ESTACIÓN */}
            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Estación jabonera
              <select name="stationId" className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700" required defaultValue="">
                <option value="" disabled>Selecciona una estación</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-rose-100 bg-rose-50 p-4">
              {/* 2. INSUMO GASTADO */}
              <label className="flex flex-col gap-2 text-sm font-medium text-rose-800">
                Insumo Utilizado (Resta stock)
                <select name="rawMaterialId" className="rounded-xl border border-rose-300 bg-white px-4 py-3 text-base text-rose-900 outline-none focus:border-rose-700" required defaultValue="">
                  <option value="" disabled>Selecciona materia prima</option>
                  {rawMaterials.map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.name} (Disp: {mat.stock}{mat.unit})</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-rose-800">
                Cantidad gastada
                <input name="rawMaterialQuantity" type="number" min="0.1" step="0.1" placeholder="Ej. 5.5" className="rounded-xl border border-rose-300 bg-white px-4 py-3 text-base text-rose-900 outline-none focus:border-rose-700" required />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              {/* 3. PRODUCTO CREADO */}
              <label className="flex flex-col gap-2 text-sm font-medium text-emerald-800">
                Producto Resultante (Suma stock)
                <select name="finishedProductId" className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-base text-emerald-900 outline-none focus:border-emerald-700" required defaultValue="">
                  <option value="" disabled>Selecciona producto terminado</option>
                  {finishedProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-emerald-800">
                Cantidad producida
                <input name="finishedProductQuantity" type="number" min="1" step="1" placeholder="Ej. 100" className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-base text-emerald-900 outline-none focus:border-emerald-700" required />
              </label>
            </div>

            <button type="submit" className="mt-2 rounded-xl bg-green-900 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-green-800">
              Guardar lote y actualizar inventario
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}