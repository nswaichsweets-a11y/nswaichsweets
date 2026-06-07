import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppIcon } from "@/components/app/icon";
import { reportDefinitions } from "@/features/reports/report-definitions";
import { localizeReportDefinition } from "@/features/reports/localize";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";
import { requireUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";

export const metadata = {
  title: "Reports"
};

export default async function ReportsPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  if (!can(user.roleKey, "reports", "view")) redirect("/dashboard");

  const reports = reportDefinitions
    .filter((report) => can(user.roleKey, report.sourceModuleKey, "export") || can(user.roleKey, "reports", "export"))
    .map((report) => localizeReportDefinition(locale, report));
  const reportGroups = reports.reduce<Record<string, typeof reports>>((groups, report) => {
    groups[report.module] = [...(groups[report.module] ?? []), report];
    return groups;
  }, {});
  const groupEntries = Object.entries(reportGroups);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <div className="border-b border-border bg-primary px-5 py-6 text-primary-foreground">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-75">{t(locale, "reportsAndExports")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal">{t(locale, "fullReportsSuite")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 opacity-78">{t(locale, "reportsDescription")}</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Reports</p>
            <p className="mt-2 text-2xl font-bold">{reports.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Groups</p>
            <p className="mt-2 text-2xl font-bold">{groupEntries.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Exports</p>
            <p className="mt-2 text-2xl font-bold">PDF / CSV</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {groupEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-soft">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-accent text-accent-foreground">
              <AppIcon name="shield" className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">No exports available</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Your role can view reports, but export access is restricted. Ask the owner to update your role if PDF or CSV exports are needed.
            </p>
          </div>
        ) : null}
        {groupEntries.map(([group, groupReports]) => (
          <div key={group} className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Report Group</p>
                <h3 className="text-lg font-bold">{group}</h3>
              </div>
              <Badge tone="muted">{groupReports.length} reports</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groupReports.map((report) => (
                <Card key={report.key}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{report.title}</CardTitle>
                        <CardDescription className="mt-2">{report.description}</CardDescription>
                      </div>
                      <Badge>{report.module}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {report.filters.map((filter) => (
                        <Badge key={filter} tone="muted">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button asChild size="sm">
                        <a href={`/api/exports/${report.key}?format=pdf`}>
                          <AppIcon name="file" />
                          {t(locale, "pdf")}
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/exports/${report.key}?format=csv`}>
                          <AppIcon name="download" />
                          {t(locale, "csv")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
