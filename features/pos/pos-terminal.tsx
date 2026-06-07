"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import type { InvoiceProduct } from "@/features/invoices/product-lookup";
import { menuCategories } from "@/features/menu/menu-categories";

type CartLine = InvoiceProduct & {
  quantity: number;
};

type PosOrderResult = {
  ok: boolean;
  message?: string;
  invoiceNumber?: string;
  printUrl?: string;
};

const paymentModes = ["CASH", "UPI", "CARD", "BANK", "CREDIT", "MIXED", "OTHER"];

export function PosTerminal({ products }: { products: InvoiceProduct[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("ALL");
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => Array.from(new Set([...menuCategories, ...products.map((product) => product.category)])).sort(), [products]);
  const visibleProducts = category === "ALL" ? products : products.filter((product) => product.category === category);
  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.sellingPrice, 0);
  const taxTotal = cart.reduce((sum, line) => sum + (line.quantity * line.sellingPrice * line.taxRate) / 100, 0);
  const total = subtotal + taxTotal;
  const paidValue = paidAmount === "" ? total : Number(paidAmount);
  const dueAmount = Math.max(total - (Number.isFinite(paidValue) ? paidValue : 0), 0);

  function addToCart(product: InvoiceProduct, qty = quantity) {
    const cleanQuantity = Math.max(Number(qty) || 1, 0.01);
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + cleanQuantity } : line));
      }
      return [...current, { ...product, quantity: cleanQuantity }];
    });
    setCode("");
    setQuantity(1);
    setMessage(null);
  }

  function addByCode() {
    const product = products.find((item) => item.sku.toLowerCase() === code.trim().toLowerCase());
    if (!product) {
      setMessage("Item code not found. Add products with SKU/item code first.");
      return;
    }
    addToCart(product);
  }

  async function completeOrder() {
    setMessage(null);
    if (cart.length === 0) {
      setMessage("Add at least one item before printing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMode,
          paidAmount: paidAmount === "" ? total : Number(paidAmount),
          notes,
          items: cart.map((line) => ({ productId: line.id, quantity: line.quantity }))
        })
      });
      const result = (await response.json()) as PosOrderResult;

      if (!response.ok || !result.ok || !result.printUrl) {
        setMessage(result.message ?? "Order could not be saved.");
        return;
      }

      window.open(result.printUrl, "_blank", "noopener,noreferrer");
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaidAmount("");
      setNotes("");
      setMessage(`Order ${result.invoiceNumber} saved. Receipt opened for printing.`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <section className="space-y-4">
        <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="grid gap-3 lg:grid-cols-[180px_1fr_120px_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm">
                <option value="ALL">All</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Item code</Label>
              <Input id="code" list="posCodes" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Scan or type SKU" />
              <datalist id="posCodes">
                {products.map((product) => (
                  <option key={product.id} value={product.sku}>
                    {product.name}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Qty</Label>
              <Input id="quantity" type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            </div>
            <Button type="button" onClick={addByCode}>
              Add code
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
            No menu items yet. Add real products with item codes, then POS buttons will appear here.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product, 1)}
                className="rounded-lg border border-border bg-white p-4 text-left shadow-soft transition hover:border-primary hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{product.sku}</p>
                  </div>
                  <Badge tone="muted">{product.category}</Badge>
                </div>
                <p className="mt-4 text-xl font-bold">{formatCurrency(product.sellingPrice)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current order</p>
              <h2 className="mt-1 text-xl font-bold">POS receipt</h2>
            </div>
            <Badge tone={cart.length > 0 ? "success" : "muted"}>{cart.length} items</Badge>
          </div>

          <div className="mt-4 space-y-3">
            {cart.length === 0 ? (
              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Tap menu items or scan/type item code to start.</p>
            ) : (
              cart.map((line) => (
                <div key={line.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{line.name}</p>
                      <p className="text-xs text-muted-foreground">{line.sku}</p>
                    </div>
                    <button type="button" onClick={() => setCart((current) => current.filter((item) => item.id !== line.id))} className="text-xs font-semibold text-red-700">
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Input
                      aria-label={`Quantity for ${line.name}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={line.quantity}
                      onChange={(event) =>
                        setCart((current) => current.map((item) => (item.id === line.id ? { ...item, quantity: Math.max(Number(event.target.value), 0.01) } : item)))
                      }
                      className="w-24"
                    />
                    <p className="font-semibold">{formatCurrency(line.quantity * line.sellingPrice)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer</Label>
              <Input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Walk-in Customer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input id="customerPhone" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment</Label>
              <select id="paymentMode" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm">
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid amount</Label>
              <Input id="paidAmount" type="number" min="0" step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} placeholder={total.toFixed(2)} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional receipt note" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-primary p-4 text-primary-foreground shadow-soft">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Due</span>
              <span>{formatCurrency(dueAmount)}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-white/20 pt-4">
            <p className="text-sm opacity-80">Order total</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
          </div>
          {message ? <p className="mt-3 rounded-md bg-white/12 px-3 py-2 text-sm">{message}</p> : null}
          <Button type="button" onClick={completeOrder} disabled={isSubmitting || cart.length === 0} className="mt-4 w-full bg-white text-primary hover:bg-white/90">
            {isSubmitting ? "Saving..." : "Complete and print"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
