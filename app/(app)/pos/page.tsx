import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/features/auth/session";
import { getInvoiceProducts } from "@/features/invoices/product-lookup";
import { PosTerminal } from "@/features/pos/pos-terminal";
import { can } from "@/lib/permissions/roles";

export const metadata = {
  title: "POS"
};

export default async function PosPage() {
  const user = await requireUser();
  if (!can(user.roleKey, "pos", "view")) redirect("/dashboard");
  const products = await getInvoiceProducts();

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sales counter</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal">POS order printing</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Fast counter billing with item-code lookup, menu buttons, real invoice records, dues, and receipt printing.
            </p>
          </div>
          <Badge tone="success">Live products: {products.length}</Badge>
        </div>
      </section>
      <PosTerminal products={products} />
    </div>
  );
}
