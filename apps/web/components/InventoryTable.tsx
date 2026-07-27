type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category?: { name: string } | null;
};

type InventoryTableProps = {
  products: Product[];
};

export function InventoryTable({ products }: InventoryTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventario</h2>
          <p className="text-sm text-slate-500">Estado de stock por producto</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {products.length} productos
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => {
              const isLow = product.stock < 10;
              const isHealthy = product.stock >= 10;

              return (
                <tr key={product.id} className={isLow ? 'bg-rose-50/60' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category?.name ?? 'Sin categoría'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.sku}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">${product.price.toLocaleString('es-CL')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
