"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (images.length === 0) return null;
  const active = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={active}
              alt={title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-neutral-100 transition-all",
                i === activeIndex
                  ? "border-primary-500 shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
