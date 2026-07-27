import { db } from '@/lib/db';
import { customers, products } from '@/lib/db/schema';
import { InventoryTable } from '@/components/InventoryTable';
import { CustomerList } from '@/components/CustomerList';
import { KpiCard } from '@/components/KpiCard';

async function getDashboardData() {
  const [customersList, productsList] = await Promise.all([
    db.select().from(customers).orderBy(customers.created_at, 'desc').limit(6),
    db
      .select({
        id: products.id,
        name: products.name,
        codigo_barras: products.codigo_barras,
        stock: products.in_stock,
        price: products.price,
        category: products.category,
      })
      .from(products)
      .orderBy(products.in_stock, 'asc'),
  ]);

  return { customers: customersList, products: productsList };
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
    <main className="min-h-screen bg-green-50 px-4 py-8 text-green-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-green-200 bg-white p-6 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Panel de Gestión Jabonera</p>
          <h1 className="mt-2 text-3xl font-semibold text-green-900">Dashboard de Inventario Natural</h1>
          <p className="mt-2 max-w-2xl text-sm text-green-700">
            Monitorea clientes, ingredientes y lotes terminados en un dashboard elegante y natural.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Producción Diaria" value={`${dailyProduction} unidades`} detail="Últimas 24 horas" tone="emerald" />
          <KpiCard title="Rendimiento" value={performance} detail="Eficiencia general" tone="amber" />
          <KpiCard title="Pedidos Pendientes" value={`${pendingOrders}`} detail="Listos para procesar" tone="emerald" />
          <KpiCard title="Alerta de Stock" value={alertLevel} detail={`${lowStockCount} insumos bajos`} tone="rose" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-green-600">Clientes activos</p>
            <p className="mt-2 text-2xl font-semibold text-green-900">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-green-600">Ingredientes críticos</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">{lowStockCount}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-lg">
            <p className="text-sm text-green-600">Lotes saludables</p>
            <p className="mt-2 text-2xl font-semibold text-green-800">{healthyStockCount}</p>
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
