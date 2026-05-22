import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";

import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Footer } from "@/components/v2/V2Footer";

import { Hero } from "@/components/sourcing-achat/Hero";
import { Plans } from "@/components/sourcing-achat/Plans";
import { Compare } from "@/components/sourcing-achat/Compare";
import { Steps } from "@/components/sourcing-achat/Steps";
import { Faq } from "@/components/sourcing-achat/Faq";

import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sourcing & Achat — Sourcey",
  description:
    "Notre service complet pour importer depuis la Chine : identification des fournisseurs, négociation, contrôle qualité, livraison internationale.",
};

export const dynamic = "force-dynamic";

/**
 * Page /sourcing-achat — inspirée de MySourcify /sourcing-purchasing.
 *
 * Structure :
 *   1. Hero (titre + 2 photos produits côte à côte)
 *   2. Plans (2 cards : Sourcing complet vs Coordination)
 *   3. Compare (tableau comparatif 10 features × 2 cols)
 *   4. Steps (3 étapes : Sourcing, Production/QC, Livraison)
 *   5. Faq (6 questions accordéon)
 *   6. Banner CTA final
 */
export default async function SourcingAchatPage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2Nav user={user} transparentTop />

      <Hero />
      <Plans />
      <Compare />
      <Steps />
      <Faq />

      {/* === CTA Banner final === */}
      <section className="relative overflow-hidden bg-[#0E1535] py-20 text-white md:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute right-[15%] top-[20%] h-[300px] w-[300px] rounded-full bg-primary-500/25 blur-[120px]" />
          <div className="absolute left-[10%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-primary-400/15 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-[1000px] px-5 text-center md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            <MessageCircle className="h-3 w-3" />
            On répond sous 24h
          </div>

          <h2 className="mt-6 font-display text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.05] tracking-tight">
            Discute avec un expert{" "}
            <span className="bg-gradient-to-r from-primary-300 to-white bg-clip-text text-transparent">
              sourcing.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[14.5px] leading-relaxed text-white/70 md:text-[16px]">
            On comprend ton projet, on évalue la faisabilité, on te donne une
            estimation de prix et de délai. Sans engagement.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl py-2 pl-6 pr-2 text-[14.5px] font-semibold text-white"
              style={{
                background:
                  "linear-gradient(90deg, #3771ff -7.5%, #accfea 180%)",
                boxShadow:
                  "0 10px 24px -8px rgba(55,113,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full bg-[#000029] transition-transform duration-500 ease-out group-hover:translate-y-0"
              />
              <span className="relative z-10">Démarrer mon projet</span>
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                <ArrowUpRight
                  className="h-4 w-4 text-[#000029]"
                  strokeWidth={2.5}
                />
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      <V2Footer />
    </main>
  );
}
