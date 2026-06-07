"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { toDatabaseJson } from "@/lib/db/json";
import { requireUser } from "@/features/auth/session";
import { activeFromValue, optionalNumber } from "@/lib/validations/module-record";

function slug(value: string) {
  return value.replace(/\W+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

export async function createFarmerProfileAction(formData: FormData) {
  const user = await requireUser();
  if (user.roleKey !== "SUPER_ADMIN") throw new Error("Only super admin can create farmer profiles.");
  if (!prisma) throw new Error("Database is not configured.");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !phone) throw new Error("Farmer name and phone are required.");

  const profileId = `farmer-${slug(`${name}-${phone}`)}`;
  const data = {
      name,
      phone,
      villageAddress: String(formData.get("villageAddress") ?? "") || null,
      paymentDetails: String(formData.get("paymentDetails") ?? "") || null,
      openingBalance: optionalNumber(String(formData.get("openingBalance") ?? "0")),
      notes: String(formData.get("notes") ?? "") || null,
      active: activeFromValue(String(formData.get("active") ?? "Active"))
  };
  const profile = await prisma.farmer.upsert({
    where: { id: profileId },
    update: data,
    create: {
      id: profileId,
      ...data
    }
  });

  await prisma.auditLog.create({
    data: {
      module: "farmers",
      action: "create-profile",
      recordId: profile.id,
      recordTitle: profile.name,
      userId: user.id,
      newValues: toDatabaseJson({
        name: profile.name,
        phone: profile.phone,
        villageAddress: profile.villageAddress
      })
    }
  });

  revalidatePath("/farmers");
  revalidatePath("/farmers/profiles");
  redirect("/farmers/profiles?saved=1");
}
