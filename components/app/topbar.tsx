import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { roleLabelForLocale, t, type Locale } from "@/lib/i18n/dictionary";
import { BrandLogo } from "./brand-logo";
import { AppIcon } from "./icon";

type TopbarProps = {
  user: {
    name: string;
    email: string;
    roleKey: string;
  };
};

export function Topbar({ user, locale }: TopbarProps & { locale: Locale }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo className="h-10 w-10 shrink-0 rounded-md sm:h-11 sm:w-11" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t(locale, "appSubtitle")}</p>
            <h1 className="truncate text-lg font-bold sm:text-xl">Namdhari Swaich Sweets</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success" className="hidden sm:inline-flex">
            {roleLabelForLocale(locale, user.roleKey)}
          </Badge>
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <LanguageSwitcher locale={locale} compact />
          <Button variant="ghost" size="icon" aria-label={t(locale, "notifications")}>
            <AppIcon name="bell" />
          </Button>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" size="sm" type="submit">
              <AppIcon name="logout" />
              <span className="hidden sm:inline">{t(locale, "logout")}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
