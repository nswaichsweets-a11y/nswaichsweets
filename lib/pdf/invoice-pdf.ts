type PdfBusinessSettings = {
  businessName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  fssaiLicense?: string | null;
  registeredNumber?: string | null;
  invoiceFooterTerms?: string | null;
  upiPaymentDetails?: string | null;
  currency?: string | null;
  themeColor?: string | null;
  branchName?: string | null;
  branchCode?: string | null;
};

type PdfCustomer = {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
};

type PdfInvoice = {
  invoiceNumber: string;
  issueDate: Date | string;
  subtotal: unknown;
  discountTotal: unknown;
  taxTotal: unknown;
  total: unknown;
  paidAmount: unknown;
  dueAmount: unknown;
  paymentMode: string;
  status: string;
  assignedToName?: string | null;
  notes?: string | null;
};

type PdfInvoiceItem = {
  productName: string;
  quantity: unknown;
  unit: string;
  price: unknown;
  discount?: unknown;
  taxRate?: unknown;
  taxAmount?: unknown;
  lineTotal: unknown;
};

type TextOptions = {
  size?: number;
  font?: "F1" | "F2";
  color?: string;
  align?: "left" | "right" | "center";
  width?: number;
};

function escapePdfText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .slice(0, 220);
}

function toNumber(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value: unknown, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(toNumber(value));
}

function formatMoney(value: unknown, currency = "INR") {
  const amount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(toNumber(value));
  return currency === "INR" ? `Rs. ${amount}` : `${currency} ${amount}`;
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function safeColor(value: string | null | undefined, fallback = "#141b18") {
  const color = String(value ?? "").trim();
  const legacyGreen = new Set(["#1c5a3e", "#145f45", "#12553f"]);
  if (legacyGreen.has(color.toLowerCase())) return fallback;
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function colorParts(hex: string) {
  const safe = safeColor(hex);
  const value = safe.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  return [red, green, blue].map((part) => Number(part.toFixed(3))).join(" ");
}

function fillColor(hex: string) {
  return `${colorParts(hex)} rg`;
}

function strokeColor(hex: string) {
  return `${colorParts(hex)} RG`;
}

function textWidth(text: string, size: number) {
  return text.length * size * 0.5;
}

function text(value: unknown, x: number, y: number, options: TextOptions = {}) {
  const size = options.size ?? 10;
  const font = options.font ?? "F1";
  const color = options.color ?? "#111827";
  const clean = escapePdfText(value);
  let tx = x;

  if (options.align && options.align !== "left" && options.width) {
    const width = textWidth(clean, size);
    if (options.align === "right") tx = x + options.width - width;
    if (options.align === "center") tx = x + (options.width - width) / 2;
  }

  return `BT ${fillColor(color)} /${font} ${size} Tf ${tx.toFixed(2)} ${y.toFixed(2)} Td (${clean}) Tj ET`;
}

function rect(x: number, y: number, width: number, height: number, options: { fill?: string; stroke?: string; lineWidth?: number } = {}) {
  const commands = ["q"];
  if (options.fill) commands.push(fillColor(options.fill));
  if (options.stroke) commands.push(strokeColor(options.stroke));
  if (options.lineWidth) commands.push(`${options.lineWidth} w`);
  commands.push(`${x} ${y} ${width} ${height} re`);
  commands.push(options.fill && options.stroke ? "B" : options.fill ? "f" : "S");
  commands.push("Q");
  return commands.join(" ");
}

function line(x1: number, y1: number, x2: number, y2: number, color = "#d7ded6", lineWidth = 1) {
  return `q ${strokeColor(color)} ${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S Q`;
}

function wrap(value: unknown, maxChars: number) {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["-"];
}

function buildPdf(stream: string) {
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    `6 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`
  ];

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(chunks.join("")));
    chunks.push(`${object}\n`);
  }

  const xrefStart = Buffer.byteLength(chunks.join(""));
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");
  for (const offset of offsets.slice(1)) {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  return Buffer.from(chunks.join(""), "utf8");
}

function infoCard({
  title,
  rows,
  x,
  y,
  width,
  height
}: {
  title: string;
  rows: { label: string; value: unknown }[];
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const content = [rect(x, y, width, height, { fill: "#ffffff", stroke: "#d9cba9", lineWidth: 0.8 })];
  content.push(text(title, x + 14, y + height - 22, { size: 8, font: "F2", color: "#6f644a" }));
  let cursor = y + height - 43;
  for (const row of rows) {
    content.push(text(row.label, x + 14, cursor, { size: 7, font: "F2", color: "#887b5e" }));
    content.push(text(row.value || "-", x + 82, cursor, { size: 9, font: "F1", color: "#17231c" }));
    cursor -= 17;
  }
  return content;
}

export function createInvoicePdf({
  settings,
  invoice,
  customer,
  items,
  cashierName
}: {
  settings: PdfBusinessSettings;
  invoice: PdfInvoice;
  customer?: PdfCustomer | null;
  items: PdfInvoiceItem[];
  cashierName?: string | null;
}) {
  const primary = safeColor(settings.themeColor);
  const accent = "#d7a84f";
  const currency = settings.currency ?? "INR";
  const businessName = settings.businessName || "Namdhari Swaich Sweets";
  const content: string[] = [];
  const left = 42;
  const right = 570;
  const width = right - left;

  content.push(rect(0, 0, 612, 792, { fill: "#fbfaf5" }));
  content.push(rect(0, 700, 612, 92, { fill: primary }));
  content.push(rect(0, 696, 612, 4, { fill: accent }));
  content.push(rect(left, 728, 48, 48, { fill: "#fff8e4", stroke: accent, lineWidth: 1 }));
  content.push(text("NS", left + 13, 746, { size: 17, font: "F2", color: primary }));
  content.push(text(businessName, 104, 759, { size: 20, font: "F2", color: "#ffffff" }));

  const headerLines = [
    settings.branchName ? `${settings.branchName}${settings.branchCode ? ` (${settings.branchCode})` : ""}` : null,
    settings.address,
    [settings.phone, settings.email].filter(Boolean).join(" | "),
    [
      settings.registeredNumber ? `Reg No: ${settings.registeredNumber}` : null,
      settings.gstin ? `GSTIN: ${settings.gstin}` : null,
      settings.fssaiLicense ? `FSSAI: ${settings.fssaiLicense}` : null
    ]
      .filter(Boolean)
      .join(" | ")
  ]
    .filter(Boolean)
    .flatMap((lineText) => wrap(lineText, 64))
    .slice(0, 4);

  headerLines.forEach((headerLine, index) => {
    content.push(text(headerLine, 104, 740 - index * 13, { size: 8, color: "#edf7ef" }));
  });

  content.push(text("INVOICE", 388, 758, { size: 21, font: "F2", color: "#ffffff", align: "right", width: 182 }));
  content.push(text(invoice.invoiceNumber, 424, 738, { size: 11, font: "F2", color: "#ffffff", align: "right", width: 146 }));
  content.push(text(formatDate(invoice.issueDate), 424, 723, { size: 9, color: "#edf7ef", align: "right", width: 146 }));

  const customerLines = [
    { label: "Name", value: customer?.name || "Walk-in Customer" },
    { label: "Phone", value: customer?.phone || "-" },
    { label: "Email", value: customer?.email || "-" },
    { label: "Address", value: customer?.address || "-" }
  ];
  content.push(...infoCard({ title: "BILL TO", rows: customerLines, x: left, y: 584, width: 252, height: 92 }));

  const paymentRows = [
    { label: "Invoice", value: invoice.invoiceNumber },
    { label: "Mode", value: invoice.paymentMode.replaceAll("_", " ") },
    { label: "Status", value: invoice.status.replaceAll("_", " ") },
    { label: "Assigned", value: invoice.assignedToName || cashierName || "System" }
  ];
  content.push(...infoCard({ title: "PAYMENT", rows: paymentRows, x: 318, y: 584, width: 252, height: 92 }));

  const tableTop = 536;
  content.push(rect(left, tableTop, width, 28, { fill: "#f4ead1", stroke: "#d9cba9", lineWidth: 0.8 }));
  const columns = [
    { label: "#", x: left + 10, width: 24 },
    { label: "ITEM", x: left + 42, width: 236 },
    { label: "QTY", x: left + 286, width: 54 },
    { label: "RATE", x: left + 346, width: 62 },
    { label: "TAX", x: left + 414, width: 46 },
    { label: "AMOUNT", x: left + 466, width: 62 }
  ];
  for (const column of columns) {
    content.push(text(column.label, column.x, tableTop + 10, { size: 8, font: "F2", color: "#4b4332" }));
  }

  const displayedItems = items.slice(0, 7);
  let rowY = tableTop - 28;
  if (displayedItems.length === 0) {
    content.push(rect(left, rowY, width, 30, { fill: "#ffffff", stroke: "#e1e7df", lineWidth: 0.5 }));
    content.push(text("No invoice items recorded.", left + 12, rowY + 11, { size: 9, color: "#65715f" }));
    rowY -= 30;
  } else {
    displayedItems.forEach((item, index) => {
      const itemLines = wrap(item.productName, 44).slice(0, 2);
      const rowHeight = itemLines.length > 1 ? 39 : 29;
      content.push(rect(left, rowY, width, rowHeight, { fill: index % 2 === 0 ? "#ffffff" : "#fbf7ec", stroke: "#e5ddcc", lineWidth: 0.5 }));
      content.push(text(index + 1, left + 12, rowY + rowHeight - 18, { size: 8, font: "F2", color: "#17231c" }));
      itemLines.forEach((itemLine, lineIndex) => {
        content.push(text(itemLine, left + 42, rowY + rowHeight - 18 - lineIndex * 11, { size: 8.5, color: "#17231c" }));
      });
      content.push(text(`${formatNumber(item.quantity, 3)} ${item.unit}`, left + 286, rowY + rowHeight - 18, { size: 8, color: "#17231c" }));
      content.push(text(formatMoney(item.price, currency), left + 346, rowY + rowHeight - 18, { size: 8, color: "#17231c" }));
      content.push(text(`${formatNumber(item.taxRate ?? 0)}%`, left + 414, rowY + rowHeight - 18, { size: 8, color: "#17231c" }));
      content.push(text(formatMoney(item.lineTotal, currency), left + 466, rowY + rowHeight - 18, { size: 8, font: "F2", color: "#17231c" }));
      rowY -= rowHeight;
    });
  }

  if (items.length > displayedItems.length) {
    content.push(text(`+ ${items.length - displayedItems.length} more items included in totals`, left, rowY - 8, { size: 8, color: "#65715f" }));
    rowY -= 18;
  }

  content.push(line(left, rowY + 1, right, rowY + 1, "#d9cba9", 0.8));
  const summaryTop = Math.min(rowY - 20, 298);
  const notesTop = summaryTop;
  const notesBottom = 86;
  content.push(rect(left, notesBottom, 280, notesTop - notesBottom, { fill: "#ffffff", stroke: "#d9cba9", lineWidth: 0.8 }));
  content.push(text("NOTES", left + 14, notesTop - 22, { size: 8, font: "F2", color: "#65715f" }));

  const noteLines = [
    ...(invoice.notes ? wrap(invoice.notes, 52) : []),
    ...(settings.upiPaymentDetails ? wrap(`Payment: ${settings.upiPaymentDetails}`, 52) : [])
  ].slice(0, 6);
  const finalNoteLines = noteLines.length > 0 ? noteLines : ["Thank you for your business."];
  finalNoteLines.forEach((noteLine, index) => {
    content.push(text(noteLine, left + 14, notesTop - 42 - index * 13, { size: 8, color: "#17231c" }));
  });

  const totals = [
    ["Subtotal", invoice.subtotal],
    ["Discount", invoice.discountTotal],
    ["Tax", invoice.taxTotal],
    ["Paid", invoice.paidAmount],
    ["Due", invoice.dueAmount]
  ];
  let totalY = summaryTop;
  totals.forEach(([label, value]) => {
    content.push(rect(354, totalY - 23, 216, 23, { fill: "#ffffff", stroke: "#e5ddcc", lineWidth: 0.5 }));
    content.push(text(label, 368, totalY - 15, { size: 8.5, color: "#475246" }));
    content.push(text(formatMoney(value, currency), 450, totalY - 15, { size: 8.5, font: "F2", color: "#17231c", align: "right", width: 106 }));
    totalY -= 23;
  });
  content.push(rect(354, totalY - 30, 216, 30, { fill: primary, stroke: primary, lineWidth: 0.5 }));
  content.push(text("TOTAL", 368, totalY - 20, { size: 10, font: "F2", color: "#ffffff" }));
  content.push(text(formatMoney(invoice.total, currency), 440, totalY - 20, { size: 12, font: "F2", color: "#ffffff", align: "right", width: 116 }));

  content.push(text("TERMS", left, 62, { size: 8, font: "F2", color: "#65715f" }));
  wrap(settings.invoiceFooterTerms || "Goods once sold will not be taken back. Please verify items and payment before leaving the counter.", 112)
    .slice(0, 3)
    .forEach((termLine, index) => {
      content.push(text(termLine, left, 47 - index * 11, { size: 7.5, color: "#65715f" }));
    });

  content.push(text(`Generated for ${businessName}`, 392, 38, { size: 7.5, color: "#7a8476", align: "right", width: 178 }));

  return buildPdf(content.join("\n"));
}
