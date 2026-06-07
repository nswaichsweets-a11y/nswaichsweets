export const LOCALE_COOKIE = "nss_locale";

export type Locale = "en" | "pa";

export const locales: { code: Locale; label: string; shortLabel: string }[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", shortLabel: "PA" }
];

const common = {
  en: {
    appSubtitle: "Business Management PWA",
    suiteName: "Sweets Suite",
    notifications: "Notifications",
    logout: "Logout",
    language: "Language",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    seededAccountHelp: "Use the owner or staff account created during database setup.",
    loginEyebrow: "Business suite",
    loginIntro:
      "Billing, inventory, ledgers, farmer milk collection, salaries, expenses, profit reports, exports, and owner-controlled business settings.",
    invalidLogin: "Login failed.",
    reset: "Reset",
    save: "Save",
    saved: "Saved",
    search: "Search",
    searchPlaceholder: "Search records...",
    noRecordsTitle: "No records found",
    noRecordsDescription: "Try a different search, adjust your filters, or create a new record.",
    showing: "Showing",
    of: "of",
    previous: "Previous",
    next: "Next",
    page: "Page",
    recordsPerPage: "Paginated at {count} records per page for mobile performance.",
    pdf: "PDF",
    csv: "CSV",
    reportsAndExports: "Reports and exports",
    fullReportsSuite: "Full business reporting suite",
    reportsDescription:
      "Every report supports date/search filters at the module level and can be generated on demand as PDF or CSV so heavy exports do not block page load.",
    ownerOverview: "Owner overview",
    businessPulse: "Today's business pulse",
    dashboardDescription:
      "Sales, dues, milk collection, stock alerts, expenses, salary dues, and reports are summarized with lightweight queries for fast mobile loading.",
    monthlyRevenue: "Monthly Revenue",
    monthlyRevenueDescription: "Separated from initial reports so dashboard stays fast.",
    expenseBreakdown: "Expense Breakdown",
    expenseBreakdownDescription: "Current operating cost mix.",
    recentInvoices: "Recent Invoices",
    recentExpenses: "Recent Expenses",
    recentMilkEntries: "Recent Milk Entries",
    backTo: "Back to",
    owner: "Owner",
    manager: "Manager",
    cashier: "Cashier",
    inventoryStaff: "Inventory Staff",
    accountant: "Accountant",
    readonlyStaff: "Read-only Staff",
    superAdmin: "Super Admin / Agency"
  },
  pa: {
    appSubtitle: "ਬਿਜ਼ਨਸ ਮੈਨੇਜਮੈਂਟ PWA",
    suiteName: "ਸਵੀਟਸ ਸੂਟ",
    notifications: "ਸੂਚਨਾਵਾਂ",
    logout: "ਲੌਗਆਉਟ",
    language: "ਭਾਸ਼ਾ",
    email: "ਈਮੇਲ",
    password: "ਪਾਸਵਰਡ",
    signIn: "ਲੌਗਇਨ ਕਰੋ",
    signingIn: "ਲੌਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
    seededAccountHelp: "ਡਾਟਾਬੇਸ ਸੈਟਅੱਪ ਦੌਰਾਨ ਬਣਿਆ ਮਾਲਕ ਜਾਂ ਸਟਾਫ ਖਾਤਾ ਵਰਤੋ।",
    loginEyebrow: "ਬਿਜ਼ਨਸ ਸੂਟ",
    loginIntro:
      "ਬਿਲਿੰਗ, ਇਨਵੈਂਟਰੀ, ਲੈਜ਼ਰ, ਕਿਸਾਨ ਦੁੱਧ ਇਕੱਠਾ, ਤਨਖਾਹਾਂ, ਖਰਚੇ, ਮੁਨਾਫਾ ਰਿਪੋਰਟਾਂ, ਐਕਸਪੋਰਟ ਅਤੇ ਮਾਲਕ ਸੈਟਿੰਗਾਂ।",
    invalidLogin: "ਲੌਗਇਨ ਫੇਲ੍ਹ ਹੋਇਆ।",
    reset: "ਰੀਸੈਟ",
    save: "ਸੇਵ ਕਰੋ",
    saved: "ਸੇਵ ਹੋ ਗਿਆ",
    search: "ਖੋਜੋ",
    searchPlaceholder: "ਰਿਕਾਰਡ ਖੋਜੋ...",
    noRecordsTitle: "ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ",
    noRecordsDescription: "ਹੋਰ ਖੋਜ ਕਰੋ, ਫਿਲਟਰ ਬਦਲੋ ਜਾਂ ਨਵਾਂ ਰਿਕਾਰਡ ਬਣਾਓ।",
    showing: "ਦਿਖਾਏ ਜਾ ਰਹੇ",
    of: "ਵਿੱਚੋਂ",
    previous: "ਪਿਛਲਾ",
    next: "ਅਗਲਾ",
    page: "ਪੰਨਾ",
    recordsPerPage: "ਮੋਬਾਈਲ ਪ੍ਰਦਰਸ਼ਨ ਲਈ ਹਰ ਪੰਨੇ ਤੇ {count} ਰਿਕਾਰਡ ਹਨ।",
    pdf: "PDF",
    csv: "CSV",
    reportsAndExports: "ਰਿਪੋਰਟਾਂ ਅਤੇ ਐਕਸਪੋਰਟ",
    fullReportsSuite: "ਪੂਰਾ ਬਿਜ਼ਨਸ ਰਿਪੋਰਟਿੰਗ ਸੂਟ",
    reportsDescription:
      "ਹਰ ਰਿਪੋਰਟ ਮਾਡਿਊਲ ਪੱਧਰ ਤੇ ਮਿਤੀ/ਖੋਜ ਫਿਲਟਰ ਸਹਾਇਤਾ ਕਰਦੀ ਹੈ ਅਤੇ PDF ਜਾਂ CSV ਰੂਪ ਵਿੱਚ ਮੰਗ ਤੇ ਬਣਦੀ ਹੈ।",
    ownerOverview: "ਮਾਲਕ ਓਵਰਵਿਊ",
    businessPulse: "ਅੱਜ ਦਾ ਬਿਜ਼ਨਸ ਹਾਲ",
    dashboardDescription:
      "ਵਿਕਰੀ, ਬਕਾਇਆ, ਦੁੱਧ ਇਕੱਠਾ, ਸਟਾਕ ਅਲਰਟ, ਖਰਚੇ, ਤਨਖਾਹ ਬਕਾਇਆ ਅਤੇ ਰਿਪੋਰਟਾਂ ਤੇਜ਼ ਮੋਬਾਈਲ ਲੋਡਿੰਗ ਲਈ ਸੰਖੇਪ ਕਵੈਰੀਆਂ ਨਾਲ ਦਿਖਾਈਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
    monthlyRevenue: "ਮਹੀਨਾਵਾਰ ਆਮਦਨ",
    monthlyRevenueDescription: "ਡੈਸ਼ਬੋਰਡ ਤੇਜ਼ ਰੱਖਣ ਲਈ ਭਾਰੀ ਰਿਪੋਰਟਾਂ ਤੋਂ ਵੱਖ।",
    expenseBreakdown: "ਖਰਚਾ ਵੇਰਵਾ",
    expenseBreakdownDescription: "ਮੌਜੂਦਾ ਓਪਰੇਸ਼ਨਲ ਖਰਚਾ ਮਿਲਾਪ।",
    recentInvoices: "ਤਾਜ਼ਾ ਇਨਵੌਇਸ",
    recentExpenses: "ਤਾਜ਼ਾ ਖਰਚੇ",
    recentMilkEntries: "ਤਾਜ਼ਾ ਦੁੱਧ ਐਂਟਰੀਆਂ",
    backTo: "ਵਾਪਸ",
    owner: "ਮਾਲਕ",
    manager: "ਮੈਨੇਜਰ",
    cashier: "ਕੈਸ਼ੀਅਰ",
    inventoryStaff: "ਇਨਵੈਂਟਰੀ ਸਟਾਫ",
    accountant: "ਅਕਾਊਂਟੈਂਟ",
    readonlyStaff: "ਰੀਡ-ਓਨਲੀ ਸਟਾਫ",
    superAdmin: "ਸੁਪਰ ਐਡਮਿਨ / ਏਜੰਸੀ"
  }
} as const;

export type TranslationKey = keyof typeof common.en;

const valueTranslations: Record<string, string> = {
  Active: "ਐਕਟਿਵ",
  Inactive: "ਇਨਐਕਟਿਵ",
  Paid: "ਭੁਗਤਾਨ ਹੋਇਆ",
  PAID: "ਭੁਗਤਾਨ ਹੋਇਆ",
  Partial: "ਅੱਧਾ ਭੁਗਤਾਨ",
  PARTIAL: "ਅੱਧਾ ਭੁਗਤਾਨ",
  Unpaid: "ਬਿਨਾਂ ਭੁਗਤਾਨ",
  UNPAID: "ਬਿਨਾਂ ਭੁਗਤਾਨ",
  Cancelled: "ਰੱਦ",
  CANCELLED: "ਰੱਦ",
  Pending: "ਬਕਾਇਆ",
  Morning: "ਸਵੇਰ",
  MORNING: "ਸਵੇਰ",
  Evening: "ਸ਼ਾਮ",
  EVENING: "ਸ਼ਾਮ",
  Cash: "ਨਕਦ",
  CASH: "ਨਕਦ",
  UPI: "UPI",
  Card: "ਕਾਰਡ",
  CARD: "ਕਾਰਡ",
  Bank: "ਬੈਂਕ",
  BANK: "ਬੈਂਕ",
  Credit: "ਕ੍ਰੈਡਿਟ",
  CREDIT: "ਕ੍ਰੈਡਿਟ",
  Mixed: "ਮਿਕਸ",
  MIXED: "ਮਿਕਸ",
  Other: "ਹੋਰ",
  OTHER: "ਹੋਰ",
  IN: "ਅੰਦਰ",
  OUT: "ਬਾਹਰ",
  CUSTOMER: "ਗਾਹਕ",
  FARMER: "ਕਿਸਾਨ",
  SUPPLIER: "ਸਪਲਾਇਰ",
  EMPLOYEE: "ਕਰਮਚਾਰੀ",
  EXPENSE: "ਖਰਚਾ",
  INVOICE: "ਇਨਵੌਇਸ",
  RAW_MATERIAL: "ਕੱਚਾ ਮਾਲ",
  FINISHED_PRODUCT: "ਤਿਆਰ ਸਮਾਨ",
  PACKAGING: "ਪੈਕਿੰਗ",
  DISPOSABLE: "ਡਿਸਪੋਜ਼ੇਬਲ",
  SHOP_SUPPLY: "ਦੁਕਾਨ ਸਮਾਨ",
  KG: "ਕਿਲੋ",
  GRAM: "ਗ੍ਰਾਮ",
  PIECE: "ਪੀਸ",
  BOX: "ਬਾਕਸ",
  LITRE: "ਲੀਟਰ",
  PACKET: "ਪੈਕਟ",
  MONTHLY: "ਮਹੀਨਾਵਾਰ",
  DAILY: "ਰੋਜ਼ਾਨਾ",
  HOURLY: "ਘੰਟਾਵਾਰ",
  PRESENT: "ਹਾਜ਼ਰ",
  ABSENT: "ਗੈਰਹਾਜ਼ਰ",
  HALF_DAY: "ਅੱਧਾ ਦਿਨ",
  LEAVE: "ਛੁੱਟੀ"
};

const categoryTranslations: Record<string, string> = {
  Core: "ਕੋਰ",
  Sales: "ਵਿਕਰੀ",
  Operations: "ਓਪਰੇਸ਼ਨ",
  People: "ਸਟਾਫ",
  Finance: "ਫਾਇਨੈਂਸ",
  System: "ਸਿਸਟਮ",
  Customers: "ਗਾਹਕ",
  Inventory: "ਇਨਵੈਂਟਰੀ",
  Suppliers: "ਸਪਲਾਇਰ",
  Farmers: "ਕਿਸਾਨ",
  Employees: "ਕਰਮਚਾਰੀ",
  Expenses: "ਖਰਚੇ"
};

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "pa" ? "pa" : "en";
}

export function t(locale: Locale, key: TranslationKey) {
  return common[locale][key] ?? common.en[key];
}

export function localizeValue(locale: Locale, value: unknown) {
  if (locale === "en") return String(value ?? "-").replaceAll("_", " ");
  const text = String(value ?? "-");
  return valueTranslations[text] ?? text.replaceAll("_", " ");
}

export function localizeCategory(locale: Locale, category: string) {
  if (locale === "en") return category;
  return categoryTranslations[category] ?? category;
}

export function roleLabelForLocale(locale: Locale, role: string) {
  const labels: Record<string, TranslationKey> = {
    SUPER_ADMIN: "superAdmin",
    OWNER: "owner",
    MANAGER: "manager",
    CASHIER: "cashier",
    INVENTORY_STAFF: "inventoryStaff",
    ACCOUNTANT: "accountant",
    READ_ONLY_STAFF: "readonlyStaff"
  };

  const key = labels[role];
  if (key) return t(locale, key);
  return role.replaceAll("_", " ");
}
