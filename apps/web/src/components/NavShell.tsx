import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/produccion', label: 'Producción' },
  { href: '/pedidos', label: 'Pedidos' },
  { href: '/kardex', label: 'Kardex' },
];

export function NavShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-green-50">
      <nav className="border-b border-green-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-lg font-semibold text-green-900">
            Jabonera Natural
          </Link>
          <div className="flex gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-amber-100 hover:text-green-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
