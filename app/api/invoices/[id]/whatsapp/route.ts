import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { formatCurrency } from "@/lib/utils/format";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeWhatsAppPhone(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length > 10) return digits;
  return "";
}

function appUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
}

function shareToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
  if (!can(user.roleKey, "invoices", "view")) return NextResponse.json({ ok: false, message: "You do not have permission to send invoices." }, { status: 403 });
  if (!prisma) return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });

  const { id } = await context.params;
  const [settings, invoice] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.invoice.findFirst({
      where: { OR: [{ id }, { invoiceNumber: id }] },
      include: { customer: true }
    })
  ]);

  if (!invoice) return NextResponse.json({ ok: false, message: "Invoice not found." }, { status: 404 });

  const invoiceWithToken = invoice.shareToken
    ? invoice
    : await prisma.invoice.update({
        where: { id: invoice.id },
        data: { shareToken: shareToken() },
        include: { customer: true }
      });

  const recipient = normalizeWhatsAppPhone(invoice.customer?.phone) || normalizeWhatsAppPhone(settings?.whatsappNumber);
  if (!recipient) {
    return NextResponse.json({ ok: false, message: "No customer WhatsApp/phone found. Add customer phone or business WhatsApp in Settings." }, { status: 400 });
  }

  const shareUrl = `${appUrl(request)}/share/invoice/${invoiceWithToken.shareToken}`;
  const businessWhatsapp = settings?.whatsappNumber ? `\nShop WhatsApp: ${settings.whatsappNumber}` : "";
  const message = [
    `Namdhari Swaich Sweets Invoice ${invoice.invoiceNumber}`,
    `Total: ${formatCurrency(invoice.total.toString())}`,
    `Paid: ${formatCurrency(invoice.paidAmount.toString())}`,
    `Due: ${formatCurrency(invoice.dueAmount.toString())}`,
    `View invoice: ${shareUrl}${businessWhatsapp}`
  ].join("\n");

  await prisma.auditLog.create({
    data: {
      module: "invoices",
      action: "whatsapp-share",
      recordId: invoice.id,
      recordTitle: invoice.invoiceNumber,
      userId: user.id
    }
  });

  return NextResponse.redirect(`https://wa.me/${recipient}?text=${encodeURIComponent(message)}`);
}
