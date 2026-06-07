"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BulkOrderStatus, LedgerEntryType, LedgerOwnerType, PaymentMode, Unit, UserRoleKey } from "@/lib/domain-types";
import { prisma } from "@/lib/db/client";
import { toDatabaseJson } from "@/lib/db/json";
import { hashPassword } from "@/lib/security/password";
import { activeFromValue, formDataToRecord, optionalDate, optionalNumber } from "@/lib/validations/module-record";
import { requireUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { calculateSweetBoxLines, type SweetBoxLine } from "@/features/invoices/sweet-boxes";

type InvoiceItemInput = {
  id?: string;
  name?: string;
  category?: string;
  sku?: string;
  unit?: Unit;
  sellingPrice?: number;
  taxRate?: number;
  quantity?: number;
};

function parseInvoiceItems(value: string | undefined): Required<InvoiceItemInput>[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as InvoiceItemInput[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? "Menu item"),
        category: String(item.category ?? ""),
        sku: String(item.sku ?? ""),
        unit: (item.unit ?? "PIECE") as Unit,
        sellingPrice: Number(item.sellingPrice ?? 0),
        taxRate: Number(item.taxRate ?? 0),
        quantity: Number(item.quantity ?? 0)
      }))
      .filter((item) => item.quantity > 0 && item.sellingPrice >= 0);
  } catch {
    return [];
  }
}

async function audit(module: string, action: string, recordTitle: string, userId: string, newValues?: Record<string, unknown>) {
  if (!prisma) return;
  await prisma.auditLog.create({
    data: {
      module,
      action,
      recordTitle,
      userId,
      newValues: toDatabaseJson(newValues)
    }
  });
}

function shareToken() {
  return crypto.randomBytes(24).toString("hex");
}

function slug(value: string) {
  return value.replace(/\W+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

async function recordSweetBoxStockOut(boxes: SweetBoxLine[], invoiceNumber: string, userId: string) {
  if (!prisma) return;
  const client = prisma;

  for (const box of boxes) {
    const inventoryItem = await client.inventoryItem.findFirst({
      where: { name: { equals: box.inventoryName }, active: true }
    });
    if (!inventoryItem) continue;

    await client.stockMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        movementType: "OUT",
        quantity: box.quantity.toFixed(3),
        unitCost: "0",
        totalCost: "0",
        notes: `Auto box used for invoice ${invoiceNumber}`,
        createdById: userId
      }
    });
  }
}

export async function createModuleRecordAction(formData: FormData) {
  const user = await requireUser();
  const { moduleKey, values } = formDataToRecord(formData);
  const requiredAction = moduleKey === "business-settings" ? "update" : "create";

  if (!can(user.roleKey, moduleKey, requiredAction)) {
    throw new Error("You do not have permission to save this record.");
  }

  if (prisma) {
    switch (moduleKey) {
      case "business-settings": {
        const existing = await prisma.businessSettings.findFirst();
        const data = {
          businessName: values.businessName || "Namdhari Swaich Sweets",
          logoUrl: values.logoUrl || null,
          address: values.address || "",
          phone: values.phone || "",
          whatsappNumber: values.whatsappNumber || null,
          email: values.email || null,
          gstin: values.gstin || null,
          fssaiLicense: values.fssaiLicense || null,
          registeredNumber: values.registeredNumber || null,
          invoicePrefix: values.invoicePrefix || "NSS",
          invoiceFooterTerms: values.invoiceFooterTerms || "",
          invoiceAssignees: values.invoiceAssignees || null,
          upiPaymentDetails: values.upiPaymentDetails || null,
          currency: values.currency || "INR",
          defaultTaxRate: optionalNumber(values.defaultTaxRate),
          themeColor: values.themeColor || "#141b18",
          branchName: values.branchName || null,
          branchCode: values.branchCode || null
        };
        if (existing) {
          await prisma.businessSettings.update({ where: { id: existing.id }, data });
        } else {
          await prisma.businessSettings.create({ data });
        }
        await audit(moduleKey, "update", data.businessName, user.id, data);
        break;
      }
      case "users": {
        if (!values.name || !values.email) throw new Error("User name and email are required.");
        const role = await prisma.role.findUnique({ where: { key: String(values.role ?? "READ_ONLY_STAFF") as UserRoleKey } });
        if (!role) throw new Error("Selected role does not exist. Run npm run db:seed first.");
        const temporaryPassword = String(values.password || "").trim();
        const data = {
          name: values.name || "New User",
          email: String(values.email || "").toLowerCase(),
          phone: values.phone || null,
          passwordHash: await hashPassword(temporaryPassword || "Namdhari@123"),
          roleId: role.id,
          active: activeFromValue(values.active)
        };
        const updateData = {
          name: data.name,
          phone: data.phone,
          roleId: data.roleId,
          active: data.active,
          ...(temporaryPassword ? { passwordHash: data.passwordHash } : {})
        };
        await prisma.user.upsert({
          where: { email: data.email },
          update: updateData,
          create: data
        });
        await audit(moduleKey, "upsert", data.email, user.id, { ...data, passwordHash: "[redacted]" });
        break;
      }
      case "products": {
        if (!values.name || !values.category || !values.sku) throw new Error("Product name, category, and item code are required.");
        const data = {
          name: values.name,
          category: values.category,
          sku: values.sku,
          unit: (values.unit || "KG") as Unit,
          sellingPrice: optionalNumber(values.sellingPrice),
          costPrice: optionalNumber(values.costPrice),
          taxRate: optionalNumber(values.taxRate),
          imageUrl: values.imageUrl || null,
          wholesalePrice: values.wholesalePrice ? optionalNumber(values.wholesalePrice) : null,
          festivalPrice: values.festivalPrice ? optionalNumber(values.festivalPrice) : null,
          lowStockThreshold: values.lowStockThreshold ? optionalNumber(values.lowStockThreshold) : null,
          active: activeFromValue(values.active)
        };
        await prisma.product.upsert({ where: { sku: data.sku }, update: data, create: data });
        await audit(moduleKey, "upsert", data.name, user.id, data);
        break;
      }
      case "customers":
        if (!values.name || !values.phone) throw new Error("Customer name and phone are required.");
        await prisma.customer.create({
          data: {
            name: values.name,
            phone: values.phone,
            address: values.address || null,
            email: values.email || null,
            openingBalance: optionalNumber(values.openingBalance),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name, user.id, values);
        break;
      case "suppliers":
        if (!values.name || !values.phone) throw new Error("Supplier name and phone are required.");
        await prisma.supplier.create({
          data: {
            name: values.name,
            contactPerson: values.contactPerson || null,
            phone: values.phone,
            alternatePhone: values.alternatePhone || null,
            whatsappNumber: values.whatsappNumber || null,
            address: values.address || null,
            email: values.email || null,
            gstOrLicense: values.gstOrLicense || null,
            supplyCategories: values.supplyCategories || null,
            paymentTerms: values.paymentTerms || null,
            bankDetails: values.bankDetails || null,
            openingBalance: optionalNumber(values.openingBalance),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name, user.id, values);
        break;
      case "employees":
        if (!values.name || !values.phone || !values.aadhaarNumber) throw new Error("Employee name, phone, and Aadhaar card number are required.");
        await prisma.employee.create({
          data: {
            name: values.name,
            phone: values.phone,
            aadhaarNumber: values.aadhaarNumber.replace(/\D/g, ""),
            address: values.address || null,
            designation: values.designation || "Staff",
            joiningDate: optionalDate(values.joiningDate),
            salaryType: (values.salaryType || "MONTHLY") as never,
            salaryRate: optionalNumber(values.salaryRate),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name, user.id, { ...values, aadhaarNumber: "[redacted]" });
        break;
      case "inventory":
        if (!values.name) throw new Error("Inventory item name is required.");
        await prisma.inventoryItem.create({
          data: {
            name: values.name,
            type: (values.type || "RAW_MATERIAL") as never,
            unit: (values.unit || "KG") as Unit,
            currentQuantity: optionalNumber(values.currentQuantity),
            minimumQuantity: optionalNumber(values.minimumQuantity),
            costPerUnit: optionalNumber(values.costPerUnit),
            batchNumber: values.batchNumber || null,
            expiryDate: values.expiryDate ? optionalDate(values.expiryDate) : null,
            notes: values.notes || null
          }
        });
        await audit(moduleKey, "create", values.name, user.id, values);
        break;
      case "expenses":
        await prisma.expense.create({
          data: {
            category: values.category || "Miscellaneous",
            amount: optionalNumber(values.amount),
            paymentMode: (values.paymentMode || "CASH") as PaymentMode,
            expenseDate: optionalDate(values.expenseDate),
            receiptUrl: values.receiptUrl || null,
            notes: values.notes || null
          }
        });
        await audit(moduleKey, "create", values.category || "Expense", user.id, values);
        break;
      case "bulk-orders": {
        if (!values.customerName || !values.phone || !values.deliveryDate || !values.itemsSummary) {
          throw new Error("Customer, phone, delivery date, and items are required for a bulk order.");
        }
        const estimatedTotal = Number(optionalNumber(values.estimatedTotal));
        const advancePaid = Number(optionalNumber(values.advancePaid));
        const balanceDue = Math.max(estimatedTotal - advancePaid, 0);
        const order = await prisma.bulkOrder.create({
          data: {
            customerName: values.customerName,
            phone: values.phone,
            occasion: values.occasion || null,
            deliveryDate: optionalDate(values.deliveryDate),
            deliveryTime: values.deliveryTime || null,
            itemsSummary: values.itemsSummary,
            quantitySummary: values.quantitySummary || null,
            estimatedTotal: estimatedTotal.toFixed(2),
            advancePaid: advancePaid.toFixed(2),
            balanceDue: balanceDue.toFixed(2),
            status: (values.status || "ENQUIRY") as BulkOrderStatus,
            assignedToName: values.assignedToName || user.name,
            notes: values.notes || null
          }
        });
        await audit(moduleKey, "create", `${order.customerName} bulk order`, user.id, values);
        break;
      }
      case "holidays": {
        if (!values.name || !values.eventDate) throw new Error("Holiday name and date are required.");
        const holiday = await prisma.holidayPlan.create({
          data: {
            name: values.name,
            eventDate: optionalDate(values.eventDate),
            category: values.category || null,
            demandNotes: values.demandNotes || null,
            productionNotes: values.productionNotes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", holiday.name, user.id, values);
        break;
      }
      case "farmers": {
        const farmerId = String(values.farmerId || "");
        if (!farmerId) throw new Error("Create and select a farmer profile before adding daily milk.");
        const farmer = await prisma.farmer.findFirst({
          where: { id: farmerId, active: true }
        });
        if (!farmer) throw new Error("Selected farmer profile was not found or is inactive.");
        const total = Number(optionalNumber(values.quantityLitres)) * Number(optionalNumber(values.ratePerLitre));
        const paid = Number(optionalNumber(values.paidAmount));
        const collection = await prisma.milkCollection.create({
          data: {
            farmerId: farmer.id,
            collectionDate: optionalDate(values.collectionDate),
            session: (values.session || "MORNING") as never,
            quantityLitres: optionalNumber(values.quantityLitres),
            fat: values.fat ? optionalNumber(values.fat) : null,
            snf: values.snf ? optionalNumber(values.snf) : null,
            ratePerLitre: optionalNumber(values.ratePerLitre),
            totalAmount: total.toFixed(2),
            paidAmount: paid.toFixed(2),
            dueAmount: Math.max(total - paid, 0).toFixed(2),
            notes: values.notes || null
          }
        });
        const rawMilk = await prisma.inventoryItem.findFirst({ where: { name: "Raw Milk" } });
        if (rawMilk) {
          await prisma.stockMovement.create({
            data: {
              inventoryItemId: rawMilk.id,
              movementType: "IN",
              quantity: optionalNumber(values.quantityLitres),
              unitCost: optionalNumber(values.ratePerLitre),
              totalCost: total.toFixed(2),
              milkCollectionId: collection.id,
              notes: "Auto stock-in from farmer milk collection",
              createdById: user.id
            }
          });
        }
        await audit(moduleKey, "create", farmer.name, user.id, values);
        break;
      }
      case "invoices": {
        const settings = await prisma.businessSettings.findFirst();
        const invoiceCount = await prisma.invoice.count();
        const prefix = settings?.invoicePrefix ?? "NSS";
        const invoiceItems = parseInvoiceItems(values.invoiceItemsJson);
        const sweetBoxLines = calculateSweetBoxLines(invoiceItems);
        if (!values.customerName) throw new Error("Customer name is required.");
        if (invoiceItems.length === 0 && !values.itemSummary) throw new Error("Add at least one invoice item.");
        const subtotal = invoiceItems.length > 0 ? invoiceItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0) : Number(optionalNumber(values.subtotal));
        const discount = Number(optionalNumber(values.discountTotal));
        const tax =
          invoiceItems.length > 0
            ? invoiceItems.reduce((sum, item) => sum + (item.quantity * item.sellingPrice * item.taxRate) / 100, 0)
            : Number(optionalNumber(values.taxTotal));
        const total = Math.max(subtotal - discount + tax, 0);
        const paid = Number(optionalNumber(values.paidAmount));
        const due = Math.max(total - paid, 0);
        const customerId = `invoice-${String(values.customerPhone || values.customerName || Date.now()).replace(/\W+/g, "-").toLowerCase()}`;
        const customer = await prisma.customer.upsert({
          where: { id: customerId },
          update: {},
          create: {
            id: customerId,
            name: values.customerName,
            phone: values.customerPhone || ""
          }
        });
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `${prefix}-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, "0")}`,
            shareToken: shareToken(),
            customerId: customer.id,
            assignedToName: user.roleKey === "SUPER_ADMIN" ? values.assignedToName || user.name : user.name,
            issueDate: optionalDate(values.issueDate),
            subtotal: subtotal.toFixed(2),
            discountTotal: discount.toFixed(2),
            taxTotal: tax.toFixed(2),
            total: total.toFixed(2),
            paidAmount: paid.toFixed(2),
            dueAmount: due.toFixed(2),
            paymentMode: (values.paymentMode || "CASH") as PaymentMode,
            status: due === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
            notes: values.notes || null,
            cashierId: user.id,
            items: {
              create:
                invoiceItems.length > 0
                  ? [
                      ...invoiceItems.map((item) => {
                        const lineSubtotal = item.quantity * item.sellingPrice;
                        const lineTax = (lineSubtotal * item.taxRate) / 100;
                        return {
                          productId: item.id || null,
                          productName: item.sku ? `${item.name} (${item.sku})` : item.name,
                          quantity: item.quantity.toFixed(3),
                          unit: item.unit,
                          price: item.sellingPrice.toFixed(2),
                          discount: "0",
                          taxRate: item.taxRate.toFixed(2),
                          taxAmount: lineTax.toFixed(2),
                          lineTotal: (lineSubtotal + lineTax).toFixed(2)
                        };
                      }),
                      ...sweetBoxLines.map((box) => ({
                        productId: null,
                        productName: box.name,
                        quantity: box.quantity.toFixed(3),
                        unit: box.unit,
                        price: "0",
                        discount: "0",
                        taxRate: "0",
                        taxAmount: "0",
                        lineTotal: "0"
                      }))
                    ]
                  : {
                      productName: values.itemSummary,
                      quantity: "1",
                      unit: "PIECE",
                      price: subtotal.toFixed(2),
                      discount: discount.toFixed(2),
                      taxRate: "0",
                      taxAmount: tax.toFixed(2),
                      lineTotal: total.toFixed(2)
                    }
            }
          }
        });
        await recordSweetBoxStockOut(sweetBoxLines, invoice.invoiceNumber, user.id);
        if (due > 0) {
          await prisma.ledgerEntry.create({
            data: {
              ownerType: "CUSTOMER",
              entryType: "DEBIT",
              amount: due.toFixed(2),
              description: `Due amount for invoice ${invoice.invoiceNumber}`,
              customerId: customer.id,
              invoiceId: invoice.id
            }
          });
        }
        await audit(moduleKey, "create", invoice.invoiceNumber, user.id, values);
        break;
      }
      case "ledgers": {
        const ownerType = String(values.ownerType || "CUSTOMER") as LedgerOwnerType;
        const entryType = String(values.entryType || "DEBIT") as LedgerEntryType;
        const ownerName = String(values.ownerName || "").trim();
        if (!ownerName) throw new Error("Ledger owner name is required.");

        let customerId: string | undefined;
        let farmerId: string | undefined;
        let supplierId: string | undefined;

        if (ownerType === "CUSTOMER") {
          const customer =
            (await prisma.customer.findFirst({ where: { name: { equals: ownerName } } })) ??
            (await prisma.customer.create({ data: { id: `ledger-customer-${slug(ownerName)}`, name: ownerName, phone: "" } }));
          customerId = customer.id;
        }

        if (ownerType === "FARMER") {
          const farmer =
            (await prisma.farmer.findFirst({ where: { name: { equals: ownerName } } })) ??
            (await prisma.farmer.create({ data: { id: `ledger-farmer-${slug(ownerName)}`, name: ownerName, phone: "" } }));
          farmerId = farmer.id;
        }

        if (ownerType === "SUPPLIER") {
          const supplier =
            (await prisma.supplier.findFirst({ where: { name: { equals: ownerName } } })) ??
            (await prisma.supplier.create({ data: { id: `ledger-supplier-${slug(ownerName)}`, name: ownerName, phone: "" } }));
          supplierId = supplier.id;
        }

        await prisma.ledgerEntry.create({
          data: {
            ownerType,
            entryType,
            amount: optionalNumber(values.amount),
            entryDate: optionalDate(values.entryDate),
            description: values.description || `${entryType} entry for ${ownerName}`,
            customerId,
            farmerId,
            supplierId
          }
        });
        await audit(moduleKey, "create", ownerName, user.id, values);
        break;
      }
      case "payments":
      default:
        await audit(moduleKey, "create-request", `${moduleKey} manual entry`, user.id, values);
        break;
    }
  }

  revalidatePath(`/${moduleKey}`);
  revalidatePath("/dashboard");
  redirect(`/${moduleKey}?saved=1`);
}

