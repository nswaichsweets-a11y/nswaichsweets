import type { Locale } from "@/lib/i18n/dictionary";
import type { ModuleDefinition } from "./module-definitions";

const moduleText: Record<string, { title: string; navTitle: string; description: string; createLabel?: string }> = {
  "business-settings": {
    title: "ਬਿਜ਼ਨਸ ਸੈਟਿੰਗਾਂ",
    navTitle: "ਸੈਟਿੰਗਾਂ",
    description: "ਮਾਲਕ ਵੱਲੋਂ ਬਦਲਣਯੋਗ ਬਿਜ਼ਨਸ ਪ੍ਰੋਫਾਈਲ, ਇਨਵੌਇਸ ਪਹਿਚਾਣ, ਟੈਕਸ, ਬ੍ਰਾਂਚ ਅਤੇ ਬ੍ਰਾਂਡ ਰੰਗ।",
    createLabel: "ਸੈਟਿੰਗਾਂ ਅਪਡੇਟ ਕਰੋ"
  },
  users: {
    title: "ਯੂਜ਼ਰ ਅਤੇ ਰੋਲ",
    navTitle: "ਯੂਜ਼ਰ",
    description: "ਏਜੰਸੀ, ਮਾਲਕ ਅਤੇ ਸਟਾਫ ਲਈ ਯੂਜ਼ਰ ਬਣਾਓ, ਬਦਲੋ, ਬੰਦ ਕਰੋ ਅਤੇ ਰੋਲ ਦਿਓ।",
    createLabel: "ਯੂਜ਼ਰ ਜੋੜੋ"
  },
  menu: {
    title: "ਮੇਨੂ",
    navTitle: "ਮੇਨੂ",
    description: "ਬਿਲਿੰਗ ਲਈ ਕੈਟਾਗਰੀ, ਆਈਟਮ ਕੋਡ, ਯੂਨਿਟ ਅਤੇ ਕੀਮਤਾਂ ਵਾਲਾ ਲਾਈਵ ਮੇਨੂ।"
  },
  products: {
    title: "ਪ੍ਰੋਡਕਟ ਕੈਟਾਲਾਗ",
    navTitle: "ਪ੍ਰੋਡਕਟ",
    description: "ਮਿਠਾਈ ਅਤੇ ਡੇਅਰੀ ਪ੍ਰੋਡਕਟ SKU, ਕੈਟਾਗਰੀ, ਯੂਨਿਟ, ਟੈਕਸ, ਮਾਰਜਿਨ ਅਤੇ ਸਟਾਕ ਲਿੰਕ ਨਾਲ।",
    createLabel: "ਪ੍ਰੋਡਕਟ ਜੋੜੋ"
  },
  invoices: {
    title: "ਇਨਵੌਇਸ",
    navTitle: "ਇਨਵੌਇਸ",
    description: "ਮੋਬਾਈਲ-ਫ੍ਰੈਂਡਲੀ ਬਿਲਿੰਗ, ਗਾਹਕ ਬਕਾਇਆ, ਭੁਗਤਾਨ ਸਥਿਤੀ, PDF ਅਤੇ ਆਡਿਟ ਟ੍ਰੇਲ।",
    createLabel: "ਇਨਵੌਇਸ ਬਣਾਓ"
  },
  customers: {
    title: "ਗਾਹਕ",
    navTitle: "ਗਾਹਕ",
    description: "ਗਾਹਕ ਪ੍ਰੋਫਾਈਲ, ਖਰੀਦ ਇਤਿਹਾਸ, ਓਪਨਿੰਗ ਬੈਲੈਂਸ, ਭੁਗਤਾਨ ਅਤੇ ਬਕਾਇਆ ਸਟੇਟਮੈਂਟ।",
    createLabel: "ਗਾਹਕ ਜੋੜੋ"
  },
  ledgers: {
    title: "ਕ੍ਰੈਡਿਟ-ਡੈਬਿਟ ਲੈਜ਼ਰ",
    navTitle: "ਲੈਜ਼ਰ",
    description: "ਗਾਹਕ, ਕਿਸਾਨ ਅਤੇ ਸਪਲਾਇਰ ਲਈ ਇਕੱਠੇ ਡੈਬਿਟ-ਕ੍ਰੈਡਿਟ ਰਿਕਾਰਡ ਅਤੇ ਸਟੇਟਮੈਂਟ।",
    createLabel: "ਲੈਜ਼ਰ ਐਂਟਰੀ ਜੋੜੋ"
  },
  inventory: {
    title: "ਇਨਵੈਂਟਰੀ",
    navTitle: "ਇਨਵੈਂਟਰੀ",
    description: "ਕੱਚਾ ਮਾਲ ਅਤੇ ਤਿਆਰ ਸਮਾਨ, ਸਟਾਕ ਇਨ/ਆਉਟ, ਵੈਸਟੇਜ, ਬੈਚ, ਐਕਸਪਾਇਰੀ ਅਤੇ ਵੈਲੂਏਸ਼ਨ।",
    createLabel: "ਸਟਾਕ ਆਈਟਮ ਜੋੜੋ"
  },
  farmers: {
    title: "ਕਿਸਾਨ ਦੁੱਧ ਇਕੱਠਾ",
    navTitle: "ਕਿਸਾਨ",
    description: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ, ਸਵੇਰ/ਸ਼ਾਮ ਦੁੱਧ ਐਂਟਰੀ, ਭੁਗਤਾਨ ਲੈਜ਼ਰ ਅਤੇ ਕੱਚੇ ਦੁੱਧ ਦਾ ਸਟਾਕ ਇਨ।",
    createLabel: "ਦੁੱਧ ਐਂਟਰੀ ਜੋੜੋ"
  },
  suppliers: {
    title: "ਸਪਲਾਇਰ",
    navTitle: "ਸਪਲਾਇਰ",
    description: "ਸਪਲਾਇਰ ਪ੍ਰੋਫਾਈਲ, ਖਰੀਦ ਰਿਕਾਰਡ, ਭੁਗਤਾਨ, ਪੇਏਬਲ ਲੈਜ਼ਰ ਅਤੇ ਸਟੇਟਮੈਂਟ।",
    createLabel: "ਸਪਲਾਇਰ ਜੋੜੋ"
  },
  employees: {
    title: "ਕਰਮਚਾਰੀ ਅਤੇ ਤਨਖਾਹ",
    navTitle: "ਕਰਮਚਾਰੀ",
    description: "ਕਰਮਚਾਰੀ ਪ੍ਰੋਫਾਈਲ, ਹਾਜ਼ਰੀ, ਐਡਵਾਂਸ, ਤਨਖਾਹ ਹਿਸਾਬ, ਭੁਗਤਾਨ ਇਤਿਹਾਸ ਅਤੇ ਸਟੇਟਮੈਂਟ।",
    createLabel: "ਕਰਮਚਾਰੀ ਜੋੜੋ"
  },
  expenses: {
    title: "ਖਰਚੇ ਅਤੇ ਮੁਨਾਫਾ",
    navTitle: "ਖਰਚੇ",
    description: "ਰੋਜ਼ਾਨਾ ਖਰਚੇ, ਕੈਟਾਗਰੀ, ਰਸੀਦ, ਕੈਸ਼ ਕਲੋਜ਼ਿੰਗ ਅਤੇ ਪ੍ਰੋਫਿਟ/ਲਾਸ ਹਿਸਾਬ।",
    createLabel: "ਖਰਚਾ ਜੋੜੋ"
  },
  payments: {
    title: "ਭੁਗਤਾਨ",
    navTitle: "ਭੁਗਤਾਨ",
    description: "ਇਨਵੌਇਸ, ਗਾਹਕ, ਕਿਸਾਨ, ਸਪਲਾਇਰ, ਕਰਮਚਾਰੀ ਅਤੇ ਖਰਚੇ ਲਈ ਇਕੱਠਾ ਭੁਗਤਾਨ ਰਿਕਾਰਡ।",
    createLabel: "ਭੁਗਤਾਨ ਦਰਜ ਕਰੋ"
  },
  reports: {
    title: "ਰਿਪੋਰਟਾਂ",
    navTitle: "ਰਿਪੋਰਟਾਂ",
    description: "ਵਿਕਰੀ, ਲੈਜ਼ਰ, ਸਟਾਕ, ਸਪਲਾਇਰ, ਦੁੱਧ, ਤਨਖਾਹ, ਹਾਜ਼ਰੀ, ਖਰਚੇ, ਮੁਨਾਫਾ ਅਤੇ ਭੁਗਤਾਨ।"
  },
  "audit-logs": {
    title: "ਆਡਿਟ ਲਾਗ",
    navTitle: "ਆਡਿਟ",
    description: "ਸੈਟਿੰਗਾਂ, ਇਨਵੌਇਸ, ਭੁਗਤਾਨ, ਲੈਜ਼ਰ, ਸਟਾਕ, ਤਨਖਾਹ ਅਤੇ ਯੂਜ਼ਰ ਤਬਦੀਲੀਆਂ ਦੀ ਟ੍ਰੇਸਿੰਗ।"
  },
  backup: {
    title: "ਬੈਕਅਪ ਅਤੇ ਐਕਸਪੋਰਟ",
    navTitle: "ਬੈਕਅਪ",
    description: "ਮੁੱਖ ਡਾਟਾ ਐਕਸਪੋਰਟ ਹੱਬ ਅਤੇ ਲੋਕਲ ਬੈਕਅਪ/ਰੀਸਟੋਰ ਹਦਾਇਤਾਂ।"
  }
};

const labelText: Record<string, string> = {
  Business: "ਬਿਜ਼ਨਸ",
  Phone: "ਫੋਨ",
  "Invoice Prefix": "ਇਨਵੌਇਸ ਪ੍ਰਿਫਿਕਸ",
  Currency: "ਕਰੰਸੀ",
  Theme: "ਥੀਮ",
  "Business name": "ਬਿਜ਼ਨਸ ਨਾਮ",
  "Logo URL": "ਲੋਗੋ URL",
  Address: "ਪਤਾ",
  "Phone number": "ਫੋਨ ਨੰਬਰ",
  Email: "ਈਮੇਲ",
  "FSSAI/license number": "FSSAI/ਲਾਇਸੰਸ ਨੰਬਰ",
  "Invoice prefix": "ਇਨਵੌਇਸ ਪ੍ਰਿਫਿਕਸ",
  "Invoice footer terms": "ਇਨਵੌਇਸ ਫੂਟਰ ਸ਼ਰਤਾਂ",
  "UPI/payment details text": "UPI/ਭੁਗਤਾਨ ਵੇਰਵਾ",
  "Default tax rate": "ਡਿਫਾਲਟ ਟੈਕਸ ਦਰ",
  "Theme color": "ਥੀਮ ਰੰਗ",
  "Branch name": "ਬ੍ਰਾਂਚ ਨਾਮ",
  "Branch code": "ਬ੍ਰਾਂਚ ਕੋਡ",
  Name: "ਨਾਮ",
  Role: "ਰੋਲ",
  Status: "ਸਥਿਤੀ",
  "Temporary password": "ਅਸਥਾਈ ਪਾਸਵਰਡ",
  Product: "ਪ੍ਰੋਡਕਟ",
  Category: "ਕੈਟਾਗਰੀ",
  "Menu Category": "ਮੇਨੂ ਕੈਟਾਗਰੀ",
  "Menu category": "ਮੇਨੂ ਕੈਟਾਗਰੀ",
  "Item Code": "ਆਈਟਮ ਕੋਡ",
  Selling: "ਵਿਕਰੀ",
  Cost: "ਲਾਗਤ",
  "Product name": "ਪ੍ਰੋਡਕਟ ਨਾਮ",
  "SKU/code": "SKU/ਕੋਡ",
  "Item code / SKU": "ਆਈਟਮ ਕੋਡ / SKU",
  Unit: "ਯੂਨਿਟ",
  "Selling price": "ਵਿਕਰੀ ਕੀਮਤ",
  "Cost price": "ਲਾਗਤ ਕੀਮਤ",
  "Tax rate": "ਟੈਕਸ ਦਰ",
  "Wholesale price": "ਥੋਕ ਕੀਮਤ",
  "Manual festival price": "ਤਿਉਹਾਰ ਕੀਮਤ",
  "Low-stock threshold": "ਘੱਟ ਸਟਾਕ ਹੱਦ",
  "Product image URL": "ਪ੍ਰੋਡਕਟ ਤਸਵੀਰ URL",
  Invoice: "ਇਨਵੌਇਸ",
  Customer: "ਗਾਹਕ",
  Date: "ਮਿਤੀ",
  Total: "ਕੁੱਲ",
  Paid: "ਭੁਗਤਾਨ",
  Due: "ਬਕਾਇਆ",
  "Customer name": "ਗਾਹਕ ਨਾਮ",
  "Customer phone": "ਗਾਹਕ ਫੋਨ",
  "Invoice date": "ਇਨਵੌਇਸ ਮਿਤੀ",
  "Product summary": "ਪ੍ਰੋਡਕਟ ਵੇਰਵਾ",
  Subtotal: "ਸਬਟੋਟਲ",
  Discount: "ਡਿਸਕਾਊਂਟ",
  Tax: "ਟੈਕਸ",
  "Paid amount": "ਭੁਗਤਾਨ ਰਕਮ",
  "Payment mode": "ਭੁਗਤਾਨ ਢੰਗ",
  Notes: "ਨੋਟਸ",
  Opening: "ਓਪਨਿੰਗ",
  Balance: "ਬੈਲੈਂਸ",
  "Opening balance": "ਓਪਨਿੰਗ ਬੈਲੈਂਸ",
  "Owner Type": "ਮਾਲਕ ਕਿਸਮ",
  Owner: "ਮਾਲਕ",
  Type: "ਕਿਸਮ",
  Amount: "ਰਕਮ",
  Description: "ਵੇਰਵਾ",
  "Owner type": "ਮਾਲਕ ਕਿਸਮ",
  "Owner name": "ਮਾਲਕ ਨਾਮ",
  "Entry type": "ਐਂਟਰੀ ਕਿਸਮ",
  Item: "ਆਈਟਮ",
  Qty: "ਮਾਤਰਾ",
  Minimum: "ਘੱਟੋ-ਘੱਟ",
  Valuation: "ਵੈਲੂਏਸ਼ਨ",
  "Item name": "ਆਈਟਮ ਨਾਮ",
  "Current quantity": "ਮੌਜੂਦਾ ਮਾਤਰਾ",
  "Minimum quantity": "ਘੱਟੋ-ਘੱਟ ਮਾਤਰਾ",
  "Cost per unit": "ਪ੍ਰਤੀ ਯੂਨਿਟ ਲਾਗਤ",
  Supplier: "ਸਪਲਾਇਰ",
  "Batch number": "ਬੈਚ ਨੰਬਰ",
  "Expiry date": "ਐਕਸਪਾਇਰੀ ਮਿਤੀ",
  Farmer: "ਕਿਸਾਨ",
  Session: "ਸੈਸ਼ਨ",
  Litres: "ਲੀਟਰ",
  Payable: "ਦੇਣਯੋਗ",
  "Farmer name": "ਕਿਸਾਨ ਨਾਮ",
  "Village/address": "ਪਿੰਡ/ਪਤਾ",
  "Collection date": "ਕਲੇਕਸ਼ਨ ਮਿਤੀ",
  "Quantity litres": "ਦੁੱਧ ਲੀਟਰ",
  "Rate per litre": "ਪ੍ਰਤੀ ਲੀਟਰ ਦਰ",
  "Advance paid": "ਐਡਵਾਂਸ ਭੁਗਤਾਨ",
  "GST/License": "GST/ਲਾਇਸੰਸ",
  "Supplier name": "ਸਪਲਾਇਰ ਨਾਮ",
  "GST/license": "GST/ਲਾਇਸੰਸ",
  Employee: "ਕਰਮਚਾਰੀ",
  Designation: "ਡਿਜ਼ਿਗਨੇਸ਼ਨ",
  Rate: "ਦਰ",
  "Employee name": "ਕਰਮਚਾਰੀ ਨਾਮ",
  "Joining date": "ਜੁਆਇਨਿੰਗ ਮਿਤੀ",
  "Salary type": "ਤਨਖਾਹ ਕਿਸਮ",
  "Salary amount/rate": "ਤਨਖਾਹ ਰਕਮ/ਦਰ",
  Mode: "ਢੰਗ",
  "Receipt attachment URL": "ਰਸੀਦ URL",
  For: "ਲਈ",
  Party: "ਪਾਰਟੀ",
  Direction: "ਦਿਸ਼ਾ",
  "Payment for": "ਭੁਗਤਾਨ ਲਈ",
  "Party/name": "ਪਾਰਟੀ/ਨਾਮ",
  "Reference number": "ਰੈਫਰੈਂਸ ਨੰਬਰ",
  Report: "ਰਿਪੋਰਟ",
  Module: "ਮਾਡਿਊਲ",
  Exports: "ਐਕਸਪੋਰਟ",
  Filters: "ਫਿਲਟਰ",
  Action: "ਕਾਰਵਾਈ",
  Record: "ਰਿਕਾਰਡ",
  User: "ਯੂਜ਼ਰ",
  Time: "ਸਮਾਂ",
  "Backup Item": "ਬੈਕਅਪ ਆਈਟਮ",
  Format: "ਫਾਰਮੈਟ"
};

export function localizeModuleDefinition(locale: Locale, definition: ModuleDefinition): ModuleDefinition {
  if (locale === "en") return definition;
  const text = moduleText[definition.key];

  return {
    ...definition,
    title: text?.title ?? definition.title,
    navTitle: text?.navTitle ?? definition.navTitle,
    description: text?.description ?? definition.description,
    createLabel: text?.createLabel ?? definition.createLabel,
    columns: definition.columns.map((column) => ({
      ...column,
      label: labelText[column.label] ?? column.label
    })),
    fields: definition.fields.map((field) => ({
      ...field,
      label: labelText[field.label] ?? field.label
    }))
  };
}

export function localizeNavTitle(locale: Locale, key: string, fallback: string) {
  if (locale === "en") return fallback;
  if (key === "dashboard") return "ਡੈਸ਼ਬੋਰਡ";
  return moduleText[key]?.navTitle ?? fallback;
}
