import { withDatabase } from "@/lib/db/client";

export type InvoiceProduct = {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  sellingPrice: number;
  taxRate: number;
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export async function getInvoiceProducts(): Promise<InvoiceProduct[]> {
  return withDatabase(
    async (client) => {
      const products = await client.product.findMany({
        where: { active: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        take: 250
      });

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        sku: product.sku,
        unit: product.unit,
        sellingPrice: decimal(product.sellingPrice),
        taxRate: decimal(product.taxRate)
      }));
    },
    []
  );
}
