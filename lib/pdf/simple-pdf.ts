import type { ModuleRow, TableColumn } from "@/features/modules/module-definitions";

function escapePdfText(value: unknown) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .slice(0, 110);
}

function line(text: string, x: number, y: number, size = 10) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

export function createSimplePdf({
  title,
  subtitle,
  columns,
  rows
}: {
  title: string;
  subtitle?: string;
  columns: TableColumn[];
  rows: ModuleRow[];
}) {
  const content: string[] = [];
  let y = 792 - 54;
  content.push(line("Namdhari Swaich Sweets", 54, y, 16));
  y -= 22;
  content.push(line(title, 54, y, 14));
  y -= 16;
  content.push(line(subtitle ?? `Generated ${new Date().toLocaleString("en-IN")}`, 54, y, 9));
  y -= 28;

  const visibleColumns = columns.slice(0, 5);
  content.push(line(visibleColumns.map((column) => column.label).join(" | "), 54, y, 8));
  y -= 14;
  content.push(line("-".repeat(118), 54, y, 8));
  y -= 14;

  for (const row of rows.slice(0, 34)) {
    if (y < 60) break;
    content.push(line(visibleColumns.map((column) => row[column.key] ?? "-").join(" | "), 54, y, 8));
    y -= 14;
  }

  if (rows.length === 0) {
    content.push(line("No records available for the selected filters.", 54, y, 10));
  }

  const stream = content.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`
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
