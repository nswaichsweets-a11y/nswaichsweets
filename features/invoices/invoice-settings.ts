import { prisma, withDatabase } from "@/lib/db/client";

export async function getInvoiceFormSettings() {
  if (!prisma) return { assignees: [] as string[] };

  return withDatabase(
    async (client) => {
      const settings = await client.businessSettings.findFirst();
      const assignees = String(settings?.invoiceAssignees ?? "")
        .split(/\r?\n|,/)
        .map((name) => name.trim())
        .filter(Boolean);
      return { assignees };
    },
    { assignees: [] as string[] }
  );
}
