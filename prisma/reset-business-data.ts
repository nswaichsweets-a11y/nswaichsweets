import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  console.log("Business data reset complete. Users, roles, and permissions were kept. Business settings were cleared to blank setup values.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
