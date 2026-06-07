import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppIcon } from "@/components/app/icon";
import { getMenuItems } from "@/features/menu/menu-service";
import { categoryTone, menuCategories } from "@/features/menu/menu-categories";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { localizeValue, type Locale } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";
import { formatCurrency } from "@/lib/utils/format";

type PageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

const copy = {
  en: {
    eyebrow: "Sales",
    title: "Menu",
    description: "Live menu catalogue for sweets, fast food, packed items, drinks, cakes, ice cream, dairy products, and billing codes.",
    searchPlaceholder: "Search item, category, or code...",
    all: "All",
    addProduct: "Add Product",
    itemCode: "Item Code",
    category: "Category",
    unit: "Unit",
    tax: "Tax",
    emptyTitle: "No menu items yet",
    emptyDescription: "Products are intentionally empty. Add real sweets, fast food, packed items, drinks, cakes, ice cream, dairy products, and item codes before invoicing."
  },
  pa: {
    eyebrow: "ਵਿਕਰੀ",
    title: "ਮੇਨੂ",
    description: "ਬਿਲਿੰਗ ਲਈ ਲਾਈਵ ਮੇਨੂ ਕੈਟਾਲਾਗ। ਪ੍ਰੋਡਕਟ ਵਿੱਚ ਮੇਨੂ ਕੈਟਾਗਰੀ ਅਤੇ ਆਈਟਮ ਕੋਡ ਜੋੜੋ, ਫਿਰ ਇਨਵੌਇਸ ਵਿੱਚ ਕੋਡ ਨਾਲ ਆਈਟਮ ਲਿਆਓ।",
    searchPlaceholder: "ਆਈਟਮ, ਕੈਟਾਗਰੀ ਜਾਂ ਕੋਡ ਖੋਜੋ...",
    all: "ਸਾਰੇ",
    addProduct: "ਪ੍ਰੋਡਕਟ ਜੋੜੋ",
    itemCode: "ਆਈਟਮ ਕੋਡ",
    category: "ਕੈਟਾਗਰੀ",
    unit: "ਯੂਨਿਟ",
    tax: "ਟੈਕਸ",
    emptyTitle: "ਹਾਲੇ ਕੋਈ ਮੇਨੂ ਆਈਟਮ ਨਹੀਂ",
    emptyDescription: "ਪ੍ਰੋਡਕਟ ਜਾਣਬੁੱਝ ਕੇ ਖਾਲੀ ਹਨ। ਇਨਵੌਇਸ ਤੋਂ ਪਹਿਲਾਂ ਅਸਲੀ ਮਿਠਾਈ, ਸਨੈਕਸ, ਡੇਅਰੀ ਆਈਟਮ ਅਤੇ ਕੋਡ ਜੋੜੋ।"
  }
} as const satisfies Record<Locale, Record<string, string>>;

export const metadata = {
  title: "Menu"
};

function categoryHref(category: string, search?: string) {
  const params = new URLSearchParams();
  if (category !== "ALL") params.set("category", category);
  if (search) params.set("q", search);
  const query = params.toString();
  return query ? `/menu?${query}` : "/menu";
}

export default async function MenuPage({ searchParams }: PageProps) {
  const [user, locale, query] = await Promise.all([requireUser(), getLocale(), searchParams]);
  if (!can(user.roleKey, "menu", "view")) redirect("/dashboard");

  const allItems = await getMenuItems({ search: query.q });
  const categories = Array.from(new Set([...menuCategories, ...allItems.map((item) => item.category)])).sort();
  const categoryCounts = new Map<string, number>();
  for (const item of allItems) {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  }
  const activeCategory = query.category?.trim() || "ALL";
  const items = activeCategory === "ALL" ? allItems : allItems.filter((item) => item.category === activeCategory);
  const c = copy[locale];
  const canAddProducts = can(user.roleKey, "products", "create");

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">{c.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{c.description}</p>
          </div>
          {canAddProducts ? (
            <Button asChild>
              <Link href="/products/new">
                <AppIcon name="plus" />
                {c.addProduct}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
        <form action="/menu" className="flex flex-col gap-3 sm:flex-row">
          {activeCategory !== "ALL" ? <input type="hidden" name="category" value={activeCategory} /> : null}
          <Input name="q" defaultValue={query.q ?? ""} placeholder={c.searchPlaceholder} className="sm:max-w-md" />
          <Button type="submit" variant="outline">
            <AppIcon name="search" />
            Search
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant={activeCategory === "ALL" ? "default" : "outline"} size="sm">
            <Link href={categoryHref("ALL", query.q)}>{c.all}</Link>
          </Button>
          {categories.map((category) => (
            <Button key={category} asChild variant={activeCategory === category ? "default" : "outline"} size="sm">
              <Link href={categoryHref(category, query.q)}>{category}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category}
            href={categoryHref(category, query.q)}
            className={`rounded-lg border p-4 shadow-soft transition hover:-translate-y-0.5 ${categoryTone(category)} ${
              activeCategory === category ? "ring-2 ring-primary/30" : ""
            }`}
          >
            <p className="text-sm font-bold">{category}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{categoryCounts.get(category) ?? 0} items</p>
          </Link>
        ))}
      </section>

      {items.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-accent text-accent-foreground">
            <AppIcon name="menu" className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{c.emptyTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{c.emptyDescription}</p>
          {canAddProducts ? (
            <Button asChild className="mt-5">
              <Link href="/products/new">
                <AppIcon name="plus" />
                {c.addProduct}
              </Link>
            </Button>
          ) : null}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="muted">{item.category}</Badge>
                  <h3 className="mt-3 text-lg font-bold">{item.name}</h3>
                </div>
                <p className="text-right text-lg font-bold text-primary">{formatCurrency(item.sellingPrice)}</p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted/55 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.itemCode}</dt>
                  <dd className="mt-1 font-bold">{item.sku}</dd>
                </div>
                <div className="rounded-md bg-muted/55 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.unit}</dt>
                  <dd className="mt-1 font-bold">{localizeValue(locale, item.unit)}</dd>
                </div>
                <div className="rounded-md bg-muted/55 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.tax}</dt>
                  <dd className="mt-1 font-bold">{item.taxRate}%</dd>
                </div>
                <div className="rounded-md bg-muted/55 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.category}</dt>
                  <dd className="mt-1 font-bold">{item.category}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
