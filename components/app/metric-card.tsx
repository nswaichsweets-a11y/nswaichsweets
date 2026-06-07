import { Card, CardContent } from "@/components/ui/card";
import { AppIcon } from "./icon";

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default"
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div
          className={
            "grid h-10 w-10 shrink-0 place-items-center rounded-lg " +
            (tone === "success"
              ? "bg-emerald-100 text-emerald-800"
              : tone === "warning"
                ? "bg-amber-100 text-amber-900"
                : tone === "danger"
                  ? "bg-red-100 text-red-800"
                  : "bg-accent text-accent-foreground")
          }
        >
          <AppIcon name={icon} className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
