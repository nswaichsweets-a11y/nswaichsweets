import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-accent text-accent-foreground",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "warning" && "bg-amber-100 text-amber-900",
        tone === "danger" && "bg-red-100 text-red-800",
        tone === "muted" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
