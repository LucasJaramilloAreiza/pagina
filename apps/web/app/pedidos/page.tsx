import { PrismaClient, TransactionType, TransactionReason } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function createOrderAction(formData: FormData) {
  'use server';

  const customerId = formData.get('customerId')?.toString() ?? '';
  // Mantenemos el 'name' del input como productId, pero lo mapeamos a itemId
  const itemId = formData.get('productId')?.toString() ?? ''; 
  const quantity = Number(formData.get('quantity') ?? 0);

  if (!customerId || !itemId || !quantity) {
    redirect('/pedidos?status=invalid');
  }

  let errorMessage: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });

      if (!item) {
        throw new Error('Producto no encontrado en el inventario.');
      }

      if (item.stock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${item.stock}`);
      }

      const unitPrice = 12900;
      const total = unitPrice * quantity;

      const order = await tx.order.create({
        data: {
          orderNumber: `PO-${Date.now()}`,
          customerId,
          status: 'PENDING',
          total,
          currency: 'USD',
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          itemId: item.id,
          quantity,
          unitPrice,
          total,
        },
      });

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: item.stock - quantity },
      });

      await tx.inventoryTransaction.create({
        data: {
          itemId: item.id,
          type: TransactionType.OUT,
          quantity,
          reason: TransactionReason.SALE,
          referenceId: order.id,
        },
      });
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'No se pudo crear el pedido.';
  }

  if (errorMessage) {
    redirect(`/pedidos?status=error&message=${encodeURIComponent(errorMessage)}`);
  }

  redirect('/pedidos?status=success');
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  // Filtramos el inventario trayendo SÓLO productos terminados
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventoryItem.findMany({ 
      where: { type: 'FINISHED' }, 
      orderBy: { name: 'asc' } 
    }),
  ]);

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 text-green-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-green-200 bg-white p-5 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Pedidos & Aromas</p>
          <h1 className="mt-2 text-2xl font-semibold text-green-900">Gestión de pedidos jaboneros</h1>
          <p className="mt-2 text-sm text-green-700">
            Registra órdenes de pedido y reserva stock para tu línea de jabones naturales.
          </p>
        </header>

        {status === 'success' ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Pedido creado correctamente. El inventario se actualizó y el movimiento quedó registrado.
          </div>
        ) : null}

        {status === 'invalid' ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Completa todos los campos del pedido.
          </div>
        ) : null}

        {status === 'error' && message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <form action={createOrderAction} className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Cliente
              <select name="customerId" className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700" required>
                <option value="" disabled>Selecciona un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Producto Terminado
              <select name="productId" className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700" required>
                <option value="" disabled>Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — Stock: {product.stock} {product.unit}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-green-800">
              Cantidad
              <input name="quantity" type="number" min="1" step="1" placeholder="Ej. 5" className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-base text-green-900 outline-none focus:border-green-700" required />
            </label>

            <button type="submit" className="rounded-xl bg-green-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-green-800">
              Crear pedido
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}