import type { Metadata } from "next";
import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Hero } from "@/components/v2/V2Hero";
import { V2Offer } from "@/components/v2/V2Offer";
import { V2Solution } from "@/components/v2/V2Solution";
import { V2Risks } from "@/components/v2/V2Risks";
import { V2Testimonials } from "@/components/v2/V2Testimonials";
import { V2FinalCTA } from "@/components/v2/V2FinalCTA";
import { V2Footer } from "@/components/v2/V2Footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sourcey — Trouve ton produit en Chine, un agent humain s'occupe du reste",
  description:
    "Sourcing depuis la Chine pour solos et marques DTC. Agent francophone dédié, vidéo QC, traduction temps réel, escrow. Sans CB, annulable à tout moment.",
};

// Force dynamic rendering — la nav doit refléter l'état de session
// (cookie JWT) à chaque requête, pas un cache static.
export const dynamic = "force-dynamic";

/**
 * Landing Sourcey — DA bleu.
 *
 * Ordre des sections :
 *  01 - Hero       : vidéo cargo + promesse + CTA principal
 *  02 - Offer      : 5 piliers + 2 CTAs
 *  03 - Risks      : ce qui peut mal tourner en solo
 *  04 - Solution   : le process Sourcey en 3 étapes
 *  05 - Testimonials : preuves clients
 *  06 - FinalCTA   : dernière chance de convertir
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
      <V2Offer />
      <V2Risks />
      <V2Solution />
      <V2Testimonials />
      <V2FinalCTA />
      <V2Footer />
    </main>
  );
}
