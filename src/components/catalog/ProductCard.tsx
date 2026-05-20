"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Star,
  TrendingUp,
  BadgeCheck,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/types/products";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <Link
        href={`/catalog/${product.slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top-left badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Featured
              </span>
            )}
            {product.isNew && !product.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Nouveau
              </span>
            )}
          </div>

          {/* Vetted badge top-right */}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-primary-700 shadow-sm backdrop-blur">
            <BadgeCheck className="h-3 w-3" />
            Vetted
          </span>

          {/* Sourced count overlay */}
          {product.sourcedTimes > 30 && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              <TrendingUp className="h-2.5 w-2.5" />
              {product.sourcedTimes}× sourcé
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-neutral-900">
            {product.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-neutral-500">
            {product.shortPitch}
          </p>

          {/* Agent */}
          <div className="mt-3 flex items-center gap-2">
            <Image
              src={product.agentAvatarUrl}
              alt={product.agentName}
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-[11px] text-neutral-500">
              <strong className="font-semibold text-neutral-700">
                {product.agentName}
              </strong>{" "}
              · {product.agentCity}
            </span>
          </div>

          {/* Price + MOQ */}
          <div className="mt-auto pt-3">
            <div className="flex items-baseline justify-between gap-2 border-t border-neutral-100 pt-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  À partir de
                </p>
                <p className="font-display text-lg font-extrabold tracking-tight text-neutral-900">
                  {product.fromPrice.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                  <span className="text-[11px] font-medium text-neutral-500">
                    {" "}
                    /u
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  MOQ
                </p>
                <p className="text-sm font-bold text-neutral-700">
                  {product.moq}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {product.leadTimeDays}j prod
              </span>
              {product.rating && (
                <span className="inline-flex items-center gap-0.5 text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-neutral-400">
                    ({product.reviewCount})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
