import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/app/brand-logo";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { SharePrintButton } from "@/features/invoices/share-print-button";

type PageProps = {
  params: Promise<{ token: string }>;
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export async function generateMetadata() {
  return {
    title: "Shared Invoice"
  };
}

export default async function SharedInvoicePage({ params }: PageProps) {
  if (!prisma) notFound();
  const { token } = await params;
  const [settings, invoice] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.invoice.findFirst({
      where: { shareToken: token },
      include: {
        customer: true,
        cashier: { select: { name: true } },
        items: { orderBy: { createdAt: "asc" } }
      }
    })
  ]);

  if (!invoice) notFound();

  return (
    <main className="min-h-screen bg-muted/50 px-4 py-8">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; }
          .invoice-card { border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="invoice-card mx-auto max-w-4xl rounded-lg border border-border bg-white p-6 shadow-soft">
        <section className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-20 w-20 rounded-lg" />
            <div>
              <p className="text-2xl font-bold">{settings?.businessName ?? "Namdhari Swaich Sweets"}</p>
              {settings?.address ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{settings.address}</p> : null}
              {settings?.phone ? <p className="text-sm text-muted-foreground">Phone: {settings.phone}</p> : null}
              {settings?.whatsappNumber ? <p className="text-sm text-muted-foreground">WhatsApp: {settings.whatsappNumber}</p> : null}
              {settings?.registeredNumber ? <p className="text-sm text-muted-foreground">Reg No: {settings.registeredNumber}</p> : null}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <Badge tone={invoice.status === "PAID" ? "success" : invoice.status === "PARTIAL" ? "warning" : "danger"}>{invoice.status}</Badge>
            <p className="mt-3 text-2xl font-bold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">{formatDate(invoice.issueDate)}</p>
          </div>
        </section>

        <section className="grid gap-4 border-b border-border py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bill to</p>
            <p className="mt-2 font-bold">{invoice.customer?.name ?? "Customer"}</p>
            {invoice.customer?.phone ? <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p> : null}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cashier</p>
            <p className="mt-2 font-bold">{invoice.cashier?.name ?? "Counter"}</p>
            <p className="text-sm text-muted-foreground">Assigned: {invoice.assignedToName ?? invoice.cashier?.name ?? "Counter"}</p>
            <p className="text-sm text-muted-foreground">{invoice.paymentMode}</p>
          </div>
        </section>

        <section className="overflow-x-auto py-5">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-right">
                    {decimal(item.quantity)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(decimal(item.price))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(decimal(item.taxAmount))}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(decimal(item.lineTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="ml-auto max-w-sm space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(decimal(invoice.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>{formatCurrency(decimal(invoice.discountTotal))}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(decimal(invoice.taxTotal))}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(decimal(invoice.total))}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{formatCurrency(decimal(invoice.paidAmount))}</span>
          </div>
          <div className="flex justify-between">
            <span>Due</span>
            <span>{formatCurrency(decimal(invoice.dueAmount))}</span>
          </div>
        </section>

        {invoice.notes ? <p className="mt-5 rounded-md bg-muted p-3 text-sm text-muted-foreground">{invoice.notes}</p> : null}
        <div className="no-print mt-6 flex justify-end">
          <SharePrintButton />
        </div>
      </div>
    </main>
  );
}
