"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAvatarGradient, getInitials } from "@/lib/format";

/**
 * Avatar réutilisable : affiche l'image si `url` est fournie,
 * sinon fallback sur les initiales avec un gradient déterministe.
 *
 * Si l'URL d'image ne charge pas (404, CORS, etc.), on bascule
 * automatiquement sur le gradient — pas de crash.
 */
export function Avatar({
  id,
  name,
  url,
  size = 40,
  className,
}: {
  id: string;
  name?: string | null;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const safeId = id || "anon";
  const safeName = (name && name.trim()) || safeId;
  const gradient = getAvatarGradient(safeId);
  const initials = getInitials(safeName, safeName);

  const fontSize =
    size <= 32
      ? "text-[10.5px]"
      : size <= 44
        ? "text-[12.5px]"
        : size <= 64
          ? "text-[16px]"
          : "text-[22px]";

  if (url && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={safeName}
        onError={() => setImgFailed(true)}
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
