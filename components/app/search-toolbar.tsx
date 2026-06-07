import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { AppIcon } from "./icon";

export function SearchToolbar({
  action,
  defaultValue,
  locale
}: {
  action: string;
  defaultValue?: string;
  locale: Locale;
}) {
  return (
    <form action={action} className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={defaultValue} placeholder={t(locale, "searchPlaceholder")} className="pl-9" />
      </div>
      <Button type="submit" variant="outline">
        {t(locale, "search")}
      </Button>
    </form>
  );
}
