export const menuCategories = [
  "Sweets",
  "Fast Food",
  "Packed Items",
  "Drinks",
  "Cakes",
  "Ice Cream",
  "Dairy Products",
  "Namkeen & Snacks",
  "Bakery",
  "Festival Specials"
] as const;

export function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("sweet")) return "bg-amber-50 text-amber-900 border-amber-200";
  if (normalized.includes("fast")) return "bg-red-50 text-red-900 border-red-200";
  if (normalized.includes("packed")) return "bg-slate-50 text-slate-900 border-slate-200";
  if (normalized.includes("drink")) return "bg-sky-50 text-sky-900 border-sky-200";
  if (normalized.includes("cake")) return "bg-pink-50 text-pink-900 border-pink-200";
  if (normalized.includes("ice")) return "bg-cyan-50 text-cyan-900 border-cyan-200";
  if (normalized.includes("dairy")) return "bg-emerald-50 text-emerald-900 border-emerald-200";
  return "bg-muted text-foreground border-border";
}
