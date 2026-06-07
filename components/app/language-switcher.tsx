"use client";

import { useRouter } from "next/navigation";
import { locales, t, type Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const router = useRouter();

  async function changeLocale(nextLocale: Locale) {
    await fetch("/api/language", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ locale: nextLocale })
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-white p-1">
      {!compact ? <span className="px-2 text-xs font-semibold text-muted-foreground">{t(locale, "language")}</span> : null}
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => changeLocale(item.code)}
          className={cn(
            "rounded px-2.5 py-1.5 text-xs font-bold transition",
            item.code === locale ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-pressed={item.code === locale}
        >
          {compact ? item.shortLabel : item.label}
        </button>
      ))}
    </div>
  );
}
