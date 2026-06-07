export type UserRoleKey = "SUPER_ADMIN" | "OWNER" | "MANAGER" | "CASHIER" | "INVENTORY_STAFF" | "ACCOUNTANT" | "READ_ONLY_STAFF";

export type Unit = "KG" | "GRAM" | "PIECE" | "BOX" | "LITRE" | "PACKET";

export type PaymentMode = "CASH" | "UPI" | "CARD" | "BANK" | "CREDIT" | "MIXED" | "OTHER";

export type InvoiceStatus = "PAID" | "PARTIAL" | "UNPAID" | "CANCELLED";

export type LedgerOwnerType = "CUSTOMER" | "FARMER" | "SUPPLIER";

export type LedgerEntryType = "CREDIT" | "DEBIT";

export type InventoryItemType = "RAW_MATERIAL" | "FINISHED_PRODUCT" | "PACKAGING" | "DISPOSABLE" | "SHOP_SUPPLY";

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT" | "WASTAGE" | "SPOILAGE" | "TRANSFER";

export type MilkSession = "MORNING" | "EVENING";

export type SalaryType = "MONTHLY" | "DAILY" | "HOURLY";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";

export type PaymentDirection = "IN" | "OUT";

export type PaymentFor = "CUSTOMER" | "FARMER" | "SUPPLIER" | "EMPLOYEE" | "EXPENSE" | "INVOICE";

export type ReportFormat = "PDF" | "CSV" | "EXCEL";

export type BulkOrderStatus = "ENQUIRY" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
