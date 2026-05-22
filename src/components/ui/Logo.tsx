import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Sourcey logo.
 *
 * Variants :
 *  - "full"  : icon + "Sourcey" wordmark — version normale (texte dark via PNG)
 *  - "mark"  : square icon only — utilisé pour favicons, OG, etc.
 *  - "white" : icon + "Sourcey" rendu en HTML avec texte BLANC (pour fonds sombres)
 */
export function Logo({
  variant = "full",
  className,
  height = 32,
  priority = false,
}: {
  variant?: "full" | "mark" | "white";
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

  if (variant === "white") {
    // Icon (mark PNG) + texte "Sourcey" en blanc, rendu HTML pour pouvoir
    // styliser la couleur du texte.
    return (
      <div className={cn("flex items-center gap-2 select-none", className)}>
        <Image
          src="/logo/sourcey-mark.png"
          alt=""
          width={307}
          height={307}
          priority={priority}
          style={{ height, width: height }}
        />
        <span
          className="font-display font-extrabold tracking-tight text-white"
          style={{ fontSize: Math.round(height * 0.65) }}
        >
          Sourcey
        </span>
      </div>
    );
  }

  // Full lockup — preserves the 3.54:1 aspect ratio (PNG avec texte dark)
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
