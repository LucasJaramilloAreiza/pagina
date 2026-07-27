import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

async function createOrderAction(formData: FormData) {
  'use server';

  const customerId = formData.get('customerId')?.toString() ?? '';
  const productId = formData.get('productId')?.toString() ?? '';
  const quantity = Number(formData.get('quantity') ?? 0);

  if (!customerId || !productId || !quantity) {
    redirect('/pedidos?status=invalid');
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        throw new Error('Producto no encontrado.');
      }

      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      const order = await tx.order.create({
        data: {
          orderNumber: `PO-${Date.now()}`,
          customerId,
          status: 'PENDING',
          total: product.price * quantity,
          currency: 'USD',
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - quantity },
      });
    });

    redirect('/pedidos?status=success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el pedido.';
    redirect(`/pedidos?status=error&message=${encodeURIComponent(message)}`);
  }
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;
  const message = params?.message;

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Logística</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Crear pedido</h1>
          <p className="mt-2 text-sm text-slate-600">
            Registra órdenes de pedido y reserva automáticamente el stock disponible.
          </p>
        </header>

        {status === 'success' ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Pedido creado correctamente y el inventario fue actualizado.
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

        <form action={createOrderAction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Cliente
              <select name="customerId" className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500" required>
                <option value="" disabled>Selecciona un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Producto
              <select name="productId" className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500" required>
                <option value="" disabled>Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — Stock: {product.stock}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Cantidad
              <input name="quantity" type="number" min="1" step="1" placeholder="Ej. 5" className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500" required />
            </label>

            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700">
              Crear pedido
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
