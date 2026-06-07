import type { PrismaClient } from "@prisma/client";
import { prisma, withDatabase } from "@/lib/db/client";
import { formatDate } from "@/lib/utils/format";
import { getModuleDefinition, type ModuleRow } from "./module-definitions";

export type ModuleListResult = {
  rows: ModuleRow[];
  total: number;
  page: number;
  pageSize: number;
};

type ListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  return Number(value ?? 0);
}

function textSearch(search: string | undefined, fields: string[]) {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search
      }
    }))
  };
}

function filterFallbackRows(rows: ModuleRow[], search?: string) {
  if (!search) return rows;
  const needle = search.toLowerCase();
  return rows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)));
}

function ownerName(entry: {
  customer?: { name: string } | null;
  farmer?: { name: string } | null;
  supplier?: { name: string } | null;
}) {
  return entry.customer?.name ?? entry.farmer?.name ?? entry.supplier?.name ?? "Unlinked";
}

function partyName(entry: {
  customer?: { name: string } | null;
  farmer?: { name: string } | null;
  supplier?: { name: string } | null;
  employee?: { name: string } | null;
  invoice?: { invoiceNumber: string } | null;
}) {
  return entry.customer?.name ?? entry.farmer?.name ?? entry.supplier?.name ?? entry.employee?.name ?? entry.invoice?.invoiceNumber ?? "General";
}

function monthStartDate(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

export async function listModuleRecords(key: string, options: ListOptions = {}): Promise<ModuleListResult> {
  const definition = getModuleDefinition(key);
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, options.pageSize ?? 10));
  const skip = (page - 1) * pageSize;
  const fallbackRows = filterFallbackRows([], options.search);
  const fallback = {
    rows: fallbackRows.slice(skip, skip + pageSize),
    total: fallbackRows.length,
    page,
    pageSize
  };

  if (!definition || !prisma) return fallback;

  return withDatabase(async (client) => {
    const rows = await fetchModuleRows(client, key, options.search, skip, pageSize);
    const total = await countModuleRows(client, key, options.search);
    return { rows, total, page, pageSize };
  }, fallback);
}

async function countModuleRows(client: PrismaClient, key: string, search?: string) {
  switch (key) {
    case "business-settings":
      return client.businessSettings.count();
    case "users":
      return client.user.count({ where: textSearch(search, ["name", "email", "phone"]) as never });
    case "products":
      return client.product.count({ where: textSearch(search, ["name", "category", "sku"]) as never });
    case "invoices":
      return client.invoice.count({
        where: search
          ? {
              OR: [
                { invoiceNumber: { contains: search } },
                { customer: { name: { contains: search } } }
              ]
            }
          : undefined
      });
    case "bulk-orders":
      return client.bulkOrder.count({
        where: search
          ? {
              OR: [
                { customerName: { contains: search } },
                { phone: { contains: search } },
                { occasion: { contains: search } },
                { itemsSummary: { contains: search } }
              ]
            }
          : undefined
      });
    case "customers":
      return client.customer.count({ where: textSearch(search, ["name", "phone", "email"]) as never });
    case "ledgers":
      return client.ledgerEntry.count({
        where: search
          ? {
              OR: [
                { description: { contains: search } },
                { customer: { name: { contains: search } } },
                { farmer: { name: { contains: search } } },
                { supplier: { name: { contains: search } } }
              ]
            }
          : undefined
      });
    case "holidays":
      return client.holidayPlan.count({ where: textSearch(search, ["name", "category", "demandNotes", "productionNotes"]) as never });
    case "inventory":
      return client.inventoryItem.count({ where: textSearch(search, ["name", "batchNumber", "notes"]) as never });
    case "farmers":
      return client.milkCollection.count({
        where: search ? { farmer: { name: { contains: search } } } : undefined
      });
    case "suppliers":
      return client.supplier.count({ where: textSearch(search, ["name", "contactPerson", "phone", "alternatePhone", "whatsappNumber", "email", "gstOrLicense", "supplyCategories"]) as never });
    case "employees":
      return client.employee.count({ where: textSearch(search, ["name", "phone", "designation"]) as never });
    case "expenses":
      return client.expense.count({ where: textSearch(search, ["category", "notes"]) as never });
    case "payments":
      return client.payment.count({
        where: search
          ? {
              OR: [
                { referenceNumber: { contains: search } },
                { notes: { contains: search } },
                { customer: { name: { contains: search } } },
                { farmer: { name: { contains: search } } },
                { supplier: { name: { contains: search } } },
                { employee: { name: { contains: search } } }
              ]
            }
          : undefined
      });
    case "audit-logs":
      return client.auditLog.count({ where: textSearch(search, ["module", "action", "recordTitle"]) as never });
    default:
      return 0;
  }
}

async function fetchModuleRows(client: PrismaClient, key: string, search: string | undefined, skip: number, take: number) {
  switch (key) {
    case "business-settings": {
      const settings = await client.businessSettings.findMany({
        orderBy: { updatedAt: "desc" },
        skip,
        take
      });
      return settings.map((setting) => ({
        businessName: setting.businessName,
        phone: setting.phone,
        whatsappNumber: setting.whatsappNumber ?? "-",
        registeredNumber: setting.registeredNumber ?? setting.gstin ?? setting.fssaiLicense ?? "-",
        invoicePrefix: setting.invoicePrefix,
        currency: setting.currency,
        themeColor: setting.themeColor
      }));
    }
    case "users": {
      const users = await client.user.findMany({
        where: textSearch(search, ["name", "email", "phone"]) as never,
        include: { role: true },
        orderBy: { createdAt: "desc" },
        skip,
        take
      });
      return users.map((user) => ({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "-",
        role: user.role.name,
        active: user.active ? "Active" : "Inactive"
      }));
    }
    case "products": {
      const products = await client.product.findMany({
        where: textSearch(search, ["name", "category", "sku"]) as never,
        orderBy: { name: "asc" },
        skip,
        take
      });
      return products.map((product) => ({
        name: product.name,
        category: product.category,
        sku: product.sku,
        sellingPrice: decimal(product.sellingPrice),
        costPrice: decimal(product.costPrice),
        active: product.active ? "Active" : "Inactive"
      }));
    }
    case "invoices": {
      const invoices = await client.invoice.findMany({
        where: search
          ? {
              OR: [
                { invoiceNumber: { contains: search } },
                { customer: { name: { contains: search } } }
              ]
            }
          : undefined,
        include: { customer: true },
        orderBy: { issueDate: "desc" },
        skip,
        take
      });
      return invoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name ?? "Walk-in",
        assignedToName: invoice.assignedToName ?? "-",
        issueDate: invoice.issueDate.toISOString(),
        total: decimal(invoice.total),
        paidAmount: decimal(invoice.paidAmount),
        dueAmount: decimal(invoice.dueAmount),
        status: invoice.status
      }));
    }
    case "bulk-orders": {
      const orders = await client.bulkOrder.findMany({
        where: search
          ? {
              OR: [
                { customerName: { contains: search } },
                { phone: { contains: search } },
                { occasion: { contains: search } },
                { itemsSummary: { contains: search } }
              ]
            }
          : undefined,
        orderBy: { deliveryDate: "asc" },
        skip,
        take
      });
      return orders.map((order) => ({
        customerName: order.customerName,
        phone: order.phone,
        occasion: order.occasion ?? "-",
        deliveryDate: order.deliveryDate.toISOString(),
        estimatedTotal: decimal(order.estimatedTotal),
        advancePaid: decimal(order.advancePaid),
        balanceDue: decimal(order.balanceDue),
        status: order.status
      }));
    }
    case "customers": {
      const customers = await client.customer.findMany({
        where: textSearch(search, ["name", "phone", "email"]) as never,
        orderBy: { name: "asc" },
        skip,
        take
      });
      return customers.map((customer) => ({
        name: customer.name,
        phone: customer.phone,
        openingBalance: decimal(customer.openingBalance),
        balance: decimal(customer.openingBalance),
        active: customer.active ? "Active" : "Inactive"
      }));
    }
    case "ledgers": {
      const entries = await client.ledgerEntry.findMany({
        where: search
          ? {
              OR: [
                { description: { contains: search } },
                { customer: { name: { contains: search } } },
                { farmer: { name: { contains: search } } },
                { supplier: { name: { contains: search } } }
              ]
            }
          : undefined,
        include: { customer: true, farmer: true, supplier: true },
        orderBy: { entryDate: "desc" },
        skip,
        take
      });
      return entries.map((entry) => ({
        ownerType: entry.ownerType,
        owner: ownerName(entry),
        entryDate: entry.entryDate.toISOString(),
        entryType: entry.entryType,
        amount: decimal(entry.amount),
        description: entry.description
      }));
    }
    case "holidays": {
      const holidays = await client.holidayPlan.findMany({
        where: textSearch(search, ["name", "category", "demandNotes", "productionNotes"]) as never,
        orderBy: { eventDate: "asc" },
        skip,
        take
      });
      return holidays.map((holiday) => ({
        name: holiday.name,
        eventDate: holiday.eventDate.toISOString(),
        category: holiday.category ?? "-",
        demandNotes: holiday.demandNotes ?? "-",
        active: holiday.active ? "Active" : "Inactive"
      }));
    }
    case "inventory": {
      const items = await client.inventoryItem.findMany({
        where: textSearch(search, ["name", "batchNumber", "notes"]) as never,
        orderBy: { name: "asc" },
        skip,
        take
      });
      return items.map((item) => ({
        name: item.name,
        type: item.type,
        currentQuantity: decimal(item.currentQuantity),
        unit: item.unit,
        minimumQuantity: decimal(item.minimumQuantity),
        valuation: decimal(item.currentQuantity) * decimal(item.costPerUnit)
      }));
    }
    case "farmers": {
      const entries = await client.milkCollection.findMany({
        where: search ? { farmer: { name: { contains: search } } } : undefined,
        include: { farmer: true },
        orderBy: { collectionDate: "desc" },
        skip,
        take
      });
      return entries.map((entry) => ({
        farmer: entry.farmer.name,
        collectionDate: entry.collectionDate.toISOString(),
        session: entry.session,
        quantityLitres: decimal(entry.quantityLitres),
        totalAmount: decimal(entry.totalAmount),
        dueAmount: decimal(entry.dueAmount)
      }));
    }
    case "suppliers": {
      const suppliers = await client.supplier.findMany({
        where: textSearch(search, ["name", "contactPerson", "phone", "alternatePhone", "whatsappNumber", "email", "gstOrLicense", "supplyCategories"]) as never,
        orderBy: { name: "asc" },
        skip,
        take
      });
      const supplierIds = suppliers.map((supplier) => supplier.id);
      const ledgerEntries =
        supplierIds.length > 0
          ? await client.ledgerEntry.findMany({
              where: { supplierId: { in: supplierIds } },
              select: { supplierId: true, entryType: true, amount: true }
            })
          : [];
      const ledgerBalance = new Map<string, number>();
      for (const entry of ledgerEntries) {
        if (!entry.supplierId) continue;
        const amount = decimal(entry.amount);
        const current = ledgerBalance.get(entry.supplierId) ?? 0;
        ledgerBalance.set(entry.supplierId, current + (entry.entryType === "DEBIT" ? amount : -amount));
      }
      return suppliers.map((supplier) => ({
        name: supplier.name,
        contactPerson: supplier.contactPerson ?? "-",
        phone: supplier.phone,
        whatsappNumber: supplier.whatsappNumber ?? "-",
        supplyCategories: supplier.supplyCategories ?? "-",
        gstOrLicense: supplier.gstOrLicense ?? "-",
        openingBalance: decimal(supplier.openingBalance),
        payable: decimal(supplier.openingBalance) + (ledgerBalance.get(supplier.id) ?? 0),
        active: supplier.active ? "Active" : "Inactive"
      }));
    }
    case "employees": {
      const employees = await client.employee.findMany({
        where: textSearch(search, ["name", "phone", "designation"]) as never,
        orderBy: { name: "asc" },
        skip,
        take
      });
      const employeeIds = employees.map((employee) => employee.id);
      const absences =
        employeeIds.length > 0
          ? await client.attendance.groupBy({
              by: ["employeeId"],
              where: {
                employeeId: { in: employeeIds },
                status: "ABSENT",
                date: { gte: monthStartDate() }
              },
              _count: { employeeId: true }
            })
          : [];
      const absenceMap = new Map(absences.map((absence) => [absence.employeeId, absence._count.employeeId]));
      return employees.map((employee) => ({
        name: employee.name,
        phone: employee.phone,
        aadhaarNumber: employee.aadhaarNumber ? `XXXX-XXXX-${employee.aadhaarNumber.slice(-4)}` : "-",
        designation: employee.designation,
        salaryType: employee.salaryType,
        salaryRate: decimal(employee.salaryRate),
        absentsThisMonth: absenceMap.get(employee.id) ?? 0,
        active: employee.active ? "Active" : "Inactive"
      }));
    }
    case "expenses": {
      const expenses = await client.expense.findMany({
        where: textSearch(search, ["category", "notes"]) as never,
        orderBy: { expenseDate: "desc" },
        skip,
        take
      });
      return expenses.map((expense) => ({
        category: expense.category,
        expenseDate: expense.expenseDate.toISOString(),
        amount: decimal(expense.amount),
        paymentMode: expense.paymentMode,
        notes: expense.notes ?? "-"
      }));
    }
    case "payments": {
      const payments = await client.payment.findMany({
        where: search
          ? {
              OR: [
                { referenceNumber: { contains: search } },
                { notes: { contains: search } },
                { customer: { name: { contains: search } } },
                { farmer: { name: { contains: search } } },
                { supplier: { name: { contains: search } } },
                { employee: { name: { contains: search } } }
              ]
            }
          : undefined,
        include: { customer: true, farmer: true, supplier: true, employee: true, invoice: true },
        orderBy: { paymentDate: "desc" },
        skip,
        take
      });
      return payments.map((payment) => ({
        paymentFor: payment.paymentFor,
        party: partyName(payment),
        paymentDate: payment.paymentDate.toISOString(),
        direction: payment.direction,
        mode: payment.mode,
        amount: decimal(payment.amount)
      }));
    }
    case "audit-logs": {
      const logs = await client.auditLog.findMany({
        where: textSearch(search, ["module", "action", "recordTitle"]) as never,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take
      });
      return logs.map((log) => ({
        module: log.module,
        action: log.action,
        recordTitle: log.recordTitle ?? log.recordId ?? "-",
        user: log.user?.name ?? "System",
        createdAt: formatDate(log.createdAt)
      }));
    }
    default:
      return filterFallbackRows([], search).slice(skip, skip + take);
  }
}

