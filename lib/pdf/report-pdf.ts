import type { ModuleRow, TableColumn } from "@/features/modules/module-definitions";

type ReportPdfSettings = {
  businessName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  fssaiLicense?: string | null;
  currency?: string | null;
  themeColor?: string | null;
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
    .slice(0, 180);
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

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
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
  return text.length * size * 0.48;
}

function text(value: unknown, x: number, y: number, options: TextOptions = {}) {
  const size = options.size ?? 10;
  const font = options.font ?? "F1";
  const color = options.color ?? "#171717";
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

function line(x1: number, y1: number, x2: number, y2: number, color = "#d9cba9", lineWidth = 1) {
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

function truncate(value: unknown, maxChars: number) {
  const clean = String(value ?? "-").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(0, maxChars - 1))}.`;
}

function buildPdf(pageStreams: string[]) {
  const fontRegularId = 3;
  const fontBoldId = 4;
  const pageIds = pageStreams.map((_, index) => 5 + index * 2);
  const contentIds = pageStreams.map((_, index) => 6 + index * 2);
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj`,
    "3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj"
  ];

  pageStreams.forEach((stream, index) => {
    objects.push(
      `${pageIds[index]} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentIds[index]} 0 R >> endobj`,
      `${contentIds[index]} 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`
    );
  });

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

function cellValue(row: ModuleRow, column: TableColumn, currency: string) {
  const value = row[column.key];
  if (column.type === "money") return formatMoney(value, currency);
  if (column.type === "number") return formatNumber(value);
  if (column.type === "date") return formatDate(value);
  if (column.type === "status") return String(value ?? "-").replaceAll("_", " ");
  return String(value ?? "-");
}

function moneyTotal(rows: ModuleRow[], columns: TableColumn[]) {
  const column = columns.find((item) => item.type === "money");
  if (!column) return null;
  return {
    label: `Total ${column.label}`,
    value: rows.reduce((sum, row) => sum + toNumber(row[column.key]), 0)
  };
}

function drawSummaryCard(content: string[], label: string, value: string, x: number, y: number, width: number) {
  content.push(rect(x, y, width, 45, { fill: "#ffffff", stroke: "#d9cba9", lineWidth: 0.7 }));
  content.push(text(label, x + 12, y + 28, { size: 7.5, font: "F2", color: "#7c6f55" }));
  content.push(text(value, x + 12, y + 12, { size: 11, font: "F2", color: "#171717" }));
}

function pageHeader(content: string[], options: { title: string; businessName: string; primary: string; accent: string; page: number; totalPages: number }) {
  content.push(rect(0, 0, 612, 792, { fill: "#fbfaf5" }));
  content.push(rect(0, 716, 612, 76, { fill: options.primary }));
  content.push(rect(0, 712, 612, 4, { fill: options.accent }));
  content.push(rect(42, 740, 36, 36, { fill: "#fff8e4", stroke: options.accent, lineWidth: 0.8 }));
  content.push(text("NS", 51, 753, { size: 13, font: "F2", color: options.primary }));
  content.push(text(options.businessName, 90, 760, { size: 16, font: "F2", color: "#ffffff" }));
  content.push(text("BUSINESS REPORT", 90, 742, { size: 8, font: "F2", color: "#f8edd2" }));
  content.push(text(options.title, 362, 758, { size: 16, font: "F2", color: "#ffffff", align: "right", width: 208 }));
  content.push(text(`Page ${options.page} of ${options.totalPages}`, 442, 738, { size: 8, color: "#f8edd2", align: "right", width: 128 }));
}

function pageFooter(content: string[], page: number, totalPages: number) {
  content.push(line(42, 42, 570, 42, "#d9cba9", 0.6));
  content.push(text("Confidential business report - generated by Namdhari Swaich Sweets Suite", 42, 26, { size: 7.5, color: "#7c6f55" }));
  content.push(text(`Page ${page}/${totalPages}`, 510, 26, { size: 7.5, color: "#7c6f55", align: "right", width: 60 }));
}

export function createReportPdf({
  title,
  description,
  moduleName,
  columns,
  rows,
  settings,
  generatedBy,
  filters = {},
  totalRecords
}: {
  title: string;
  description?: string;
  moduleName: string;
  columns: TableColumn[];
  rows: ModuleRow[];
  settings: ReportPdfSettings;
  generatedBy?: string | null;
  filters?: Record<string, string>;
  totalRecords?: number;
}) {
  const primary = safeColor(settings.themeColor);
  const accent = "#d7a84f";
  const currency = settings.currency ?? "INR";
  const businessName = settings.businessName || "Namdhari Swaich Sweets";
  const visibleColumns = columns.slice(0, 6);
  const rowLimit = 16;
  const rowChunks = rows.length > 0 ? Array.from({ length: Math.ceil(rows.length / rowLimit) }, (_, index) => rows.slice(index * rowLimit, index * rowLimit + rowLimit)) : [[]];
  const totalPages = rowChunks.length;
  const generatedAt = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const filtersText = Object.entries(filters)
    .filter(([key, value]) => key !== "format" && value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  const firstMoneyTotal = moneyTotal(rows, visibleColumns);
  const columnWidth = 528 / Math.max(1, visibleColumns.length);
  const pageStreams = rowChunks.map((chunk, index) => {
    const content: string[] = [];
    pageHeader(content, { title, businessName, primary, accent, page: index + 1, totalPages });

    if (index === 0) {
      content.push(text(description || "Operational report generated from current records.", 42, 690, { size: 9, color: "#5f5542" }));
      content.push(text([settings.address, settings.phone, settings.email].filter(Boolean).join(" | "), 42, 675, { size: 8, color: "#7c6f55" }));
      drawSummaryCard(content, "Module", moduleName, 42, 614, 122);
      drawSummaryCard(content, "Rows Exported", String(rows.length), 176, 614, 122);
      drawSummaryCard(content, "Total Records", String(totalRecords ?? rows.length), 310, 614, 122);
      drawSummaryCard(content, firstMoneyTotal?.label ?? "Generated", firstMoneyTotal ? formatMoney(firstMoneyTotal.value, currency) : generatedAt, 444, 614, 126);
      content.push(text("Generated By", 42, 590, { size: 7.5, font: "F2", color: "#7c6f55" }));
      content.push(text(generatedBy || "System", 118, 590, { size: 8.5, color: "#171717" }));
      content.push(text("Filters", 310, 590, { size: 7.5, font: "F2", color: "#7c6f55" }));
      content.push(text(filtersText || "No filters applied", 356, 590, { size: 8.5, color: "#171717" }));
    }

    const tableTop = index === 0 ? 548 : 668;
    content.push(rect(42, tableTop, 528, 26, { fill: "#f4ead1", stroke: "#d9cba9", lineWidth: 0.8 }));
    visibleColumns.forEach((column, columnIndex) => {
      content.push(text(column.label.toUpperCase(), 50 + columnIndex * columnWidth, tableTop + 9, { size: 7.4, font: "F2", color: "#4b4332" }));
    });

    if (rows.length === 0) {
      content.push(rect(42, tableTop - 48, 528, 48, { fill: "#ffffff", stroke: "#e5ddcc", lineWidth: 0.6 }));
      content.push(text("No records available for this report yet.", 58, tableTop - 27, { size: 10, font: "F2", color: "#5f5542" }));
      content.push(text("Add real business records first, then export again.", 58, tableTop - 42, { size: 8, color: "#7c6f55" }));
    } else {
      let rowY = tableTop - 27;
      chunk.forEach((row, rowIndex) => {
        content.push(rect(42, rowY, 528, 27, { fill: rowIndex % 2 === 0 ? "#ffffff" : "#fbf7ec", stroke: "#e5ddcc", lineWidth: 0.4 }));
        visibleColumns.forEach((column, columnIndex) => {
          const value = cellValue(row, column, currency);
          content.push(text(truncate(value, Math.max(12, Math.floor(columnWidth / 4.8))), 50 + columnIndex * columnWidth, rowY + 10, { size: 7.3, color: "#171717" }));
        });
        rowY -= 27;
      });
    }

    if (index === totalPages - 1 && rows.length > 0) {
      const y = 78;
      content.push(rect(354, y, 216, 34, { fill: primary, stroke: primary, lineWidth: 0.6 }));
      content.push(text("Report Total", 368, y + 20, { size: 8, font: "F2", color: "#f8edd2" }));
      content.push(text(firstMoneyTotal ? formatMoney(firstMoneyTotal.value, currency) : `${rows.length} rows`, 440, y + 20, { size: 11, font: "F2", color: "#ffffff", align: "right", width: 116 }));
    }

    pageFooter(content, index + 1, totalPages);
    return content.join("\n");
  });

  return buildPdf(pageStreams);
}
