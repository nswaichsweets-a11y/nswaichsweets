import { prisma, withDatabase } from "@/lib/db/client";

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

export type FarmerProfile = {
  id: string;
  name: string;
  phone: string;
  villageAddress: string | null;
  paymentDetails: string | null;
  notes: string | null;
  openingBalance: number;
  active: boolean;
};

export async function getFarmerProfiles(): Promise<FarmerProfile[]> {
  if (!prisma) return [];

  return withDatabase(
    async (client) => {
      const farmers = await client.farmer.findMany({
        orderBy: [{ active: "desc" }, { name: "asc" }],
        take: 500
      });

      return farmers.map((farmer) => ({
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        villageAddress: farmer.villageAddress,
        paymentDetails: farmer.paymentDetails,
        notes: farmer.notes,
        openingBalance: decimal(farmer.openingBalance),
        active: farmer.active
      }));
    },
    []
  );
}
