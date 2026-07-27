type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
};

type CustomerListProps = {
  customers: Customer[];
};

export function CustomerList({ customers }: CustomerListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clientes</h2>
          <p className="text-sm text-slate-500">Principales cuentas empresariales</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {customers.length} contactos
        </span>
      </div>

      <div className="space-y-3">
        {customers.map((customer) => (
          <article key={customer.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{customer.email ?? 'Sin correo'}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {customer.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{customer.phone ?? 'Sin teléfono'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
