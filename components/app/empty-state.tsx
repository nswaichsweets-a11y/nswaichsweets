import { Button } from "@/components/ui/button";
import { AppIcon } from "./icon";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/70 p-8 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
        <AppIcon name="file" className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5">
          <a href={actionHref}>
            <AppIcon name="plus" />
            {actionLabel}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
