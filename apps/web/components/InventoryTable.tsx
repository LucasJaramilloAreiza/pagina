"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  price: number;
  category: string | null;
};

type InventoryTableProps = {
  products: Product[];
  createProduct: (formData: FormData) => Promise<void>;
  deleteProduct: (formData: FormData) => Promise<void>;
};

export function InventoryTable({ products, createProduct, deleteProduct }: InventoryTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Inventario</h2>
          <p className="text-sm text-slate-500">Estado de stock por producto</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {products.length} productos
          </span>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Añadir Producto
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Añadir Producto</h3>
                <p className="mt-1 text-sm text-slate-500">Completa los datos para registrar el producto.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <form action={createProduct} className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre del producto</label>
                <input
                  name="name"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">SKU</label>
                <input
                  name="sku"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  defaultValue={0}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  defaultValue={0}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Categoría</label>
                <input
                  name="category"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Guardar producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => {
              const isLow = product.stock < 10;

              return (
                <tr key={product.id} className={isLow ? 'bg-rose-50/60' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category ?? 'Sin categoría'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.sku ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">${product.price.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3">
                    <form action={deleteProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-rose-600"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                          <path d="M3 6h18" />
                          <path d="M8 6v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6" />
                          <path d="M10 10v6" />
                          <path d="M14 10v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
