"use client";

import React, { useCallback, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = "#3B82F6",
  gradientOpacity = 0.12,
  gradientFrom = "#3B82F6",
  gradientTo = "#9333EA",
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-neutral-200 bg-white",
        className
      )}
      style={{
        background: useMotionTemplate`
          linear-gradient(white 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            #e2e8f0 100%
          ) border-box
        `,
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-px z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 80%)`,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
