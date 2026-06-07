import { NextResponse } from "next/server";
import crypto from "node:crypto";
import type { PaymentMode, Unit } from "@/lib/domain-types";
import { prisma } from "@/lib/db/client";
import { toDatabaseJson } from "@/lib/db/json";
import { getCurrentUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { calculateSweetBoxLines } from "@/features/invoices/sweet-boxes";

type PosOrderRequest = {
  customerName?: string;
  customerPhone?: string;
  paymentMode?: PaymentMode;
  paidAmount?: number;
  notes?: string;
  items?: { productId: string; quantity: number }[];
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

function safeCustomerId(name: string, phone: string) {
  const key = (phone || name || "walk-in").replace(/\W+/g, "-").toLowerCase();
  return `pos-${key}`;
}

function shareToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
  }

  if (!can(user.roleKey, "pos", "create") && !can(user.roleKey, "invoices", "create")) {
    return NextResponse.json({ ok: false, message: "You do not have permission to create POS orders." }, { status: 403 });
  }

  if (!prisma) {
    return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as PosOrderRequest;
  const requestedItems = (body.items ?? []).filter((item) => item.productId && Number(item.quantity) > 0);

  if (requestedItems.length === 0) {
    return NextResponse.json({ ok: false, message: "Add at least one item." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: requestedItems.map((item) => item.productId) },
      active: true
    }
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const lines = requestedItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const quantity = Number(item.quantity);
      const price = decimal(product.sellingPrice);
      const taxRate = decimal(product.taxRate);
      const lineSubtotal = quantity * price;
      const taxAmount = (lineSubtotal * taxRate) / 100;
      return {
        product,
        quantity,
        price,
        taxRate,
        taxAmount,
        lineTotal: lineSubtotal + taxAmount
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  if (lines.length === 0) {
    return NextResponse.json({ ok: false, message: "Selected items are not available." }, { status: 400 });
  }

  const settings = await prisma.businessSettings.findFirst();
  const invoiceCount = await prisma.invoice.count();
  const prefix = settings?.invoicePrefix ?? "NSS";
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const total = subtotal + taxTotal;
  const sweetBoxLines = calculateSweetBoxLines(
    lines.map((line) => ({
      category: line.product.category,
      unit: line.product.unit,
      quantity: line.quantity
    }))
  );
  const paid = Math.min(Math.max(Number(body.paidAmount ?? total), 0), total);
  const due = Math.max(total - paid, 0);
  const customerName = String(body.customerName || "Walk-in Customer").trim();
  const customerPhone = String(body.customerPhone || "N/A").trim();
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await prisma.$transaction(async (client) => {
    const customer = await client.customer.upsert({
      where: { id: safeCustomerId(customerName, customerPhone) },
      update: {
        name: customerName,
        phone: customerPhone
      },
      create: {
        id: safeCustomerId(customerName, customerPhone),
        name: customerName,
        phone: customerPhone
      }
    });

    const createdInvoice = await client.invoice.create({
      data: {
        invoiceNumber,
        shareToken: shareToken(),
        customerId: customer.id,
        assignedToName: user.name,
        issueDate: new Date(),
        subtotal: subtotal.toFixed(2),
        discountTotal: "0",
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        paidAmount: paid.toFixed(2),
        dueAmount: due.toFixed(2),
        paymentMode: body.paymentMode ?? "CASH",
        status: due === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
        notes: body.notes || "POS counter order",
        cashierId: user.id,
        items: {
          create: [
            ...lines.map((line) => ({
              productId: line.product.id,
              productName: `${line.product.name} (${line.product.sku})`,
              quantity: line.quantity.toFixed(3),
              unit: line.product.unit as Unit,
              price: line.price.toFixed(2),
              discount: "0",
              taxRate: line.taxRate.toFixed(2),
              taxAmount: line.taxAmount.toFixed(2),
              lineTotal: line.lineTotal.toFixed(2)
            })),
            ...sweetBoxLines.map((box) => ({
              productId: null,
              productName: box.name,
              quantity: box.quantity.toFixed(3),
              unit: box.unit,
              price: "0",
              discount: "0",
              taxRate: "0",
              taxAmount: "0",
              lineTotal: "0"
            }))
          ]
        }
      }
    });

    for (const box of sweetBoxLines) {
      const inventoryItem = await client.inventoryItem.findFirst({
        where: { name: { equals: box.inventoryName }, active: true }
      });
      if (!inventoryItem) continue;

      await client.stockMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          movementType: "OUT",
          quantity: box.quantity.toFixed(3),
          unitCost: "0",
          totalCost: "0",
          notes: `Auto box used for POS order ${createdInvoice.invoiceNumber}`,
          createdById: user.id
        }
      });
    }

    if (due > 0) {
      await client.ledgerEntry.create({
        data: {
          ownerType: "CUSTOMER",
          entryType: "DEBIT",
          amount: due.toFixed(2),
          description: `Due amount for POS order ${createdInvoice.invoiceNumber}`,
          customerId: customer.id,
          invoiceId: createdInvoice.id
        }
      });
    }

    await client.auditLog.create({
      data: {
        module: "pos",
        action: "create-order",
        recordId: createdInvoice.id,
        recordTitle: createdInvoice.invoiceNumber,
        userId: user.id,
        newValues: toDatabaseJson({
          total,
          paid,
          due,
          itemCount: lines.length,
          autoSweetBoxes: sweetBoxLines.map((box) => `${box.quantity} x ${box.inventoryName}`)
        })
      }
    });

    return createdInvoice;
  });

  return NextResponse.json({
    ok: true,
    invoiceNumber: invoice.invoiceNumber,
    printUrl: `/pos/receipt/${encodeURIComponent(invoice.invoiceNumber)}`,
    pdfUrl: `/api/invoices/${encodeURIComponent(invoice.invoiceNumber)}/pdf`
  });
}

