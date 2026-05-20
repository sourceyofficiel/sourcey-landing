"use client";

import { cn } from "@/lib/utils";

interface MenuToggleIconProps {
  open: boolean;
  className?: string;
  duration?: number;
}

/**
 * Animated hamburger ↔ X icon.
 * Two horizontal bars that rotate into an X when open.
 */
export function MenuToggleIcon({
  open,
  className,
  duration = 300,
}: MenuToggleIconProps) {
  const transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-5", className)}
    >
      <line
        x1="4"
        y1="8"
        x2="20"
        y2="8"
        style={{
          transformOrigin: "12px 8px",
          transform: open ? "translateY(4px) rotate(45deg)" : "none",
          transition,
        }}
      />
      <line
        x1="4"
        y1="16"
        x2="20"
        y2="16"
        style={{
          transformOrigin: "12px 16px",
          transform: open ? "translateY(-4px) rotate(-45deg)" : "none",
          transition,
        }}
      />
    </svg>
  );
}
