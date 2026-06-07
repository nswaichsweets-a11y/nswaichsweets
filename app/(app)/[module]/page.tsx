import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleTable, ExportActions } from "@/components/app/module-table";
import { SearchToolbar } from "@/components/app/search-toolbar";
import { AppIcon } from "@/components/app/icon";
import { getModuleDefinition } from "@/features/modules/module-definitions";
import { localizeModuleDefinition } from "@/features/modules/localize";
import { listModuleRecords } from "@/features/modules/repository";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { localizeCategory, t } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ q?: string; page?: string; saved?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { module } = await params;
  const definition = getModuleDefinition(module);
  return {
    title: definition?.title ?? "Module"
  };
}

export default async function ModulePage({ params, searchParams }: PageProps) {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const { module } = await params;
  const query = await searchParams;
  const baseDefinition = getModuleDefinition(module);
  if (!baseDefinition) notFound();
  const definition = localizeModuleDefinition(locale, baseDefinition);

  if (!can(user.roleKey, definition.key, "view")) redirect("/dashboard");

  const search = query.q?.trim();
  const page = Number(query.page ?? 1);
  const records = await listModuleRecords(definition.key, { search, page });
  const canCreate = definition.fields.length > 0 && can(user.roleKey, definition.key, definition.key === "business-settings" ? "update" : "create");
  const canExport = can(user.roleKey, definition.key, "export") || can(user.roleKey, "reports", "export");
  const canManageAttendance = definition.key === "employees" && (can(user.roleKey, "employees", "update") || can(user.roleKey, "employees", "create"));
  const canViewSupplierLedger = definition.key === "suppliers" && can(user.roleKey, "suppliers", "view");
  const canViewFarmerProfiles = definition.key === "farmers" && can(user.roleKey, "farmers", "view");
  const attendanceLabel = locale === "pa" ? "ਹਾਜ਼ਰੀ / ਗੈਰਹਾਜ਼ਰੀ" : "Track Attendance";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{localizeCategory(locale, definition.category)}</p>
              {query.saved ? <Badge tone="success">{t(locale, "saved")}</Badge> : null}
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">{definition.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{definition.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canExport ? <ExportActions exportKey={definition.exportKey} locale={locale} /> : null}
            {canManageAttendance ? (
              <Button asChild variant="outline">
                <Link href="/employees/attendance">
                  <AppIcon name="calendar-check" />
                  {attendanceLabel}
                </Link>
              </Button>
            ) : null}
            {canViewFarmerProfiles ? (
              <Button asChild variant="outline">
                <Link href="/farmers/profiles">
                  <AppIcon name="milk" />
                  Farmer Profiles
                </Link>
              </Button>
            ) : null}
            {canViewSupplierLedger ? (
              <Button asChild variant="outline">
                <Link href="/suppliers/ledger">
                  <AppIcon name="book" />
                  Supplier Ledger
                </Link>
              </Button>
            ) : null}
            {canCreate ? (
              <Button asChild>
                <Link href={`${definition.href}/new`}>
                  <AppIcon name="plus" />
                  {definition.createLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchToolbar action={definition.href} defaultValue={search} locale={locale} />
        <p className="text-sm text-muted-foreground">{t(locale, "recordsPerPage").replace("{count}", String(records.pageSize))}</p>
      </section>

      <ModuleTable
        definition={definition}
        rows={records.rows}
        search={search}
        page={records.page}
        pageSize={records.pageSize}
        total={records.total}
        locale={locale}
      />
    </div>
  );
}
