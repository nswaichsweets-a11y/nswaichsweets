"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationModules } from "@/features/modules/module-definitions";
import { localizeNavTitle } from "@/features/modules/localize";
import { localizeCategory, type Locale } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "./brand-logo";
import { AppIcon } from "./icon";

export function Sidebar({ roleKey, locale }: { roleKey: string; locale: Locale }) {
  const pathname = usePathname();
  const groups = navigationModules
    .filter((item) => can(roleKey, item.key, "view"))
    .reduce<Record<string, typeof navigationModules>>((acc, item) => {
      acc[item.category] = [...(acc[item.category] ?? []), item];
      return acc;
    }, {});

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-white/86 px-4 py-5 backdrop-blur lg:block">
      <Link href="/dashboard" className="mb-7 flex items-center gap-3 rounded-lg px-2">
        <BrandLogo className="h-12 w-12" />
        <div>
          <p className="text-sm font-bold leading-tight">Namdhari Swaich</p>
          <p className="text-xs text-muted-foreground">{locale === "pa" ? "ਸਵੀਟਸ ਸੂਟ" : "Sweets Suite"}</p>
        </div>
      </Link>

      <nav className="space-y-5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{localizeCategory(locale, group)}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      active && "bg-accent text-accent-foreground"
                    )}
                  >
                    <AppIcon name={item.icon} />
                    <span>{localizeNavTitle(locale, item.key, item.title)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
