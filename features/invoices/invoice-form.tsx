"use client";

import { useMemo, useState } from "react";
import { createModuleRecordAction } from "@/features/modules/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/format";
import { localizeValue, t, type Locale } from "@/lib/i18n/dictionary";
import type { InvoiceProduct } from "./product-lookup";

type InvoiceLine = InvoiceProduct & {
  quantity: number;
};

const copy = {
  en: {
    customer: "Customer",
    customerName: "Customer name",
    customerPhone: "Customer phone",
    assignedTo: "Assigned to",
    issueDate: "Invoice date",
    menuItems: "Menu items",
    menuCategory: "Menu category",
    itemCode: "Item code / SKU",
    quantity: "Quantity",
    addItem: "Add item",
    noProducts: "No menu items yet. Add products first with category and item code.",
    selectedItems: "Selected items",
    item: "Item",
    code: "Code",
    price: "Price",
    total: "Total",
    remove: "Remove",
    discount: "Discount",
    tax: "Tax",
    paidAmount: "Paid amount",
    paymentMode: "Payment mode",
    notes: "Notes",
    invoiceTotal: "Invoice total",
    createInvoice: "Create Invoice",
    addByCodeHelp: "Type the item code and press Add item. Category filters the code list for fast billing.",
    addItemsRequired: "Add at least one menu item before creating invoice."
  },
  pa: {
    customer: "ਗਾਹਕ",
    customerName: "ਗਾਹਕ ਨਾਮ",
    customerPhone: "ਗਾਹਕ ਫੋਨ",
    assignedTo: "Assigned to",
    issueDate: "ਇਨਵੌਇਸ ਮਿਤੀ",
    menuItems: "ਮੇਨੂ ਆਈਟਮਾਂ",
    menuCategory: "ਮੇਨੂ ਕੈਟਾਗਰੀ",
    itemCode: "ਆਈਟਮ ਕੋਡ / SKU",
    quantity: "ਮਾਤਰਾ",
    addItem: "ਆਈਟਮ ਜੋੜੋ",
    noProducts: "ਹਾਲੇ ਮੇਨੂ ਆਈਟਮਾਂ ਨਹੀਂ ਹਨ। ਪਹਿਲਾਂ ਕੈਟਾਗਰੀ ਅਤੇ ਆਈਟਮ ਕੋਡ ਨਾਲ ਪ੍ਰੋਡਕਟ ਜੋੜੋ।",
    selectedItems: "ਚੁਣੀਆਂ ਆਈਟਮਾਂ",
    item: "ਆਈਟਮ",
    code: "ਕੋਡ",
    price: "ਕੀਮਤ",
    total: "ਕੁੱਲ",
    remove: "ਹਟਾਓ",
    discount: "ਡਿਸਕਾਊਂਟ",
    tax: "ਟੈਕਸ",
    paidAmount: "ਭੁਗਤਾਨ ਰਕਮ",
    paymentMode: "ਭੁਗਤਾਨ ਢੰਗ",
    notes: "ਨੋਟਸ",
    invoiceTotal: "ਇਨਵੌਇਸ ਕੁੱਲ",
    createInvoice: "ਇਨਵੌਇਸ ਬਣਾਓ",
    addByCodeHelp: "ਆਈਟਮ ਕੋਡ ਲਿਖੋ ਅਤੇ ਆਈਟਮ ਜੋੜੋ ਦਬਾਓ। ਕੈਟਾਗਰੀ ਕੋਡ ਲਿਸਟ ਨੂੰ ਤੇਜ਼ ਬਿਲਿੰਗ ਲਈ ਫਿਲਟਰ ਕਰਦੀ ਹੈ।",
    addItemsRequired: "ਇਨਵੌਇਸ ਬਣਾਉਣ ਤੋਂ ਪਹਿਲਾਂ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਮੇਨੂ ਆਈਟਮ ਜੋੜੋ।"
  }
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function InvoiceForm({
  products,
  locale,
  assignees,
  canAssignInvoice,
  defaultAssignee
}: {
  products: InvoiceProduct[];
  locale: Locale;
  assignees: string[];
  canAssignInvoice: boolean;
  defaultAssignee: string;
}) {
  const [category, setCategory] = useState("ALL");
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))).sort(), [products]);
  const filteredProducts = category === "ALL" ? products : products.filter((product) => product.category === category);
  const selectedProduct = products.find((product) => product.sku.toLowerCase() === code.trim().toLowerCase());

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.sellingPrice, 0);
  const taxTotal = lines.reduce((sum, line) => sum + (line.quantity * line.sellingPrice * line.taxRate) / 100, 0);
  const total = Math.max(subtotal - discount + taxTotal, 0);
  const dueAmount = Math.max(total - paidAmount, 0);

  function addItem() {
    if (!selectedProduct) {
      setError(copy[locale].addItemsRequired);
      return;
    }

    setLines((current) => {
      const existing = current.find((line) => line.sku === selectedProduct.sku);
      if (existing) {
        return current.map((line) => (line.sku === selectedProduct.sku ? { ...line, quantity: line.quantity + quantity } : line));
      }
      return [...current, { ...selectedProduct, quantity }];
    });
    setCode("");
    setQuantity(1);
    setError(null);
  }

  return (
    <form action={createModuleRecordAction} className="grid gap-5 rounded-lg border border-border bg-white p-5 shadow-soft">
      <input type="hidden" name="moduleKey" value="invoices" />
      <input type="hidden" name="invoiceItemsJson" value={JSON.stringify(lines)} />
      <input type="hidden" name="subtotal" value={subtotal.toFixed(2)} />
      <input type="hidden" name="taxTotal" value={taxTotal.toFixed(2)} />
      {!canAssignInvoice ? <input type="hidden" name="assignedToName" value={defaultAssignee} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy[locale].customer}</p>
        </div>
        <div>
          <Label htmlFor="customerName">{copy[locale].customerName}</Label>
          <Input id="customerName" name="customerName" className="mt-2" required />
        </div>
        <div>
          <Label htmlFor="customerPhone">{copy[locale].customerPhone}</Label>
          <Input id="customerPhone" name="customerPhone" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="issueDate">{copy[locale].issueDate}</Label>
          <Input id="issueDate" name="issueDate" type="date" defaultValue={todayInputValue()} className="mt-2" required />
        </div>
        {canAssignInvoice ? (
          <div>
            <Label htmlFor="assignedToName">{copy[locale].assignedTo}</Label>
            {assignees.length > 0 ? (
              <select
                id="assignedToName"
                name="assignedToName"
                defaultValue={defaultAssignee}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value={defaultAssignee}>{defaultAssignee}</option>
                {assignees.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <Input id="assignedToName" name="assignedToName" defaultValue={defaultAssignee} className="mt-2" />
            )}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-muted/35 p-4">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{copy[locale].menuItems}</p>
          <p className="text-sm text-muted-foreground">{copy[locale].addByCodeHelp}</p>
        </div>
        {products.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-white p-4 text-sm text-muted-foreground">{copy[locale].noProducts}</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_120px_auto]">
            <div>
              <Label htmlFor="menuCategory">{copy[locale].menuCategory}</Label>
              <select
                id="menuCategory"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              >
                <option value="ALL">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="itemCode">{copy[locale].itemCode}</Label>
              <Input id="itemCode" list="productCodes" value={code} onChange={(event) => setCode(event.target.value)} className="mt-2" />
              <datalist id="productCodes">
                {filteredProducts.map((product) => (
                  <option key={product.sku} value={product.sku}>
                    {product.name} - {formatCurrency(product.sellingPrice)}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="quantity">{copy[locale].quantity}</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(0.01, Number(event.target.value)))}
                className="mt-2"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addItem} className="w-full">
                {copy[locale].addItem}
              </Button>
            </div>
          </div>
        )}
        {selectedProduct ? (
          <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-muted-foreground">
            {selectedProduct.name} - {selectedProduct.sku} - {formatCurrency(selectedProduct.sellingPrice)} / {localizeValue(locale, selectedProduct.unit)}
          </p>
        ) : null}
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <p className="text-sm font-semibold">{copy[locale].selectedItems}</p>
        </div>
        {lines.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{copy[locale].addItemsRequired}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{copy[locale].item}</th>
                  <th className="px-4 py-3">{copy[locale].code}</th>
                  <th className="px-4 py-3">{copy[locale].quantity}</th>
                  <th className="px-4 py-3">{copy[locale].price}</th>
                  <th className="px-4 py-3">{copy[locale].total}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lines.map((line) => (
                  <tr key={line.sku}>
                    <td className="px-4 py-3 font-medium">{line.name}</td>
                    <td className="px-4 py-3">{line.sku}</td>
                    <td className="px-4 py-3">
                      {line.quantity} {localizeValue(locale, line.unit)}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(line.sellingPrice)}</td>
                    <td className="px-4 py-3">{formatCurrency(line.quantity * line.sellingPrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLines((current) => current.filter((item) => item.sku !== line.sku))}>
                        {copy[locale].remove}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label htmlFor="discountTotal">{copy[locale].discount}</Label>
          <Input
            id="discountTotal"
            name="discountTotal"
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(event) => setDiscount(Math.max(0, Number(event.target.value)))}
            className="mt-2"
          />
        </div>
        <div>
          <Label>{copy[locale].tax}</Label>
          <Input value={taxTotal.toFixed(2)} className="mt-2" readOnly />
        </div>
        <div>
          <Label htmlFor="paidAmount">{copy[locale].paidAmount}</Label>
          <Input
            id="paidAmount"
            name="paidAmount"
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(event) => setPaidAmount(Math.max(0, Number(event.target.value)))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="paymentMode">{copy[locale].paymentMode}</Label>
          <select
            id="paymentMode"
            name="paymentMode"
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            {["CASH", "UPI", "CARD", "BANK", "CREDIT", "MIXED", "OTHER"].map((mode) => (
              <option key={mode} value={mode}>
                {localizeValue(locale, mode)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <Label htmlFor="notes">{copy[locale].notes}</Label>
          <Textarea id="notes" name="notes" className="mt-2" />
        </div>
        <div className="rounded-lg border border-border bg-primary p-4 text-primary-foreground">
          <p className="text-sm font-medium opacity-80">{copy[locale].invoiceTotal}</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(total)}</p>
          <p className="mt-2 text-sm opacity-80">Due: {formatCurrency(dueAmount)}</p>
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={lines.length === 0}>
          {copy[locale].createInvoice}
        </Button>
      </div>
    </form>
  );
}
