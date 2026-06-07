import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { getCurrentUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
  }

  if (!can(user.roleKey, "invoices", "view")) {
    return NextResponse.json({ ok: false, message: "You do not have permission to view invoices." }, { status: 403 });
  }

  if (!prisma) {
    return NextResponse.json({ ok: false, message: "Database is not configured. No invoice data is available." }, { status: 503 });
  }

  const [settings, invoice] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }]
      },
      include: {
        customer: true,
        items: {
          orderBy: { createdAt: "asc" }
        },
        cashier: {
          select: { name: true }
        }
      }
    })
  ]);

  if (!invoice) {
    return NextResponse.json({ ok: false, message: "Invoice not found." }, { status: 404 });
  }

  const pdf = createInvoicePdf({
    settings: settings ?? {
      businessName: "Namdhari Swaich Sweets",
      address: "",
      phone: "",
      invoiceFooterTerms: "Thank you for your business.",
      currency: "INR",
      themeColor: "#141b18"
    },
    invoice,
    customer: invoice.customer,
    items: invoice.items,
    cashierName: invoice.cashier?.name
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}
