import { cn } from "@/lib/utils/cn";

export function BrandLogo({
  className,
  imageClassName,
  priority = false
}: {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-grid overflow-hidden rounded-lg bg-slate-950 shadow-soft ring-1 ring-black/10", className)}>
      <img
        src="/brand/nss-logo.png"
        alt="Namdhari Swaich Sweets logo"
        width={512}
        height={512}
        loading={priority ? "eager" : "lazy"}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </span>
  );
}
