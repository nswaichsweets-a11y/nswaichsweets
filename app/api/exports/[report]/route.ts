import { NextResponse } from "next/server";
import { moduleDefinitions } from "@/features/modules/module-definitions";
import { listModuleRecords } from "@/features/modules/repository";
import { getReportDefinition } from "@/features/reports/report-definitions";
import { rowsToCsv } from "@/lib/export/csv";
import { createReportPdf } from "@/lib/pdf/report-pdf";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";

type RouteContext = {
  params: Promise<{ report: string }>;
};

function filename(text: string, extension: string) {
  return `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

export async function GET(request: Request, context: RouteContext) {
  const { report: reportKey } = await context.params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "csv";
  const report = getReportDefinition(reportKey);
  const moduleDefinition =
    moduleDefinitions.find((module) => module.exportKey === reportKey) ??
    moduleDefinitions.find((module) => module.key === report?.sourceModuleKey);

  if (!moduleDefinition) {
    return NextResponse.json({ ok: false, message: "Unknown report." }, { status: 404 });
  }

  const title = report?.title ?? moduleDefinition.title;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
  }

  if (!can(currentUser.roleKey, moduleDefinition.key, "export") && !can(currentUser.roleKey, "reports", "export")) {
    return NextResponse.json({ ok: false, message: "You do not have permission to export this report." }, { status: 403 });
  }

  const [records, settings] = await Promise.all([
    listModuleRecords(moduleDefinition.key, { pageSize: 50 }),
    prisma ? prisma.businessSettings.findFirst().catch(() => null) : Promise.resolve(null)
  ]);
  const filters = Object.fromEntries(url.searchParams.entries());

  if (prisma) {
    await prisma.reportExportLog
      .create({
        data: {
          reportKey,
          reportTitle: title,
          format: format === "pdf" ? "PDF" : "CSV",
          generatedById: currentUser.id,
          filters
        }
      })
      .catch(() => undefined);
  }

  if (format === "pdf") {
    const pdf = createReportPdf({
      title,
      description: report?.description ?? moduleDefinition.description,
      moduleName: report?.module ?? moduleDefinition.category,
      columns: moduleDefinition.columns,
      rows: records.rows,
      settings: settings ?? {
        businessName: "Namdhari Swaich Sweets",
        currency: "INR",
        themeColor: "#141b18"
      },
      generatedBy: currentUser.name,
      filters,
      totalRecords: records.total
    });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename(title, "pdf")}"`
      }
    });
  }

  const csv = rowsToCsv(title, moduleDefinition.columns, records.rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename(title, "csv")}"`
    }
  });
}
