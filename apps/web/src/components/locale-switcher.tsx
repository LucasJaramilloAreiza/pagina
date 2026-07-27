"use client";

import { useLocale } from "next-intl";
import { locales } from "@/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
      {locale === "es" ? "Español" : locales[0]}
    </div>
  );
}
