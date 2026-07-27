type KpiCardProps = {
  title: string;
  value: string;
  detail: string;
  tone?: 'default' | 'rose' | 'emerald' | 'blue';
};

const toneStyles = {
  default: 'border-slate-200 bg-white text-slate-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function KpiCard({ title, value, detail, tone = 'default' }: KpiCardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone]}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
