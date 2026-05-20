import type { Metadata } from "next";
import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Hero } from "@/components/v2/V2Hero";
import { V2Solution } from "@/components/v2/V2Solution";
import { V2FeaturesGrid } from "@/components/v2/V2FeaturesGrid";
import { V2WhoFor } from "@/components/v2/V2WhoFor";
import { V2Testimonials } from "@/components/v2/V2Testimonials";
import { V2Pricing } from "@/components/v2/V2Pricing";
import { V2FAQ } from "@/components/v2/V2FAQ";
import { V2FinalCTA } from "@/components/v2/V2FinalCTA";
import { V2Footer } from "@/components/v2/V2Footer";

export const metadata: Metadata = {
  title: "Sourcey — Trouve ton produit en Chine, un agent humain s'occupe du reste",
  description:
    "Sourcing depuis la Chine pour solos et marques DTC. Agent francophone dédié, vidéo QC, traduction temps réel, escrow. Sans CB, annulable à tout moment.",
};

/**
 * Landing V2 — full landing 10 sections, DA bleu Sourcey inspirée Finora.
 *
 * Ordre des sections (pensé pour la conversion) :
 *  01 - Hero : promesse en 1 phrase + CTA principal
 *  02 - LogoBar : preuve sociale immédiate
 *  03 - Problems : "tu connais cette douleur ?"
 *  04 - Solution : 3 étapes du flow Sourcey
 *  05 - FeaturesGrid : 6 features détaillées
 *  06 - WhoFor : Solo vs Marque DTC
 *  07 - Testimonials : la preuve que ça marche
 *  08 - Pricing : 3 plans (Pro mis en avant)
 *  09 - FAQ : objections les plus courantes
 *  10 - FinalCTA : dernière chance de convertir
 *     + Footer
 */
export default function LandingV2Page() {
  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav />
      <V2Hero />
      <V2Solution />
      <V2FeaturesGrid />
      <V2WhoFor />
      <V2Testimonials />
      <V2Pricing />
      <V2FAQ />
      <V2FinalCTA />
      <V2Footer />
    </main>
  );
}
