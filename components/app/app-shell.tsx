import type { CurrentUser } from "@/features/auth/session";
import type { Locale } from "@/lib/i18n/dictionary";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ user, locale, children }: { user: CurrentUser; locale: Locale; children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar roleKey={user.roleKey} locale={locale} />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Topbar user={user} locale={locale} />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-7">{children}</main>
      </div>
      <MobileNav roleKey={user.roleKey} locale={locale} />
    </div>
  );
}
