"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/marquee";
import { viewportOnce } from "@/lib/motion";

const LOGOS = [
  { name: "Shopify", slug: "shopify" },
  { name: "WooCommerce", slug: "woocommerce" },
  { name: "PrestaShop", slug: "prestashop" },
  { name: "Amazon", slug: "amazon" },
  { name: "TikTok", slug: "tiktok" },
  { name: "Etsy", slug: "etsy" },
  { name: "Wix", slug: "wix" },
  { name: "Stripe", slug: "stripe" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-neutral-200/60 bg-neutral-50/50 py-12">
      <Container>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500"
        >
          Compatible avec tes outils e-commerce
        </motion.p>

        <div className="relative [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
          <Marquee pauseOnHover className="[--duration:35s] [--gap:3rem]">
            {LOGOS.map((logo) => (
              <LogoCell key={logo.slug} {...logo} />
            ))}
          </Marquee>
        </div>
      </Container>
    </section>
  );
}

function LogoCell({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 text-neutral-400 transition-colors hover:text-neutral-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.simpleicons.org/${slug}/64748B`}
        alt={name}
        className="h-7 w-7 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        loading="lazy"
      />
      <span className="text-base font-semibold tracking-tight">{name}</span>
    </div>
  );
}
