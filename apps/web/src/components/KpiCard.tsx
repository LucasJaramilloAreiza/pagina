type KpiCardProps = {
  title: string;
  value: string;
  detail: string;
  tone?: 'default' | 'rose' | 'emerald' | 'blue' | 'amber';
};

const toneStyles = {
  default: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  emerald: 'border-green-200 bg-green-50 text-green-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
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
