import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/app/metric-card";
import { AppIcon } from "@/components/app/icon";
import { getDashboardSummary } from "@/features/dashboard/dashboard-service";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { localizeValue, t, type Locale } from "@/lib/i18n/dictionary";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";

export const metadata = {
  title: "Dashboard"
};

const dashboardText: Record<string, string> = {
  "Today's sales": "ਅੱਜ ਦੀ ਵਿਕਰੀ",
  "Today's expenses": "ਅੱਜ ਦੇ ਖਰਚੇ",
  "Today's profit": "ਅੱਜ ਦਾ ਮੁਨਾਫਾ",
  "Monthly sales": "ਮਹੀਨਾਵਾਰ ਵਿਕਰੀ",
  "Monthly expenses": "ਮਹੀਨਾਵਾਰ ਖਰਚੇ",
  "Monthly profit": "ਮਹੀਨਾਵਾਰ ਮੁਨਾਫਾ",
  "Pending customer dues": "ਗਾਹਕ ਬਕਾਇਆ",
  "Pending farmer payments": "ਕਿਸਾਨ ਭੁਗਤਾਨ ਬਕਾਇਆ",
  "Pending supplier payments": "ਸਪਲਾਇਰ ਭੁਗਤਾਨ ਬਕਾਇਆ",
  "Milk collected today": "ਅੱਜ ਦੁੱਧ ਇਕੱਠਾ",
  "Low stock alerts": "ਘੱਟ ਸਟਾਕ ਅਲਰਟ",
  "Salary dues": "ਤਨਖਾਹ ਬਕਾਇਆ",
  "Invoices raised today": "ਅੱਜ ਬਣੇ ਇਨਵੌਇਸ",
  "Operational spend": "ਓਪਰੇਸ਼ਨ ਖਰਚਾ",
  "Sales minus expenses": "ਵਿਕਰੀ ਵਿੱਚੋਂ ਖਰਚੇ ਘਟਾ ਕੇ",
  "Current month revenue": "ਮੌਜੂਦਾ ਮਹੀਨੇ ਦੀ ਆਮਦਨ",
  "Current month spend": "ਮੌਜੂਦਾ ਮਹੀਨੇ ਦੇ ਖਰਚੇ",
  "Estimated current month": "ਮੌਜੂਦਾ ਮਹੀਨੇ ਦਾ ਅੰਦਾਜ਼ਾ",
  "Open invoice dues": "ਖੁੱਲ੍ਹੇ ਇਨਵੌਇਸ ਬਕਾਇਆ",
  "Milk payable balance": "ਦੁੱਧ ਦੇਣਯੋਗ ਬੈਲੈਂਸ",
  "Supplier opening payable": "ਸਪਲਾਇਰ ਓਪਨਿੰਗ ਪੇਏਬਲ",
  "Litres from farmers": "ਕਿਸਾਨਾਂ ਤੋਂ ਲੀਟਰ",
  "Items below threshold": "ਹੱਦ ਤੋਂ ਘੱਟ ਆਈਟਮਾਂ",
  "Pending salary payments": "ਬਕਾਇਆ ਤਨਖਾਹ ਭੁਗਤਾਨ",
  "Create Invoice": "ਇਨਵੌਇਸ ਬਣਾਓ",
  "Add Milk Entry": "ਦੁੱਧ ਐਂਟਰੀ ਜੋੜੋ",
  "Add Expense": "ਖਰਚਾ ਜੋੜੋ",
  "Stock Entry": "ਸਟਾਕ ਐਂਟਰੀ",
  "Raw material": "ਕੱਚਾ ਮਾਲ",
  "Staff salary": "ਸਟਾਫ ਤਨਖਾਹ",
  Utilities: "ਯੂਟਿਲਿਟੀ",
  Packaging: "ਪੈਕਿੰਗ"
};

function dt(locale: Locale, value: string) {
  return locale === "pa" ? dashboardText[value] ?? value : value;
}

function emptyText(locale: Locale, value: "invoices" | "expenses" | "milk" | "expensesChart") {
  const text = {
    en: {
      invoices: "No invoices yet. Create your first invoice after adding menu items.",
      expenses: "No expenses recorded yet.",
      milk: "No milk collection entries yet.",
      expensesChart: "No expense categories yet."
    },
    pa: {
      invoices: "ਹਾਲੇ ਕੋਈ ਇਨਵੌਇਸ ਨਹੀਂ। ਮੇਨੂ ਆਈਟਮਾਂ ਜੋੜ ਕੇ ਪਹਿਲੀ ਇਨਵੌਇਸ ਬਣਾਓ।",
      expenses: "ਹਾਲੇ ਕੋਈ ਖਰਚਾ ਦਰਜ ਨਹੀਂ।",
      milk: "ਹਾਲੇ ਕੋਈ ਦੁੱਧ ਕਲੇਕਸ਼ਨ ਐਂਟਰੀ ਨਹੀਂ।",
      expensesChart: "ਹਾਲੇ ਕੋਈ ਖਰਚਾ ਕੈਟਾਗਰੀ ਨਹੀਂ।"
    }
  };
  return text[locale][value];
}

export default async function DashboardPage() {
  const [summary, locale, user] = await Promise.all([getDashboardSummary(), getLocale(), requireUser()]);
  const maxRevenue = Math.max(...summary.revenueSeries.map((item) => item.amount), 1);
  const maxExpense = Math.max(...summary.expenseBreakdown.map((item) => item.amount), 1);
  const showReadiness = ["OWNER", "SUPER_ADMIN", "MANAGER"].includes(String(user.roleKey));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(locale, "ownerOverview")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal">{t(locale, "businessPulse")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t(locale, "dashboardDescription")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.quickActions.map((action) => (
            <Button key={action.href} asChild variant={action.href.includes("invoices") ? "default" : "outline"}>
              <Link href={action.href}>
                <AppIcon name={action.icon} />
                {dt(locale, action.label)}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={dt(locale, metric.title)}
            value={metric.kind === "money" ? formatCurrency(metric.value) : formatNumber(metric.value)}
            subtitle={dt(locale, metric.subtitle)}
            icon={metric.icon}
            tone={metric.tone}
          />
        ))}
      </section>

      {showReadiness ? (
        <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Launch Readiness</p>
              <h3 className="mt-2 text-xl font-bold">Professional setup checklist</h3>
            </div>
            <Badge tone={summary.readiness.every((item) => item.complete) ? "success" : "warning"}>
              {summary.readiness.filter((item) => item.complete).length}/{summary.readiness.length} complete
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summary.readiness.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-muted/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge tone={item.complete ? "success" : "warning"}>{item.complete ? "Ready" : "Pending"}</Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={item.href}>{item.action}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "monthlyRevenue")}</CardTitle>
            <CardDescription>{t(locale, "monthlyRevenueDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3">
              {summary.revenueSeries.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-52 w-full items-end rounded-md bg-muted">
                    <div
                      className="w-full rounded-md bg-primary transition-all"
                      style={{ height: item.amount > 0 ? `${Math.max(8, (item.amount / maxRevenue) * 100)}%` : "4px" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "expenseBreakdown")}</CardTitle>
            <CardDescription>{t(locale, "expenseBreakdownDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.expenseBreakdown.length === 0 ? (
              <p className="rounded-md bg-muted/60 px-3 py-4 text-sm text-muted-foreground">{emptyText(locale, "expensesChart")}</p>
            ) : (
              summary.expenseBreakdown.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{dt(locale, item.category)}</span>
                    <span className="text-muted-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-secondary" style={{ width: `${Math.max(6, (item.amount / maxExpense) * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "recentInvoices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentInvoices.length === 0 ? (
              <p className="rounded-md bg-muted/60 px-3 py-4 text-sm text-muted-foreground">{emptyText(locale, "invoices")}</p>
            ) : (
              summary.recentInvoices.map((invoice) => (
              <div key={invoice.invoiceNumber} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                  <p className="text-muted-foreground">{invoice.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                  <p className="text-xs text-muted-foreground">{localizeValue(locale, invoice.status)}</p>
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "recentExpenses")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentExpenses.length === 0 ? (
              <p className="rounded-md bg-muted/60 px-3 py-4 text-sm text-muted-foreground">{emptyText(locale, "expenses")}</p>
            ) : (
              summary.recentExpenses.map((expense, index) => (
              <div key={`${expense.category}-${index}`} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{expense.category}</p>
                  <p className="text-muted-foreground">{formatDate(expense.date)}</p>
                </div>
                <p className="font-semibold">{formatCurrency(expense.amount)}</p>
              </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "recentMilkEntries")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentMilkEntries.length === 0 ? (
              <p className="rounded-md bg-muted/60 px-3 py-4 text-sm text-muted-foreground">{emptyText(locale, "milk")}</p>
            ) : (
              summary.recentMilkEntries.map((entry, index) => (
              <div key={`${entry.farmer}-${index}`} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{entry.farmer}</p>
                  <p className="text-muted-foreground">
                    {localizeValue(locale, entry.session)} - {formatNumber(entry.litres)} L
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(entry.payable)}</p>
              </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
