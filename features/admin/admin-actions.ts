"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRoleKey } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/security/password";
import { requireUser } from "@/features/auth/session";

async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.roleKey !== "SUPER_ADMIN") {
    throw new Error("Only super admin can perform this action.");
  }
  return user;
}

export async function updateUserAccessAction(formData: FormData) {
  const user = await requireSuperAdmin();
  if (!prisma) throw new Error("Database is not configured.");

  const userId = String(formData.get("userId") ?? "");
  const roleKey = String(formData.get("role") ?? "READ_ONLY_STAFF") as UserRoleKey;
  const active = String(formData.get("active") ?? "true") === "true";
  const password = String(formData.get("password") ?? "").trim();
  const role = await prisma.role.findUnique({ where: { key: roleKey } });

  if (!userId || !role) throw new Error("Invalid user or role.");

  const target = await prisma.user.update({
    where: { id: userId },
    data: {
      roleId: role.id,
      active,
      ...(password ? { passwordHash: await hashPassword(password) } : {})
    }
  });

  await prisma.auditLog.create({
    data: {
      module: "admin",
      action: "update-user-access",
      recordId: target.id,
      recordTitle: target.email,
      userId: user.id,
      newValues: {
        role: roleKey,
        active,
        passwordChanged: Boolean(password)
      }
    }
  });

  revalidatePath("/admin");
  redirect("/admin?saved=access");
}

export async function resetBusinessDataFromAdminAction(formData: FormData) {
  const user = await requireSuperAdmin();
  if (!prisma) throw new Error("Database is not configured.");

  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE DATA") {
    redirect("/admin?error=Type%20DELETE%20DATA%20to%20confirm");
  }

  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.reportExportLog.deleteMany(),
    prisma.ledgerEntry.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.milkCollection.deleteMany(),
    prisma.salaryPayment.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.bulkOrder.deleteMany(),
    prisma.holidayPlan.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.farmer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.product.deleteMany()
  ]);

  await prisma.businessSettings.updateMany({
    data: {
      address: "",
      phone: "",
      whatsappNumber: null,
      email: null,
      gstin: null,
      fssaiLicense: null,
      registeredNumber: null,
      invoiceFooterTerms: "",
      invoiceAssignees: null,
      upiPaymentDetails: null,
      defaultTaxRate: "0",
      themeColor: "#141b18",
      branchName: null,
      branchCode: null
    }
  });

  await prisma.auditLog.create({
    data: {
      module: "admin",
      action: "reset-business-data",
      recordTitle: "Business data reset",
      userId: user.id
    }
  });

  revalidatePath("/");
  redirect("/admin?saved=reset");
}
