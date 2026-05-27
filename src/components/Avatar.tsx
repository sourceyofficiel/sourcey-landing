import { cn } from "@/lib/utils";
import { getAvatarGradient, getInitials } from "@/lib/format";

/**
 * Avatar réutilisable : affiche l'image si `url` est fournie,
 * sinon fallback sur les initiales avec un gradient déterministe.
 */
export function Avatar({
  id,
  name,
  url,
  size = 40,
  className,
}: {
  id: string;
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const gradient = getAvatarGradient(id);
  const initials = getInitials(name, name);

  const fontSize =
    size <= 32
      ? "text-[10.5px]"
      : size <= 44
        ? "text-[12.5px]"
        : size <= 64
          ? "text-[16px]"
          : "text-[22px]";

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-inset ring-neutral-200",
          className
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white",
        gradient,
        fontSize,
        className
      )}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
