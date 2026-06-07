import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { requireUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { PrintControls } from "@/features/pos/print-controls";

type PageProps = {
  params: Promise<{ invoice: string }>;
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export async function generateMetadata({ params }: PageProps) {
  const { invoice } = await params;
  return {
    title: `Receipt ${decodeURIComponent(invoice)}`
  };
}

export default async function PosReceiptPage({ params }: PageProps) {
  const user = await requireUser();
  if (!can(user.roleKey, "pos", "view") && !can(user.roleKey, "invoices", "view")) redirect("/dashboard");
  if (!prisma) notFound();

  const { invoice: invoiceParam } = await params;
  const invoiceNumber = decodeURIComponent(invoiceParam);
  const [settings, invoice] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.invoice.findFirst({
      where: { invoiceNumber },
      include: {
        customer: true,
        cashier: { select: { name: true } },
        items: { orderBy: { createdAt: "asc" } }
      }
    })
  ]);

  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-white p-5 shadow-soft print-wrapper">
      <style>{`
        @media print {
          aside, header, nav, .no-print { display: none !important; }
          main { padding: 0 !important; }
          body { background: #fff !important; }
          .print-wrapper { border: 0 !important; box-shadow: none !important; max-width: 80mm !important; padding: 0 !important; }
        }
      `}</style>
      <PrintControls />
      <section className="border-b border-dashed border-border pb-4 text-center">
        <p className="text-lg font-bold">{settings?.businessName ?? "Namdhari Swaich Sweets"}</p>
        {settings?.address ? <p className="mt-1 text-xs text-muted-foreground">{settings.address}</p> : null}
        {settings?.phone ? <p className="text-xs text-muted-foreground">Phone: {settings.phone}</p> : null}
        <p className="mt-3 text-sm font-semibold">Order Receipt</p>
      </section>

      <section className="grid grid-cols-2 gap-2 text-xs">
        <span className="text-muted-foreground">Invoice</span>
        <span className="text-right font-semibold">{invoice.invoiceNumber}</span>
        <span className="text-muted-foreground">Date</span>
        <span className="text-right">{formatDate(invoice.issueDate)}</span>
        <span className="text-muted-foreground">Cashier</span>
        <span className="text-right">{invoice.cashier?.name ?? "Counter"}</span>
        <span className="text-muted-foreground">Assigned</span>
        <span className="text-right">{invoice.assignedToName ?? invoice.cashier?.name ?? "Counter"}</span>
        <span className="text-muted-foreground">Customer</span>
        <span className="text-right">{invoice.customer?.name ?? "Walk-in Customer"}</span>
      </section>

      <section className="border-y border-dashed border-border py-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2">Item</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1 pr-2 font-medium">{item.productName}</td>
                <td className="py-1 text-right">
                  {decimal(item.quantity)} {item.unit}
                </td>
                <td className="py-1 text-right">{formatCurrency(decimal(item.lineTotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(decimal(invoice.subtotal))}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(decimal(invoice.taxTotal))}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
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

      {invoice.notes ? <p className="border-t border-dashed border-border pt-3 text-xs text-muted-foreground">{invoice.notes}</p> : null}
      <p className="border-t border-dashed border-border pt-3 text-center text-xs font-semibold">Thank you for your business.</p>
    </div>
  );
}
