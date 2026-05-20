import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Sourcey logo.
 *
 * Two variants:
 *  - "full" : icon + "Sourcey" wordmark (ratio ~3.54:1) — used in nav, footer, auth pages, mobile menu
 *  - "mark" : square icon only (the braided knot) — used in favicons, OG, sidebar collapsed states, social cards
 *
 * Files (in `public/logo/`):
 *  - sourcey-logo-tight.png  → full lockup (1051x297, tight padding)
 *  - sourcey-mark.png        → square icon (307x307)
 *  - sourcey-logo.png        → ORIGINAL with extra whitespace (kept for reference/print)
 */
export function Logo({
  variant = "full",
  className,
  height = 32,
  priority = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  if (variant === "mark") {
    return (
      <Image
        src="/logo/sourcey-mark.png"
        alt="Sourcey"
        width={307}
        height={307}
        priority={priority}
        className={cn("select-none", className)}
        style={{ height, width: height }}
      />
    );
  }

  // Full lockup — preserves the 3.54:1 aspect ratio
  const LOCKUP_RATIO = 1051 / 297;
  const renderWidth = Math.round(height * LOCKUP_RATIO);

  return (
    <Image
      src="/logo/sourcey-logo-tight.png"
      alt="Sourcey"
      width={1051}
      height={297}
      priority={priority}
      className={cn("select-none", className)}
      style={{ height, width: renderWidth }}
    />
  );
}
