import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";
import { localizeValue, t, type Locale } from "@/lib/i18n/dictionary";
import type { ModuleDefinition, ModuleRow, TableColumn } from "@/features/modules/module-definitions";
import { EmptyState } from "./empty-state";
import { AppIcon } from "./icon";

function statusTone(value: unknown) {
  const normalized = String(value ?? "").toLowerCase();
  if (["paid", "active", "available", "present", "in"].includes(normalized)) return "success";
  if (["partial", "low", "pending", "warning", "half_day", "leave"].some((word) => normalized.includes(word))) return "warning";
  if (["unpaid", "inactive", "cancelled", "out", "deleted", "absent"].includes(normalized)) return "danger";
  return "muted";
}

function renderCell(row: ModuleRow, column: TableColumn, locale: Locale) {
  const value = row[column.key];
  if (column.type === "money") return formatCurrency(value as string | number);
  if (column.type === "number") return formatNumber(value as string | number);
  if (column.type === "date") return formatDate(value as string);
  if (column.type === "status") return <Badge tone={statusTone(value)}>{localizeValue(locale, value)}</Badge>;
  return String(value ?? "-");
}

export function ModuleTable({
  definition,
  rows,
  search,
  page,
  pageSize,
  total,
  locale
}: {
  definition: ModuleDefinition;
  rows: ModuleRow[];
  search?: string;
  page: number;
  pageSize: number;
  total: number;
  locale: Locale;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={t(locale, "noRecordsTitle")}
        description={t(locale, "noRecordsDescription")}
        actionHref={definition.createLabel ? `${definition.href}/new` : undefined}
        actionLabel={definition.createLabel}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const query = search ? `&q=${encodeURIComponent(search)}` : "";
  const hasInvoiceActions = definition.key === "invoices";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {definition.columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-bold">
                  {column.label}
                </th>
              ))}
              {hasInvoiceActions ? <th className="px-4 py-3 font-bold">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={`${definition.key}-${index}`} className="hover:bg-muted/35">
                {definition.columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {renderCell(row, column, locale)}
                  </td>
                ))}
                {hasInvoiceActions ? (
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                      <a href={`/api/invoices/${encodeURIComponent(String(row.invoiceNumber ?? ""))}/pdf`}>
                        <AppIcon name="file" />
                        {t(locale, "pdf")}
                      </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/invoices/${encodeURIComponent(String(row.invoiceNumber ?? ""))}/whatsapp`} target="_blank" rel="noreferrer">
                          <AppIcon name="message" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t(locale, "showing")} {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} {t(locale, "of")} {total}
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`${definition.href}?page=${Math.max(1, page - 1)}${query}`} aria-disabled={page <= 1}>
              {t(locale, "previous")}
            </Link>
          </Button>
          <span className="text-xs">
            {t(locale, "page")} {page} {t(locale, "of")} {totalPages}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`${definition.href}?page=${Math.min(totalPages, page + 1)}${query}`} aria-disabled={page >= totalPages}>
              {t(locale, "next")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ExportActions({ exportKey, locale }: { exportKey: string; locale: Locale }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/exports/${exportKey}?format=pdf`}>
          <AppIcon name="file" />
          {t(locale, "pdf")}
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`/api/exports/${exportKey}?format=csv`}>
          <AppIcon name="download" />
          {t(locale, "csv")}
        </a>
      </Button>
    </div>
  );
}
