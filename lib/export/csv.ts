import type { ModuleRow, TableColumn } from "@/features/modules/module-definitions";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function rowsToCsv(title: string, columns: TableColumn[], rows: ModuleRow[]) {
  const header = columns.map((column) => escapeCsv(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => escapeCsv(row[column.key])).join(","));
  return [`Report,${escapeCsv(title)}`, `Generated,${escapeCsv(new Date().toLocaleString("en-IN"))}`, "", header, ...body].join("\n");
}
