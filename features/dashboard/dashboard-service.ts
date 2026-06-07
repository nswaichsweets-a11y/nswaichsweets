import { withDatabase } from "@/lib/db/client";

export type DashboardMetric = {
  title: string;
  value: number;
  kind: "money" | "number";
  subtitle: string;
  icon: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type DashboardSummary = {
  metrics: DashboardMetric[];
  recentInvoices: { invoiceNumber: string; customer: string; total: number; status: string }[];
  recentExpenses: { category: string; amount: number; date: string }[];
  recentMilkEntries: { farmer: string; litres: number; session: string; payable: number }[];
  revenueSeries: { label: string; amount: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  quickActions: { label: string; href: string; icon: string }[];
  readiness: { title: string; description: string; complete: boolean; href: string; action: string }[];
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

const fallbackSummary: DashboardSummary = {
  metrics: [
    { title: "Today's sales", value: 0, kind: "money", subtitle: "Invoices raised today", icon: "receipt", tone: "success" },
    { title: "Today's expenses", value: 0, kind: "money", subtitle: "Operational spend", icon: "wallet", tone: "success" },
    { title: "Today's profit", value: 0, kind: "money", subtitle: "Estimated after expenses", icon: "chart", tone: "success" },
    { title: "Monthly sales", value: 0, kind: "money", subtitle: "Current month revenue", icon: "receipt" },
    { title: "Pending customer dues", value: 0, kind: "money", subtitle: "Open customer ledger", icon: "contact", tone: "success" },
    { title: "Pending farmer payments", value: 0, kind: "money", subtitle: "Milk payable balance", icon: "milk", tone: "success" },
    { title: "Milk collected today", value: 0, kind: "number", subtitle: "Litres from farmers", icon: "milk", tone: "success" },
    { title: "Low stock alerts", value: 0, kind: "number", subtitle: "Items below threshold", icon: "warehouse", tone: "success" }
  ],
  recentInvoices: [],
  recentExpenses: [],
  recentMilkEntries: [],
  revenueSeries: [
    { label: "Jan", amount: 0 },
    { label: "Feb", amount: 0 },
    { label: "Mar", amount: 0 },
    { label: "Apr", amount: 0 },
    { label: "May", amount: 0 },
    { label: "Jun", amount: 0 }
  ],
  expenseBreakdown: [],
  quickActions: [
    { label: "Create Invoice", href: "/invoices/new", icon: "receipt" },
    { label: "Add Milk Entry", href: "/farmers/new", icon: "milk" },
    { label: "Add Expense", href: "/expenses/new", icon: "wallet" },
    { label: "Stock Entry", href: "/inventory/new", icon: "warehouse" }
  ],
  readiness: [
    {
      title: "Business profile",
      description: "Add address, phone, invoice terms, tax, and payment details.",
      complete: false,
      href: "/business-settings/new",
      action: "Update settings"
    },
    {
      title: "Menu catalogue",
      description: "Add real menu categories, item codes, prices, units, and tax rates.",
      complete: false,
      href: "/products/new",
      action: "Add menu item"
    },
    {
      title: "Staff accounts",
      description: "Confirm owner, cashier, accountant, and inventory access.",
      complete: false,
      href: "/users",
      action: "Review users"
    },
    {
      title: "Production URL",
      description: "Set NEXT_PUBLIC_APP_URL after the final domain is connected.",
      complete: false,
      href: "/backup",
      action: "Deployment notes"
    }
  ]
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return withDatabase(async (client) => {
    const [
      todaySales,
      monthSales,
      todayExpenses,
      monthExpenses,
      invoiceDues,
      farmerDues,
      supplierDues,
      milkToday,
      salaryDues,
      recentInvoices,
      recentExpenses,
      recentMilkEntries,
      inventoryItems,
      settings,
      productCount,
      activeUserCount
    ] = await Promise.all([
      client.invoice.aggregate({ where: { issueDate: { gte: startOfDay }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      client.invoice.aggregate({ where: { issueDate: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      client.expense.aggregate({ where: { expenseDate: { gte: startOfDay }, deletedAt: null }, _sum: { amount: true } }),
      client.expense.aggregate({ where: { expenseDate: { gte: startOfMonth }, deletedAt: null }, _sum: { amount: true } }),
      client.invoice.aggregate({ where: { status: { in: ["PARTIAL", "UNPAID"] } }, _sum: { dueAmount: true } }),
      client.milkCollection.aggregate({ _sum: { dueAmount: true } }),
      client.supplier.aggregate({ _sum: { openingBalance: true } }),
      client.milkCollection.aggregate({ where: { collectionDate: { gte: startOfDay } }, _sum: { quantityLitres: true } }),
      client.salaryPayment.aggregate({ _sum: { pendingAmount: true } }),
      client.invoice.findMany({ take: 5, include: { customer: true }, orderBy: { issueDate: "desc" } }),
      client.expense.findMany({ take: 5, orderBy: { expenseDate: "desc" } }),
      client.milkCollection.findMany({ take: 5, include: { farmer: true }, orderBy: { collectionDate: "desc" } }),
      client.inventoryItem.findMany({ take: 20, where: { active: true } }),
      client.businessSettings.findFirst(),
      client.product.count({ where: { active: true } }),
      client.user.count({ where: { active: true } })
    ]);

    const todaySalesAmount = decimal(todaySales._sum.total);
    const todayExpenseAmount = decimal(todayExpenses._sum.amount);
    const monthSalesAmount = decimal(monthSales._sum.total);
    const monthExpenseAmount = decimal(monthExpenses._sum.amount);
    const lowStockCount = inventoryItems.filter((item) => decimal(item.currentQuantity) <= decimal(item.minimumQuantity)).length;

    return {
      metrics: [
        { title: "Today's sales", value: todaySalesAmount, kind: "money", subtitle: "Invoices raised today", icon: "receipt", tone: "success" },
        { title: "Today's expenses", value: todayExpenseAmount, kind: "money", subtitle: "Operational spend", icon: "wallet", tone: "warning" },
        { title: "Today's profit", value: todaySalesAmount - todayExpenseAmount, kind: "money", subtitle: "Sales minus expenses", icon: "chart", tone: todaySalesAmount >= todayExpenseAmount ? "success" : "danger" },
        { title: "Monthly sales", value: monthSalesAmount, kind: "money", subtitle: "Current month revenue", icon: "receipt" },
        { title: "Monthly expenses", value: monthExpenseAmount, kind: "money", subtitle: "Current month spend", icon: "wallet" },
        { title: "Monthly profit", value: monthSalesAmount - monthExpenseAmount, kind: "money", subtitle: "Estimated current month", icon: "chart", tone: monthSalesAmount >= monthExpenseAmount ? "success" : "danger" },
        { title: "Pending customer dues", value: decimal(invoiceDues._sum.dueAmount), kind: "money", subtitle: "Open invoice dues", icon: "contact", tone: "warning" },
        { title: "Pending farmer payments", value: decimal(farmerDues._sum.dueAmount), kind: "money", subtitle: "Milk payable balance", icon: "milk", tone: "warning" },
        { title: "Pending supplier payments", value: decimal(supplierDues._sum.openingBalance), kind: "money", subtitle: "Supplier opening payable", icon: "truck", tone: "warning" },
        { title: "Milk collected today", value: decimal(milkToday._sum.quantityLitres), kind: "number", subtitle: "Litres from farmers", icon: "milk", tone: "success" },
        { title: "Low stock alerts", value: lowStockCount, kind: "number", subtitle: "Items below threshold", icon: "warehouse", tone: lowStockCount > 0 ? "danger" : "success" },
        { title: "Salary dues", value: decimal(salaryDues._sum.pendingAmount), kind: "money", subtitle: "Pending salary payments", icon: "id-card", tone: "warning" }
      ],
      recentInvoices: recentInvoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name ?? "Walk-in",
        total: decimal(invoice.total),
        status: invoice.status
      })),
      recentExpenses: recentExpenses.map((expense) => ({
        category: expense.category,
        amount: decimal(expense.amount),
        date: expense.expenseDate.toISOString()
      })),
      recentMilkEntries: recentMilkEntries.map((entry) => ({
        farmer: entry.farmer.name,
        litres: decimal(entry.quantityLitres),
        session: entry.session,
        payable: decimal(entry.totalAmount)
      })),
      revenueSeries: fallbackSummary.revenueSeries.slice(-6),
      expenseBreakdown: fallbackSummary.expenseBreakdown,
      quickActions: fallbackSummary.quickActions,
      readiness: [
        {
          title: "Business profile",
          description: "Address, phone, invoice terms, tax, and payment details are ready.",
          complete: Boolean(settings?.address?.trim() && settings?.phone?.trim()),
          href: "/business-settings/new",
          action: "Update settings"
        },
        {
          title: "Menu catalogue",
          description: `${productCount} active menu item${productCount === 1 ? "" : "s"} available for invoicing.`,
          complete: productCount > 0,
          href: "/products/new",
          action: "Add menu item"
        },
        {
          title: "Staff accounts",
          description: `${activeUserCount} active user account${activeUserCount === 1 ? "" : "s"} configured.`,
          complete: activeUserCount > 1,
          href: "/users",
          action: "Review users"
        },
        {
          title: "Production URL",
          description: process.env.NEXT_PUBLIC_APP_URL ? `Configured as ${process.env.NEXT_PUBLIC_APP_URL}` : "Set NEXT_PUBLIC_APP_URL after connecting the domain.",
          complete: Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") && !process.env.NEXT_PUBLIC_APP_URL.includes("your-domain")),
          href: "/backup",
          action: "Deployment notes"
        }
      ]
    };
  }, fallbackSummary);
}
