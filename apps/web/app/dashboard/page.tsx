import { PrismaClient } from '@prisma/client';
import { InventoryTable } from '@/components/InventoryTable';
import { CustomerList } from '@/components/CustomerList';
import { KpiCard } from '@/components/KpiCard';

const prisma = new PrismaClient();

async function getDashboardData() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.product.findMany({
      orderBy: { stock: 'asc' },
      include: { category: true },
    }),
  ]);

  return { customers, products };
}

export default async function DashboardPage() {
  const { customers, products } = await getDashboardData();

  const lowStockCount = products.filter((product) => product.stock < 10).length;
  const healthyStockCount = products.filter((product) => product.stock >= 10).length;
  const dailyProduction = 148;
  const performance = '92%';
  const pendingOrders = 7;
  const alertLevel = 'Moderado';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Panel de control</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">CRM e inventario</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Vista ejecutiva para supervisar clientes clave y el estado del inventario industrial.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Producción Diaria" value={`${dailyProduction} cajas`} detail="Últimas 24 horas" tone="blue" />
          <KpiCard title="Rendimiento por Hora" value={performance} detail="Eficiencia general" tone="emerald" />
          <KpiCard title="Pedidos Pendientes" value={`${pendingOrders}`} detail="En seguimiento" tone="default" />
          <KpiCard title="Nivel de Alerta de Inventario" value={alertLevel} detail={`${lowStockCount} productos bajo stock`} tone="rose" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Clientes activos</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Productos con stock bajo</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">{lowStockCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Inventario saludable</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{healthyStockCount}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <InventoryTable products={products} />
          <CustomerList customers={customers} />
        </section>
      </div>
    </main>
  );
}
