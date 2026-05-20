import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const sizes = {
    narrow: "max-w-3xl",
    default: "max-w-[1280px]",
    wide: "max-w-[1440px]",
  };
  return (
    <div className={cn("mx-auto w-full px-6 lg:px-8", sizes[size], className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative py-20 md:py-28 lg:py-32", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  eyebrowVariant = "primary",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  eyebrowVariant?: "primary" | "enterprise";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const eyebrowColor =
    eyebrowVariant === "enterprise"
      ? "text-enterprise-700 bg-enterprise-50 border-enterprise-100"
      : "text-primary-700 bg-primary-50 border-primary-100";

  return (
    <div className={cn("max-w-3xl", alignClass)}>
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            eyebrowColor
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-balance font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-lg leading-relaxed text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}
