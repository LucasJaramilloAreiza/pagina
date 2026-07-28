import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

// Diccionario opcional para traducir los motivos a un español amigable en la tabla
const REASON_TRANSLATIONS: Record<string, string> = {
  SALE: 'Venta',
  PRODUCTION_CONSUMPTION: 'Consumo (Producción)',
  PRODUCTION_YIELD: 'Producción (Lote)',
  MANUAL_ADJUSTMENT: 'Ajuste Manual',
  PURCHASE: 'Compra / Abastecimiento'
};

export default async function KardexPage() {
  // Consultar todas las transacciones ordenadas de la más reciente a la más antigua
  const transactions = await prisma.inventoryTransaction.findMany({
    include: { 
      item: true 
    },
    orderBy: { 
      createdAt: 'desc' 
    },
  });

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6 text-green-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        
        {/* Cabecera idéntica a las otras páginas para mantener el diseño UI */}
        <header className="rounded-2xl border border-green-200 bg-white p-5 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Auditoría</p>
          <h1 className="mt-2 text-2xl font-semibold text-green-900">Kardex de Inventario</h1>
          <p className="mt-2 text-sm text-green-700">
            Historial general de movimientos, entradas y salidas de materias primas y productos terminados.
          </p>
        </header>

        {/* Contenedor de la Tabla */}
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-green-900">
              <thead className="bg-green-100 text-xs uppercase text-green-800">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Fecha y Hora</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Ítem</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Motivo</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-green-600">
                      No hay registros de movimientos en el inventario.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isEntry = tx.type === TransactionType.IN;
                    const dateFormatted = new Intl.DateTimeFormat('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }).format(new Date(tx.createdAt));

                    return (
                      <tr key={tx.id} className="hover:bg-green-50/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-green-700">
                          {dateFormatted}
                        </td>
                        <td className="px-6 py-4 font-medium text-green-900">
                          {tx.item.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isEntry ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isEntry ? 'Entrada' : 'Salida'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-green-700">
                          {REASON_TRANSLATIONS[tx.reason] || tx.reason}
                        </td>
                        <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${
                          isEntry ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isEntry ? '+' : '-'}{tx.quantity} {tx.item.unit}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}