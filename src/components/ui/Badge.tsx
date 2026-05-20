import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "neutral" | "success" | "enterprise" | "warning";
  className?: string;
}) {
  const variants = {
    primary: "bg-primary-50 text-primary-700 border-primary-100",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    enterprise: "bg-enterprise-50 text-enterprise-700 border-enterprise-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
