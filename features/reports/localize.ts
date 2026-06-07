import type { Locale } from "@/lib/i18n/dictionary";
import type { ReportDefinition } from "./report-definitions";

const reportText: Record<string, { title: string; module: string; description: string; filters: string[] }> = {
  "daily-sales-report": {
    title: "ਰੋਜ਼ਾਨਾ ਵਿਕਰੀ ਰਿਪੋਰਟ",
    module: "ਵਿਕਰੀ",
    description: "ਰੋਜ਼ਾਨਾ ਇਨਵੌਇਸ ਆਮਦਨ, ਭੁਗਤਾਨ ਸਥਿਤੀ, ਭੁਗਤਾਨ ਅਤੇ ਗਾਹਕ ਬਕਾਇਆ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਭੁਗਤਾਨ ਢੰਗ", "ਭੁਗਤਾਨ ਸਥਿਤੀ"]
  },
  "monthly-sales-report": {
    title: "ਮਹੀਨਾਵਾਰ ਵਿਕਰੀ ਰਿਪੋਰਟ",
    module: "ਵਿਕਰੀ",
    description: "ਮਹੀਨਾਵਾਰ ਵਿਕਰੀ, ਇਨਵੌਇਸ ਗਿਣਤੀ, ਭੁਗਤਾਨ ਅਤੇ ਬਕਾਇਆ।",
    filters: ["ਮਹੀਨਾ", "ਗਾਹਕ", "ਸਥਿਤੀ"]
  },
  "invoice-report": {
    title: "ਇਨਵੌਇਸ ਰਿਪੋਰਟ",
    module: "ਵਿਕਰੀ",
    description: "ਗਾਹਕ, ਮਿਤੀ, ਰਕਮ, ਭੁਗਤਾਨ ਢੰਗ ਅਤੇ ਸਥਿਤੀ ਨਾਲ ਇਨਵੌਇਸ ਇਤਿਹਾਸ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਗਾਹਕ", "ਸਥਿਤੀ"]
  },
  "product-sales-report": {
    title: "ਪ੍ਰੋਡਕਟ ਵਿਕਰੀ ਰਿਪੋਰਟ",
    module: "ਵਿਕਰੀ",
    description: "ਵਿਕਰੀ ਅਤੇ ਮਾਰਜਿਨ ਸਮੀਖਿਆ ਲਈ ਪ੍ਰੋਡਕਟ ਅਤੇ ਕੀਮਤ ਡਾਟਾ।",
    filters: ["ਪ੍ਰੋਡਕਟ", "ਕੈਟਾਗਰੀ", "ਮਿਤੀ ਰੇਂਜ"]
  },
  "customer-due-report": {
    title: "ਗਾਹਕ ਬਕਾਇਆ ਰਿਪੋਰਟ",
    module: "ਗਾਹਕ",
    description: "ਗਾਹਕ ਬਕਾਇਆ ਅਤੇ ਭੁਗਤਾਨ ਫਾਲੋਅੱਪ ਲਿਸਟ।",
    filters: ["ਗਾਹਕ", "ਬੈਲੈਂਸ ਸਥਿਤੀ", "ਮਿਤੀ ਰੇਂਜ"]
  },
  "customer-ledger-report": {
    title: "ਗਾਹਕ ਲੈਜ਼ਰ ਰਿਪੋਰਟ",
    module: "ਗਾਹਕ",
    description: "ਇਨਵੌਇਸ ਅਤੇ ਭੁਗਤਾਨ ਨਾਲ ਗਾਹਕ ਡੈਬਿਟ-ਕ੍ਰੈਡਿਟ ਸਟੇਟਮੈਂਟ।",
    filters: ["ਗਾਹਕ", "ਮਿਤੀ ਰੇਂਜ", "ਐਂਟਰੀ ਕਿਸਮ"]
  },
  "inventory-report": {
    title: "ਇਨਵੈਂਟਰੀ ਰਿਪੋਰਟ",
    module: "ਇਨਵੈਂਟਰੀ",
    description: "ਕੱਚੇ ਮਾਲ ਅਤੇ ਤਿਆਰ ਸਮਾਨ ਦੀ ਮਾਤਰਾ ਅਤੇ ਵੈਲੂਏਸ਼ਨ।",
    filters: ["ਆਈਟਮ", "ਕਿਸਮ", "ਕੈਟਾਗਰੀ"]
  },
  "low-stock-report": {
    title: "ਘੱਟ ਸਟਾਕ ਰਿਪੋਰਟ",
    module: "ਇਨਵੈਂਟਰੀ",
    description: "ਘੱਟੋ-ਘੱਟ ਮਾਤਰਾ ਨੇੜੇ ਜਾਂ ਹੇਠਾਂ ਆਈਟਮਾਂ।",
    filters: ["ਆਈਟਮ", "ਕਿਸਮ", "ਹੱਦ"]
  },
  "stock-movement-report": {
    title: "ਸਟਾਕ ਮੂਵਮੈਂਟ ਰਿਪੋਰਟ",
    module: "ਇਨਵੈਂਟਰੀ",
    description: "ਸਟਾਕ ਇਨ, ਆਉਟ, ਵੈਸਟੇਜ, ਸਪਾਇਲੇਜ ਅਤੇ ਐਡਜਸਟਮੈਂਟ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਮੂਵਮੈਂਟ ਕਿਸਮ", "ਆਈਟਮ"]
  },
  "supplier-purchase-report": {
    title: "ਸਪਲਾਇਰ ਖਰੀਦ ਰਿਪੋਰਟ",
    module: "ਸਪਲਾਇਰ",
    description: "ਸਪਲਾਇਰ ਖਰੀਦ ਅਤੇ ਸਟਾਕ ਇਨ ਗਤੀਵਿਧੀ।",
    filters: ["ਸਪਲਾਇਰ", "ਮਿਤੀ ਰੇਂਜ", "ਆਈਟਮ"]
  },
  "supplier-payable-report": {
    title: "ਸਪਲਾਇਰ ਪੇਏਬਲ ਰਿਪੋਰਟ",
    module: "ਸਪਲਾਇਰ",
    description: "ਸਪਲਾਇਰ ਦੇਣਯੋਗ ਬਕਾਇਆ।",
    filters: ["ਸਪਲਾਇਰ", "ਭੁਗਤਾਨ ਸਥਿਤੀ", "ਮਿਤੀ ਰੇਂਜ"]
  },
  "supplier-ledger-report": {
    title: "ਸਪਲਾਇਰ ਲੈਜ਼ਰ ਰਿਪੋਰਟ",
    module: "ਸਪਲਾਇਰ",
    description: "ਖਰੀਦ ਅਤੇ ਭੁਗਤਾਨ ਐਂਟਰੀਆਂ ਨਾਲ ਸਪਲਾਇਰ ਸਟੇਟਮੈਂਟ।",
    filters: ["ਸਪਲਾਇਰ", "ਮਿਤੀ ਰੇਂਜ", "ਐਂਟਰੀ ਕਿਸਮ"]
  },
  "farmer-milk-collection-report": {
    title: "ਕਿਸਾਨ ਦੁੱਧ ਕਲੇਕਸ਼ਨ ਰਿਪੋਰਟ",
    module: "ਕਿਸਾਨ",
    description: "ਮਿਤੀ ਅਤੇ ਕਿਸਾਨ ਅਨੁਸਾਰ ਲੀਟਰ, ਫੈਟ, SNF, ਦਰ ਅਤੇ ਰਕਮ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਕਿਸਾਨ", "ਸੈਸ਼ਨ"]
  },
  "farmer-payment-report": {
    title: "ਕਿਸਾਨ ਭੁਗਤਾਨ ਰਿਪੋਰਟ",
    module: "ਕਿਸਾਨ",
    description: "ਕਿਸਾਨਾਂ ਨੂੰ ਕੀਤੇ ਭੁਗਤਾਨ ਅਤੇ ਬਕਾਇਆ ਦੁੱਧ ਰਕਮ।",
    filters: ["ਕਿਸਾਨ", "ਭੁਗਤਾਨ ਢੰਗ", "ਮਿਤੀ ਰੇਂਜ"]
  },
  "farmer-ledger-report": {
    title: "ਕਿਸਾਨ ਲੈਜ਼ਰ ਰਿਪੋਰਟ",
    module: "ਕਿਸਾਨ",
    description: "ਕਿਸਾਨ ਦੇਣਯੋਗ, ਐਡਵਾਂਸ ਅਤੇ ਬੈਲੈਂਸ ਸਟੇਟਮੈਂਟ।",
    filters: ["ਕਿਸਾਨ", "ਮਿਤੀ ਰੇਂਜ", "ਐਂਟਰੀ ਕਿਸਮ"]
  },
  "employee-salary-report": {
    title: "ਕਰਮਚਾਰੀ ਤਨਖਾਹ ਰਿਪੋਰਟ",
    module: "ਕਰਮਚਾਰੀ",
    description: "ਤਨਖਾਹ ਕਿਸਮ, ਬੇਸ ਤਨਖਾਹ, ਐਡਵਾਂਸ, ਭੁਗਤਾਨ ਅਤੇ ਬਕਾਇਆ।",
    filters: ["ਕਰਮਚਾਰੀ", "ਮਹੀਨਾ", "ਭੁਗਤਾਨ ਸਥਿਤੀ"]
  },
  "attendance-report": {
    title: "ਹਾਜ਼ਰੀ ਰਿਪੋਰਟ",
    module: "ਕਰਮਚਾਰੀ",
    description: "ਕਰਮਚਾਰੀ ਅਨੁਸਾਰ ਹਾਜ਼ਰੀ ਸਥਿਤੀ ਅਤੇ ਕੰਮ ਘੰਟੇ।",
    filters: ["ਕਰਮਚਾਰੀ", "ਮਿਤੀ ਰੇਂਜ", "ਸਥਿਤੀ"]
  },
  "expense-report": {
    title: "ਖਰਚਾ ਰਿਪੋਰਟ",
    module: "ਖਰਚੇ",
    description: "ਰੋਜ਼ਾਨਾ, ਮਹੀਨਾਵਾਰ ਅਤੇ ਕੈਟਾਗਰੀ ਅਨੁਸਾਰ ਖਰਚੇ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਕੈਟਾਗਰੀ", "ਭੁਗਤਾਨ ਢੰਗ"]
  },
  "profit-loss-report": {
    title: "ਪ੍ਰੋਫਿਟ/ਲਾਸ ਰਿਪੋਰਟ",
    module: "ਫਾਇਨੈਂਸ",
    description: "ਵਿਕਰੀ ਤੋਂ ਲਾਗਤ, ਖਰਚੇ, ਤਨਖਾਹ, ਸਪਲਾਇਰ ਖਰੀਦ ਅਤੇ ਕਿਸਾਨ ਭੁਗਤਾਨ ਘਟਾ ਕੇ ਹਿਸਾਬ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਕੈਟਾਗਰੀ", "ਬ੍ਰਾਂਚ"]
  },
  "cash-closing-report": {
    title: "ਕੈਸ਼ ਕਲੋਜ਼ਿੰਗ ਰਿਪੋਰਟ",
    module: "ਫਾਇਨੈਂਸ",
    description: "ਕੈਸ਼ ਇਨਫਲੋ, ਆਉਟਫਲੋ, ਇਨਵੌਇਸ ਭੁਗਤਾਨ, ਖਰਚੇ ਅਤੇ ਕਲੋਜ਼ਿੰਗ ਬੈਲੈਂਸ।",
    filters: ["ਮਿਤੀ", "ਭੁਗਤਾਨ ਢੰਗ", "ਕਾਊਂਟਰ"]
  },
  "payment-report": {
    title: "ਭੁਗਤਾਨ ਰਿਪੋਰਟ",
    module: "ਫਾਇਨੈਂਸ",
    description: "ਗਾਹਕ, ਕਿਸਾਨ, ਸਪਲਾਇਰ, ਕਰਮਚਾਰੀ, ਖਰਚੇ ਅਤੇ ਇਨਵੌਇਸ ਦੇ ਸਾਰੇ ਅੰਦਰ/ਬਾਹਰ ਭੁਗਤਾਨ।",
    filters: ["ਮਿਤੀ ਰੇਂਜ", "ਭੁਗਤਾਨ ਲਈ", "ਭੁਗਤਾਨ ਢੰਗ"]
  }
};

export function localizeReportDefinition(locale: Locale, report: ReportDefinition): ReportDefinition {
  if (locale === "en") return report;
  const text = reportText[report.key];
  return text ? { ...report, ...text } : report;
}
