import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  return (
    <AppShell user={user} locale={locale}>
      {children}
    </AppShell>
  );
}
