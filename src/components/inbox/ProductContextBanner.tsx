"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Package,
  TestTube,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductContext } from "@/lib/types/messaging";

export function ProductContextBanner({ context }: { context: ProductContext }) {
  const isSample = context.requestType === "sample";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-neutral-100 bg-gradient-to-r from-primary-50/40 via-white to-amber-50/30 px-4 py-3 md:px-6"
    >
      <div className="flex items-center gap-3">
        <Link
          href={`/catalog/${context.productSlug}`}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition-transform hover:scale-105"
        >
          {context.productImage ? (
            <Image
              src={context.productImage}
              alt={context.productTitle}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <Package className="h-5 w-5 text-neutral-400" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                isSample
                  ? "bg-amber-100 text-amber-700"
                  : "bg-primary-100 text-primary-700"
              )}
            >
              {isSample ? (
                <>
                  <TestTube className="h-2.5 w-2.5" />
                  Sample
                </>
              ) : (
                <>
                  <Package className="h-2.5 w-2.5" />
                  Devis
                </>
              )}
            </span>
            {!isSample && context.quantity && (
              <span className="text-[10.5px] font-semibold text-neutral-600">
                {context.quantity}u
              </span>
            )}
            {context.fromPrice !== null && (
              <span className="text-[10.5px] text-neutral-500">
                · à partir de{" "}
                <strong className="text-neutral-700">
                  {context.fromPrice.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </strong>{" "}
                /u
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10.5px] text-neutral-500">
              <Clock className="h-2.5 w-2.5" />
              Lead {context.leadTimeDays}j
            </span>
          </div>
          <Link
            href={`/catalog/${context.productSlug}`}
            className="mt-0.5 line-clamp-1 text-[13px] font-bold text-neutral-900 hover:underline"
          >
            {context.productTitle}
          </Link>
          <p className="line-clamp-1 text-[11px] text-neutral-500">
            {context.productPitch}
          </p>
        </div>

        <Link
          href={`/catalog/${context.productSlug}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          Fiche
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>
    </motion.div>
  );
}
