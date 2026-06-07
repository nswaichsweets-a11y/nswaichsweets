import { prisma, withDatabase } from "@/lib/db/client";

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export type SupplierLedgerData = {
  suppliers: {
    id: string;
    name: string;
    contactPerson: string | null;
    phone: string;
    alternatePhone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    address: string | null;
    gstOrLicense: string | null;
    supplyCategories: string | null;
    paymentTerms: string | null;
    bankDetails: string | null;
    openingBalance: number;
    active: boolean;
  }[];
  entries: {
    id: string;
    supplierName: string;
    entryDate: string;
    entryType: string;
    amount: number;
    description: string;
  }[];
  totals: {
    debit: number;
    credit: number;
    balance: number;
  };
};

export async function getSupplierLedgerData(supplierId?: string): Promise<SupplierLedgerData> {
  const fallback: SupplierLedgerData = {
    suppliers: [],
    entries: [],
    totals: { debit: 0, credit: 0, balance: 0 }
  };

  if (!prisma) return fallback;

  return withDatabase(
    async (client) => {
      const suppliers = await client.supplier.findMany({
        orderBy: [{ active: "desc" }, { name: "asc" }]
      });
      const selectedSupplierId = supplierId && suppliers.some((supplier) => supplier.id === supplierId) ? supplierId : suppliers[0]?.id;

      const entries = selectedSupplierId
        ? await client.ledgerEntry.findMany({
            where: { supplierId: selectedSupplierId },
            include: { supplier: true },
            orderBy: { entryDate: "desc" },
            take: 300
          })
        : [];

      const debit = entries.filter((entry) => entry.entryType === "DEBIT").reduce((sum, entry) => sum + decimal(entry.amount), 0);
      const credit = entries.filter((entry) => entry.entryType === "CREDIT").reduce((sum, entry) => sum + decimal(entry.amount), 0);
      const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId);
      const openingBalance = decimal(selectedSupplier?.openingBalance);

      return {
        suppliers: suppliers.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          alternatePhone: supplier.alternatePhone,
          whatsappNumber: supplier.whatsappNumber,
          email: supplier.email,
          address: supplier.address,
          gstOrLicense: supplier.gstOrLicense,
          supplyCategories: supplier.supplyCategories,
          paymentTerms: supplier.paymentTerms,
          bankDetails: supplier.bankDetails,
          openingBalance: decimal(supplier.openingBalance),
          active: supplier.active
        })),
        entries: entries.map((entry) => ({
          id: entry.id,
          supplierName: entry.supplier?.name ?? "Supplier",
          entryDate: entry.entryDate.toISOString(),
          entryType: entry.entryType,
          amount: decimal(entry.amount),
          description: entry.description
        })),
        totals: {
          debit,
          credit,
          balance: openingBalance + debit - credit
        }
      };
    },
    fallback
  );
}
