export type ReportDefinition = {
  key: string;
  title: string;
  module: string;
  sourceModuleKey: string;
  description: string;
  filters: string[];
};

export const reportDefinitions: ReportDefinition[] = [
  {
    key: "daily-sales-report",
    title: "Daily Sales Report",
    module: "Sales",
    sourceModuleKey: "invoices",
    description: "Daily invoice revenue, payment status, paid amount, and customer dues.",
    filters: ["Date range", "Payment mode", "Payment status"]
  },
  {
    key: "monthly-sales-report",
    title: "Monthly Sales Report",
    module: "Sales",
    sourceModuleKey: "invoices",
    description: "Monthly sales totals, invoice count, payments, and due amount.",
    filters: ["Month", "Customer", "Status"]
  },
  {
    key: "invoice-report",
    title: "Invoice Report",
    module: "Sales",
    sourceModuleKey: "invoices",
    description: "Invoice history with customer, date, amount, payment mode, and status.",
    filters: ["Date range", "Customer", "Status"]
  },
  {
    key: "bulk-order-report",
    title: "Bulk Order Report",
    module: "Sales",
    sourceModuleKey: "bulk-orders",
    description: "Advance and bulk order list with customer, delivery date, total, advance, balance, and preparation status.",
    filters: ["Delivery date", "Customer", "Status", "Occasion"]
  },
  {
    key: "product-sales-report",
    title: "Product Sales Report",
    module: "Sales",
    sourceModuleKey: "products",
    description: "Product catalogue and pricing data for sales analysis and margin review.",
    filters: ["Product", "Category", "Date range"]
  },
  {
    key: "customer-due-report",
    title: "Customer Due Report",
    module: "Customers",
    sourceModuleKey: "customers",
    description: "Customer balances and pending payment follow-up list.",
    filters: ["Customer", "Balance status", "Date range"]
  },
  {
    key: "customer-ledger-report",
    title: "Customer Ledger Report",
    module: "Customers",
    sourceModuleKey: "ledgers",
    description: "Customer debit-credit ledger statement with invoices and payments.",
    filters: ["Customer", "Date range", "Entry type"]
  },
  {
    key: "inventory-report",
    title: "Inventory Report",
    module: "Inventory",
    sourceModuleKey: "inventory",
    description: "Raw material and finished product stock quantities and valuation.",
    filters: ["Item", "Type", "Category"]
  },
  {
    key: "low-stock-report",
    title: "Low Stock Report",
    module: "Inventory",
    sourceModuleKey: "inventory",
    description: "Items near or below configured minimum quantity.",
    filters: ["Item", "Type", "Threshold"]
  },
  {
    key: "stock-movement-report",
    title: "Stock Movement Report",
    module: "Inventory",
    sourceModuleKey: "inventory",
    description: "Stock in, stock out, wastage, spoilage, and adjustments.",
    filters: ["Date range", "Movement type", "Item"]
  },
  {
    key: "supplier-purchase-report",
    title: "Supplier Purchase Report",
    module: "Suppliers",
    sourceModuleKey: "suppliers",
    description: "Supplier purchase and stock-in activity.",
    filters: ["Supplier", "Date range", "Item"]
  },
  {
    key: "supplier-payable-report",
    title: "Supplier Payable Report",
    module: "Suppliers",
    sourceModuleKey: "suppliers",
    description: "Supplier outstanding payable balances.",
    filters: ["Supplier", "Payment status", "Date range"]
  },
  {
    key: "supplier-ledger-report",
    title: "Supplier Ledger Report",
    module: "Suppliers",
    sourceModuleKey: "ledgers",
    description: "Supplier debit-credit statement with purchase and payment entries.",
    filters: ["Supplier", "Date range", "Entry type"]
  },
  {
    key: "holiday-planning-report",
    title: "Holiday Planning Report",
    module: "Operations",
    sourceModuleKey: "holidays",
    description: "Indian holiday and festival planning notes for production, demand, packaging, and bulk order readiness.",
    filters: ["Holiday", "Date range", "Category", "Status"]
  },
  {
    key: "farmer-milk-collection-report",
    title: "Farmer Milk Collection Report",
    module: "Farmers",
    sourceModuleKey: "farmers",
    description: "Date-wise and farmer-wise milk collection with litres, fat, SNF, rate, and amount.",
    filters: ["Date range", "Farmer", "Session"]
  },
  {
    key: "farmer-payment-report",
    title: "Farmer Payment Report",
    module: "Farmers",
    sourceModuleKey: "payments",
    description: "Payments made to farmers and pending collection dues.",
    filters: ["Farmer", "Payment mode", "Date range"]
  },
  {
    key: "farmer-ledger-report",
    title: "Farmer Ledger Report",
    module: "Farmers",
    sourceModuleKey: "ledgers",
    description: "Farmer payable, advance paid, and balance statements.",
    filters: ["Farmer", "Date range", "Entry type"]
  },
  {
    key: "employee-salary-report",
    title: "Employee Salary Report",
    module: "Employees",
    sourceModuleKey: "employees",
    description: "Salary type, base salary, advances, payments, and pending salary dues.",
    filters: ["Employee", "Month", "Payment status"]
  },
  {
    key: "attendance-report",
    title: "Attendance Report",
    module: "Employees",
    sourceModuleKey: "employees",
    description: "Employee-wise attendance status and work hours.",
    filters: ["Employee", "Date range", "Status"]
  },
  {
    key: "expense-report",
    title: "Expense Report",
    module: "Expenses",
    sourceModuleKey: "expenses",
    description: "Daily, monthly, and category-wise expenses.",
    filters: ["Date range", "Category", "Payment mode"]
  },
  {
    key: "profit-loss-report",
    title: "Profit/Loss Report",
    module: "Finance",
    sourceModuleKey: "expenses",
    description: "Sales revenue minus product costs, expenses, salary payments, supplier purchases, and farmer payments.",
    filters: ["Date range", "Category", "Branch"]
  },
  {
    key: "cash-closing-report",
    title: "Cash Closing Report",
    module: "Finance",
    sourceModuleKey: "payments",
    description: "Cash inflow, cash outflow, invoice payments, expenses, and closing balance.",
    filters: ["Date", "Payment mode", "Counter"]
  },
  {
    key: "payment-report",
    title: "Payment Report",
    module: "Finance",
    sourceModuleKey: "payments",
    description: "Unified inward and outward payments across customers, farmers, suppliers, employees, expenses, and invoices.",
    filters: ["Date range", "Payment for", "Payment mode"]
  }
];

export function getReportDefinition(key: string) {
  return reportDefinitions.find((report) => report.key === key);
}
