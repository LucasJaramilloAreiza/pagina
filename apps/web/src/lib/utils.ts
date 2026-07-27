
const localeCurrencyMap: Record<string, string> = {
  es: "COP",
};

function resolveLocale(locale?: string) {
  return locale ?? "es";
}

function resolveCurrency(locale: string) {
  return localeCurrencyMap[locale] ?? "COP";
}

export function formatDate(date: Date | string, locale?: string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat(resolveLocale(locale)).format(date)
}

/** Format an integer amount in cents as a currency string. */
export function formatCurrency(cents: number, locale?: string) {
  const loc = resolveLocale(locale);
  const value = Math.round(cents / 100);
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Format an ISO date string to a short label like "Jan 5". */
export function formatShortDate(dateStr: string, locale?: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(resolveLocale(locale), { month: "short", day: "numeric" });
}
