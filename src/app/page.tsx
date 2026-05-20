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
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sourcey — Trouve ton produit en Chine, un agent humain s'occupe du reste",
  description:
    "Sourcing depuis la Chine pour solos et marques DTC. Agent francophone dédié, vidéo QC, traduction temps réel, escrow. Sans CB, annulable à tout moment.",
};

/**
 * Landing Sourcey — full landing 10 sections, DA bleu inspirée Finora.
 *
 * Ordre des sections (pensé pour la conversion) :
 *  01 - Hero : promesse en 1 phrase + CTA principal
 *  02 - Solution : 3 étapes du flow Sourcey
 *  03 - FeaturesGrid : 4 piliers en tabs interactifs
 *  04 - WhoFor : Solo vs Marque DTC
 *  05 - Testimonials : la preuve que ça marche
 *  06 - Pricing : 3 plans (Pro mis en avant)
 *  07 - FAQ : objections les plus courantes
 *  08 - FinalCTA : dernière chance de convertir
 *     + Footer
 */
export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} />
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
