import { menuCategories } from "@/features/menu/menu-categories";

export type FieldType = "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type TableColumn = {
  key: string;
  label: string;
  type?: "text" | "money" | "number" | "date" | "status";
};

export type ModuleRow = Record<string, string | number | boolean | null | undefined>;

export type ModuleDefinition = {
  key: string;
  title: string;
  navTitle: string;
  description: string;
  category: "Core" | "Sales" | "Operations" | "People" | "Finance" | "System";
  href: string;
  icon: string;
  createLabel?: string;
  exportKey: string;
  columns: TableColumn[];
  fields: FormField[];
  fallbackRows: ModuleRow[];
};

const paymentModes = ["CASH", "UPI", "CARD", "BANK", "CREDIT", "MIXED", "OTHER"];
const units = ["KG", "GRAM", "PIECE", "BOX", "LITRE", "PACKET"];
const activeOptions = ["Active", "Inactive"];
const inventoryTypes = ["RAW_MATERIAL", "FINISHED_PRODUCT", "PACKAGING", "DISPOSABLE", "SHOP_SUPPLY"];
const bulkOrderStatuses = ["ENQUIRY", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
const holidayNames = [
  "Diwali",
  "Holi",
  "Lohri",
  "Raksha Bandhan",
  "Gurpurab",
  "Janmashtami",
  "Navratri",
  "Dussehra",
  "Karwa Chauth",
  "Eid",
  "Christmas",
  "New Year",
  "Republic Day",
  "Independence Day",
  "Wedding Season",
  "Other"
];
const holidayCategories = ["Festival", "National Holiday", "Local Event", "Wedding Season", "Religious Event", "Other"];

export const moduleDefinitions: ModuleDefinition[] = [
  {
    key: "business-settings",
    title: "Business Settings",
    navTitle: "Settings",
    description: "Owner-editable business profile, invoice identity, tax defaults, branch details, and brand color.",
    category: "Core",
    href: "/business-settings",
    icon: "settings",
    createLabel: "Update Settings",
    exportKey: "business-settings",
    columns: [
      { key: "businessName", label: "Business" },
      { key: "phone", label: "Phone" },
      { key: "whatsappNumber", label: "WhatsApp" },
      { key: "registeredNumber", label: "Registered No." },
      { key: "invoicePrefix", label: "Invoice Prefix" },
      { key: "currency", label: "Currency" },
      { key: "themeColor", label: "Theme" }
    ],
    fields: [
      { name: "businessName", label: "Business name", type: "text", required: true },
      { name: "logoUrl", label: "Logo URL", type: "text" },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "phone", label: "Phone number", type: "tel", required: true },
      { name: "whatsappNumber", label: "Business WhatsApp number", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "gstin", label: "GSTIN", type: "text" },
      { name: "fssaiLicense", label: "FSSAI/license number", type: "text" },
      { name: "registeredNumber", label: "Registered number for invoice", type: "text" },
      { name: "invoicePrefix", label: "Invoice prefix", type: "text", required: true },
      { name: "invoiceFooterTerms", label: "Invoice footer terms", type: "textarea" },
      { name: "invoiceAssignees", label: "Invoice assigned names", type: "textarea", placeholder: "One name per line for the relatives running billing" },
      { name: "upiPaymentDetails", label: "UPI/payment details text", type: "textarea" },
      { name: "currency", label: "Currency", type: "text", required: true },
      { name: "defaultTaxRate", label: "Default tax rate", type: "number" },
      { name: "themeColor", label: "Theme color", type: "text" },
      { name: "branchName", label: "Branch name", type: "text" },
      { name: "branchCode", label: "Branch code", type: "text" }
    ],
    fallbackRows: []
  },
  {
    key: "users",
    title: "Users and Roles",
    navTitle: "Users",
    description: "Create, edit, deactivate, and assign role-based access for agency, owner, and staff users.",
    category: "Core",
    href: "/users",
    icon: "users",
    createLabel: "Add User",
    exportKey: "users",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role", type: "status" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "INVENTORY_STAFF", "ACCOUNTANT", "READ_ONLY_STAFF"]
      },
      { name: "password", label: "Temporary password", type: "text", required: true },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "products",
    title: "Product Catalogue",
    navTitle: "Products",
    description: "Sweet shop and dairy catalogue with SKU, category, units, tax, margin, wholesale pricing, and low-stock links.",
    category: "Sales",
    href: "/products",
    icon: "package",
    createLabel: "Add Product",
    exportKey: "products",
    columns: [
      { key: "name", label: "Product" },
      { key: "category", label: "Menu Category" },
      { key: "sku", label: "Item Code" },
      { key: "sellingPrice", label: "Selling", type: "money" },
      { key: "costPrice", label: "Cost", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Product name", type: "text", required: true },
      { name: "category", label: "Menu category", type: "select", required: true, options: [...menuCategories] },
      { name: "sku", label: "Item code / SKU", type: "text", required: true },
      { name: "unit", label: "Unit", type: "select", required: true, options: units },
      { name: "sellingPrice", label: "Selling price", type: "number", required: true },
      { name: "costPrice", label: "Cost price", type: "number", required: true },
      { name: "taxRate", label: "Tax rate", type: "number" },
      { name: "wholesalePrice", label: "Wholesale price", type: "number" },
      { name: "festivalPrice", label: "Manual festival price", type: "number" },
      { name: "lowStockThreshold", label: "Low-stock threshold", type: "number" },
      { name: "imageUrl", label: "Product image URL", type: "text" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "invoices",
    title: "Invoices",
    navTitle: "Invoices",
    description: "Fast mobile-friendly billing with customer dues, payment status, PDF invoice, print view, and audit trail.",
    category: "Sales",
    href: "/invoices",
    icon: "receipt",
    createLabel: "Create Invoice",
    exportKey: "invoice-report",
    columns: [
      { key: "invoiceNumber", label: "Invoice" },
      { key: "customer", label: "Customer" },
      { key: "assignedToName", label: "Assigned To" },
      { key: "issueDate", label: "Date", type: "date" },
      { key: "total", label: "Total", type: "money" },
      { key: "paidAmount", label: "Paid", type: "money" },
      { key: "dueAmount", label: "Due", type: "money" },
      { key: "status", label: "Status", type: "status" }
    ],
    fields: [
      { name: "customerName", label: "Customer name", type: "text", required: true },
      { name: "customerPhone", label: "Customer phone", type: "tel" },
      { name: "issueDate", label: "Invoice date", type: "date", required: true },
      { name: "itemSummary", label: "Product summary", type: "textarea", required: true },
      { name: "subtotal", label: "Subtotal", type: "number", required: true },
      { name: "discountTotal", label: "Discount", type: "number" },
      { name: "taxTotal", label: "Tax", type: "number" },
      { name: "paidAmount", label: "Paid amount", type: "number" },
      { name: "paymentMode", label: "Payment mode", type: "select", options: paymentModes },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "bulk-orders",
    title: "Bulk Orders",
    navTitle: "Bulk Orders",
    description: "Advance orders for sweets, cakes, dairy, packed items, fast food, parties, weddings, and festival delivery.",
    category: "Sales",
    href: "/bulk-orders",
    icon: "package",
    createLabel: "Add Bulk Order",
    exportKey: "bulk-order-report",
    columns: [
      { key: "customerName", label: "Customer" },
      { key: "phone", label: "Phone" },
      { key: "occasion", label: "Occasion" },
      { key: "deliveryDate", label: "Delivery", type: "date" },
      { key: "estimatedTotal", label: "Total", type: "money" },
      { key: "advancePaid", label: "Advance", type: "money" },
      { key: "balanceDue", label: "Balance", type: "money" },
      { key: "status", label: "Status", type: "status" }
    ],
    fields: [
      { name: "customerName", label: "Customer name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "occasion", label: "Occasion", type: "text", placeholder: "Wedding, party, langar, festival..." },
      { name: "deliveryDate", label: "Delivery date", type: "date", required: true },
      { name: "deliveryTime", label: "Delivery time", type: "text", placeholder: "Morning, 5 PM, after ardas..." },
      {
        name: "itemsSummary",
        label: "Items ordered",
        type: "textarea",
        required: true,
        placeholder: "Example: Motichoor ladoo 20 kg, gulab jamun 10 kg, cake 2 pcs, packed namkeen 15 packets"
      },
      { name: "quantitySummary", label: "Packing and quantity notes", type: "textarea", placeholder: "Box sizes, tray count, delivery packing, disposable needs" },
      { name: "estimatedTotal", label: "Estimated total", type: "number" },
      { name: "advancePaid", label: "Advance paid", type: "number" },
      { name: "status", label: "Order status", type: "select", options: bulkOrderStatuses },
      { name: "assignedToName", label: "Assigned to", type: "text" },
      { name: "notes", label: "Internal notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "customers",
    title: "Customers",
    navTitle: "Customers",
    description: "Customer profiles, purchase history, opening balances, payment received entries, and due statements.",
    category: "Sales",
    href: "/customers",
    icon: "contact",
    createLabel: "Add Customer",
    exportKey: "customer-due-report",
    columns: [
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "openingBalance", label: "Opening", type: "money" },
      { key: "balance", label: "Balance", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "openingBalance", label: "Opening balance", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "ledgers",
    title: "Credit-Debit Ledgers",
    navTitle: "Ledgers",
    description: "Unified customer, farmer, and supplier debit-credit entries with date-wise statements and exports.",
    category: "Finance",
    href: "/ledgers",
    icon: "book",
    createLabel: "Add Ledger Entry",
    exportKey: "customer-ledger-report",
    columns: [
      { key: "ownerType", label: "Owner Type", type: "status" },
      { key: "owner", label: "Owner" },
      { key: "entryDate", label: "Date", type: "date" },
      { key: "entryType", label: "Type", type: "status" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { name: "ownerType", label: "Owner type", type: "select", required: true, options: ["CUSTOMER", "FARMER", "SUPPLIER"] },
      { name: "ownerName", label: "Owner name", type: "text", required: true },
      { name: "entryDate", label: "Date", type: "date", required: true },
      { name: "entryType", label: "Entry type", type: "select", required: true, options: ["CREDIT", "DEBIT"] },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ],
    fallbackRows: []
  },
  {
    key: "holidays",
    title: "Indian Holidays",
    navTitle: "Holidays",
    description: "Indian festival calendar with demand notes, production planning, bulk order readiness, and packaging prep.",
    category: "Operations",
    href: "/holidays",
    icon: "calendar-check",
    createLabel: "Add Holiday Plan",
    exportKey: "holiday-planning-report",
    columns: [
      { key: "name", label: "Holiday" },
      { key: "eventDate", label: "Date", type: "date" },
      { key: "category", label: "Category", type: "status" },
      { key: "demandNotes", label: "Demand Notes" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Holiday / event", type: "select", required: true, options: holidayNames },
      { name: "eventDate", label: "Event date", type: "date", required: true },
      { name: "category", label: "Category", type: "select", options: holidayCategories },
      { name: "demandNotes", label: "Demand notes", type: "textarea", placeholder: "Expected sweets, cakes, dairy, packed items, drinks, ice cream, fast food demand" },
      { name: "productionNotes", label: "Production and packaging notes", type: "textarea", placeholder: "Staffing, raw material, sweet boxes, napkins, disposables, delivery prep" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "inventory",
    title: "Inventory",
    navTitle: "Inventory",
    description: "Raw material, finished product, packaging, napkins, sweet boxes, disposables, shop supplies, stock in/out, wastage, batches, expiry, and valuation.",
    category: "Operations",
    href: "/inventory",
    icon: "warehouse",
    createLabel: "Add Stock Item",
    exportKey: "inventory-report",
    columns: [
      { key: "name", label: "Item" },
      { key: "type", label: "Type", type: "status" },
      { key: "currentQuantity", label: "Qty", type: "number" },
      { key: "unit", label: "Unit" },
      { key: "minimumQuantity", label: "Minimum", type: "number" },
      { key: "valuation", label: "Valuation", type: "money" }
    ],
    fields: [
      { name: "name", label: "Item name", type: "text", required: true },
      { name: "type", label: "Type", type: "select", required: true, options: inventoryTypes },
      { name: "unit", label: "Unit", type: "select", required: true, options: units },
      { name: "currentQuantity", label: "Current quantity", type: "number", required: true },
      { name: "minimumQuantity", label: "Minimum quantity", type: "number" },
      { name: "costPerUnit", label: "Cost per unit", type: "number" },
      { name: "supplierName", label: "Supplier", type: "text" },
      { name: "batchNumber", label: "Batch number", type: "text" },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "farmers",
    title: "Daily Milk Collection",
    navTitle: "Milk",
    description: "Daily morning/evening milk entries using saved farmer profiles, payable ledgers, monthly statements, and raw milk stock-in.",
    category: "Operations",
    href: "/farmers",
    icon: "milk",
    createLabel: "Add Daily Milk",
    exportKey: "farmer-milk-collection-report",
    columns: [
      { key: "farmer", label: "Farmer" },
      { key: "collectionDate", label: "Date", type: "date" },
      { key: "session", label: "Session", type: "status" },
      { key: "quantityLitres", label: "Litres", type: "number" },
      { key: "totalAmount", label: "Payable", type: "money" },
      { key: "dueAmount", label: "Due", type: "money" }
    ],
    fields: [
      { name: "collectionDate", label: "Collection date", type: "date", required: true },
      { name: "session", label: "Session", type: "select", required: true, options: ["MORNING", "EVENING"] },
      { name: "quantityLitres", label: "Quantity litres", type: "number", required: true },
      { name: "fat", label: "Fat", type: "number" },
      { name: "snf", label: "SNF", type: "number" },
      { name: "ratePerLitre", label: "Rate per litre", type: "number", required: true },
      { name: "paidAmount", label: "Advance paid", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "suppliers",
    title: "Suppliers",
    navTitle: "Suppliers",
    description: "Supplier contact database backup, purchase records, payments, payable ledger, and date-wise statements.",
    category: "Operations",
    href: "/suppliers",
    icon: "truck",
    createLabel: "Add Supplier",
    exportKey: "supplier-payable-report",
    columns: [
      { key: "name", label: "Supplier" },
      { key: "contactPerson", label: "Contact" },
      { key: "phone", label: "Phone" },
      { key: "whatsappNumber", label: "WhatsApp" },
      { key: "supplyCategories", label: "Supplies" },
      { key: "gstOrLicense", label: "GST/License" },
      { key: "openingBalance", label: "Opening", type: "money" },
      { key: "payable", label: "Payable", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Supplier name", type: "text", required: true },
      { name: "contactPerson", label: "Contact person", type: "text" },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "alternatePhone", label: "Alternate phone", type: "tel" },
      { name: "whatsappNumber", label: "WhatsApp number", type: "tel" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "gstOrLicense", label: "GST/license", type: "text" },
      { name: "supplyCategories", label: "Supply categories", type: "text", placeholder: "Milk, dry fruits, packaging..." },
      { name: "paymentTerms", label: "Payment terms", type: "text" },
      { name: "bankDetails", label: "Bank/UPI details", type: "textarea" },
      { name: "openingBalance", label: "Opening balance", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "employees",
    title: "Employees and Salaries",
    navTitle: "Employees",
    description: "Employee profiles, attendance, advances, salary calculation, payment history, and monthly statements.",
    category: "People",
    href: "/employees",
    icon: "id-card",
    createLabel: "Add Employee",
    exportKey: "employee-salary-report",
    columns: [
      { key: "name", label: "Employee" },
      { key: "phone", label: "Phone" },
      { key: "aadhaarNumber", label: "Aadhaar" },
      { key: "designation", label: "Designation" },
      { key: "salaryType", label: "Type", type: "status" },
      { key: "salaryRate", label: "Rate", type: "money" },
      { key: "absentsThisMonth", label: "Month Absents", type: "number" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Employee name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "aadhaarNumber", label: "Aadhaar card number", type: "text", required: true, placeholder: "12 digit Aadhaar number" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "joiningDate", label: "Joining date", type: "date", required: true },
      { name: "salaryType", label: "Salary type", type: "select", required: true, options: ["MONTHLY", "DAILY", "HOURLY"] },
      { name: "salaryRate", label: "Salary amount/rate", type: "number", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    fallbackRows: []
  },
  {
    key: "expenses",
    title: "Expenses and Profit",
    navTitle: "Expenses",
    description: "Daily expenses, categories, receipt references, cash closing, and profit/loss calculations.",
    category: "Finance",
    href: "/expenses",
    icon: "wallet",
    createLabel: "Add Expense",
    exportKey: "expense-report",
    columns: [
      { key: "category", label: "Category" },
      { key: "expenseDate", label: "Date", type: "date" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "paymentMode", label: "Mode", type: "status" },
      { key: "notes", label: "Notes" }
    ],
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: ["Milk purchase", "Sugar", "Ghee", "Dry fruits", "Raw material", "Packaging", "Staff salary", "Rent", "Electricity", "Gas/fuel", "Delivery", "Maintenance", "Marketing", "Miscellaneous"]
      },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "paymentMode", label: "Payment mode", type: "select", required: true, options: paymentModes },
      { name: "expenseDate", label: "Date", type: "date", required: true },
      { name: "receiptUrl", label: "Receipt attachment URL", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "payments",
    title: "Payments",
    navTitle: "Payments",
    description: "Unified inward and outward payments for invoices, customers, farmers, suppliers, employees, and expenses.",
    category: "Finance",
    href: "/payments",
    icon: "credit-card",
    createLabel: "Record Payment",
    exportKey: "payment-report",
    columns: [
      { key: "paymentFor", label: "For", type: "status" },
      { key: "party", label: "Party" },
      { key: "paymentDate", label: "Date", type: "date" },
      { key: "direction", label: "Direction", type: "status" },
      { key: "mode", label: "Mode", type: "status" },
      { key: "amount", label: "Amount", type: "money" }
    ],
    fields: [
      { name: "paymentFor", label: "Payment for", type: "select", required: true, options: ["CUSTOMER", "FARMER", "SUPPLIER", "EMPLOYEE", "EXPENSE", "INVOICE"] },
      { name: "party", label: "Party/name", type: "text", required: true },
      { name: "direction", label: "Direction", type: "select", required: true, options: ["IN", "OUT"] },
      { name: "mode", label: "Mode", type: "select", required: true, options: paymentModes },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "paymentDate", label: "Date", type: "date", required: true },
      { name: "referenceNumber", label: "Reference number", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    fallbackRows: []
  },
  {
    key: "reports",
    title: "Reports",
    navTitle: "Reports",
    description: "Sales, ledgers, stock, suppliers, milk, salaries, attendance, expenses, profit/loss, cash closing, and payments.",
    category: "Finance",
    href: "/reports",
    icon: "chart",
    exportKey: "reports",
    columns: [
      { key: "report", label: "Report" },
      { key: "module", label: "Module" },
      { key: "exports", label: "Exports" },
      { key: "filters", label: "Filters" }
    ],
    fields: [],
    fallbackRows: []
  },
  {
    key: "audit-logs",
    title: "Audit Logs",
    navTitle: "Audit",
    description: "Traceable logs for settings, invoices, payments, ledgers, stock, salaries, users, and destructive actions.",
    category: "System",
    href: "/audit-logs",
    icon: "shield",
    exportKey: "audit-logs",
    columns: [
      { key: "module", label: "Module" },
      { key: "action", label: "Action", type: "status" },
      { key: "recordTitle", label: "Record" },
      { key: "user", label: "User" },
      { key: "createdAt", label: "Time", type: "date" }
    ],
    fields: [],
    fallbackRows: []
  },
  {
    key: "backup",
    title: "Backup and Export",
    navTitle: "Backup",
    description: "Central data export hub plus Neon/Supabase backup and restore instructions for operations teams.",
    category: "System",
    href: "/backup",
    icon: "database",
    exportKey: "backup",
    columns: [
      { key: "item", label: "Backup Item" },
      { key: "format", label: "Format" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", type: "status" }
    ],
    fields: [],
    fallbackRows: []
  }
];

export function getModuleDefinition(key: string) {
  return moduleDefinitions.find((module) => module.key === key);
}

export const navigationModules = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    category: "Core"
  },
  {
    key: "menu",
    title: "Menu",
    href: "/menu",
    icon: "menu",
    category: "Sales"
  },
  {
    key: "pos",
    title: "POS",
    href: "/pos",
    icon: "receipt",
    category: "Sales"
  },
  ...moduleDefinitions.map((module) => ({
    key: module.key,
    title: module.navTitle,
    href: module.href,
    icon: module.icon,
    category: module.category
  })),
  {
    key: "admin",
    title: "Admin Control",
    href: "/admin",
    icon: "shield",
    category: "System"
  }
];
