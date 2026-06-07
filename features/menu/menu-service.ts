import { withDatabase } from "@/lib/db/client";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  sellingPrice: number;
  taxRate: number;
  active: boolean;
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export async function getMenuItems({ category, search }: { category?: string; search?: string } = {}): Promise<MenuItem[]> {
  const normalizedCategory = category?.trim();
  const normalizedSearch = search?.trim();

  return withDatabase(
    async (client) => {
      const products = await client.product.findMany({
        where: {
          active: true,
          ...(normalizedCategory && normalizedCategory !== "ALL" ? { category: normalizedCategory } : {}),
          ...(normalizedSearch
            ? {
                OR: [
                  { name: { contains: normalizedSearch } },
                  { sku: { contains: normalizedSearch } },
                  { category: { contains: normalizedSearch } }
                ]
              }
            : {})
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        take: 300
      });

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        sku: product.sku,
        unit: product.unit,
        sellingPrice: decimal(product.sellingPrice),
        taxRate: decimal(product.taxRate),
        active: product.active
      }));
    },
    []
  );
}

