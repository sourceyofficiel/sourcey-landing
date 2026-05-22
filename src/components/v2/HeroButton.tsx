"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/**
 * HeroButton — CTA primaire du hero, style MySourcify.
 *
 * Tailwind pur + framer-motion (pas de styled-jsx qui foirait
 * en App Router avec MotionConfig). Effet hover :
 *   - Overlay navy qui slide-up depuis le bas (CSS pseudo-element)
 *   - Icon box blanc avec arrow qui tourne légèrement
 */
export function HeroButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl py-2 pl-6 pr-2 text-[14.5px] font-semibold text-white"
      style={{
        background: "linear-gradient(90deg, #3771ff -7.5%, #accfea 180%)",
        boxShadow:
          "0 10px 24px -8px rgba(55,113,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      {/* Overlay navy qui slide-up au hover */}
      <span
        aria-hidden
        className="absolute inset-0 translate-y-full bg-[#000029] transition-transform duration-500 ease-out group-hover:translate-y-0"
      />

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Icon box blanc */}
      <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
        <motion.span
          whileHover={{ rotate: 45 }}
          className="inline-flex items-center justify-center"
        >
          <ArrowUpRight className="h-4 w-4 text-[#000029]" strokeWidth={2.5} />
        </motion.span>
      </span>
    </Link>
  );
}
