"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationModules } from "@/features/modules/module-definitions";
import { localizeNavTitle } from "@/features/modules/localize";
import type { Locale } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";
import { cn } from "@/lib/utils/cn";
import { AppIcon } from "./icon";

const primaryMobileKeys = ["dashboard", "pos", "menu", "invoices", "reports"];

export function MobileNav({ roleKey, locale }: { roleKey: string; locale: Locale }) {
  const pathname = usePathname();
  const items = navigationModules.filter((item) => primaryMobileKeys.includes(item.key) && can(roleKey, item.key, "view"));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <AppIcon name={item.icon} className="h-5 w-5" />
              <span className="truncate">{localizeNavTitle(locale, item.key, item.title)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
