import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppIcon } from "@/components/app/icon";
import { requireUser } from "@/features/auth/session";
import { getSupplierLedgerData } from "@/features/suppliers/supplier-ledger-service";
import { can } from "@/lib/permissions/roles";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type PageProps = {
  searchParams: Promise<{ supplierId?: string }>;
};

export const metadata = {
  title: "Supplier Ledger"
};

export default async function SupplierLedgerPage({ searchParams }: PageProps) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  if (!can(user.roleKey, "suppliers", "view")) redirect("/dashboard");

  const data = await getSupplierLedgerData(query.supplierId);
  const selectedSupplier = data.suppliers.find((supplier) => supplier.id === query.supplierId) ?? data.suppliers[0];
  const canAddLedger = can(user.roleKey, "ledgers", "create");

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Supplier database</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal">Supplier Ledger</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Separate supplier contact backup and debit-credit ledger, so supplier numbers, GST, payment terms, and dues stay safe even if mobile contacts are lost.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/suppliers">
                <AppIcon name="truck" />
                Supplier database
              </Link>
            </Button>
            {canAddLedger ? (
              <Button asChild>
                <Link href="/ledgers/new">
                  <AppIcon name="plus" />
                  Add ledger entry
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Supplier contacts</CardTitle>
            <CardDescription>Stored in the database as your supplier contact backup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.suppliers.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No suppliers yet. Add real supplier records first.</p>
            ) : (
              data.suppliers.map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/ledger?supplierId=${supplier.id}`}
                  className={`block rounded-lg border p-3 transition hover:bg-muted/50 ${selectedSupplier?.id === supplier.id ? "border-primary bg-muted/40" : "border-border bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{supplier.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{supplier.contactPerson ?? "No contact person"}</p>
                    </div>
                    <Badge tone={supplier.active ? "success" : "muted"}>{supplier.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{supplier.phone || "No phone"}</p>
                  {supplier.whatsappNumber ? <p className="text-xs text-muted-foreground">WhatsApp: {supplier.whatsappNumber}</p> : null}
                  {supplier.supplyCategories ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{supplier.supplyCategories}</p> : null}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Debit</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totals.debit)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Credit</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totals.credit)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Balance</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totals.balance)}</p>
              </CardContent>
            </Card>
          </section>

          {selectedSupplier ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSupplier.name}</CardTitle>
                <CardDescription>Contact backup and supplier terms.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-semibold">Phone:</span> {selectedSupplier.phone || "-"}</p>
                <p><span className="font-semibold">Alternate:</span> {selectedSupplier.alternatePhone || "-"}</p>
                <p><span className="font-semibold">WhatsApp:</span> {selectedSupplier.whatsappNumber || "-"}</p>
                <p><span className="font-semibold">Email:</span> {selectedSupplier.email || "-"}</p>
                <p><span className="font-semibold">GST/license:</span> {selectedSupplier.gstOrLicense || "-"}</p>
                <p><span className="font-semibold">Supplies:</span> {selectedSupplier.supplyCategories || "-"}</p>
                <p><span className="font-semibold">Terms:</span> {selectedSupplier.paymentTerms || "-"}</p>
                <p><span className="font-semibold">Opening:</span> {formatCurrency(selectedSupplier.openingBalance)}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Address:</span> {selectedSupplier.address || "-"}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Bank/UPI:</span> {selectedSupplier.bankDetails || "-"}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Ledger entries</CardTitle>
              <CardDescription>Supplier-specific debit and credit history.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.entries.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No supplier ledger entries yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3">{formatDate(entry.entryDate)}</td>
                          <td className="px-4 py-3">
                            <Badge tone={entry.entryType === "CREDIT" ? "success" : "warning"}>{entry.entryType}</Badge>
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(entry.amount)}</td>
                          <td className="px-4 py-3">{entry.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
