import type { Metadata } from "next";

import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Footer } from "@/components/v2/V2Footer";

import { SourcingBanner } from "@/components/features-sourcing/SourcingBanner";
import { SourcingProblem } from "@/components/features-sourcing/SourcingProblem";
import { SourcingMethod } from "@/components/features-sourcing/SourcingMethod";
import { SourcingCoverage } from "@/components/features-sourcing/SourcingCoverage";
import { SourcingDemo } from "@/components/features/SourcingDemo";
import { SourcingFAQ } from "@/components/features-sourcing/SourcingFAQ";

import { getCurrentUser } from "@/lib/auth";

/**
 * Page dédiée /features/sourcing — override la route dynamique [slug].
 *
 * Structure (light, ~1500-2000 mots, 6 sections de contenu) :
 *   1. SourcingBanner   — hero image-left/content-right (style WeStock adapté)
 *   2. SourcingProblem  — 3 frictions du sourcing solo
 *   3. SourcingMethod   — 4 étapes du process avec timeline + image sticky
 *   4. SourcingCoverage — catégories couvertes + hubs Chine
 *   5. SourcingDemo     — comparateur interactif 3 fournisseurs (existant)
 *   6. SourcingFAQ      — 5 questions de réassurance + CTA final inline
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sourcing fournisseur — Sourcey",
  description:
    "Notre équipe terrain en Chine identifie et vérifie chaque usine avant de te la présenter. 3-5 options comparées, prêtes à produire pour toi.",
};

export default async function SourcingFeaturePage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} />

      <SourcingBanner />
      <SourcingProblem />
      <SourcingMethod />
      <SourcingCoverage />
      <SourcingDemo />
      <SourcingFAQ />

      <V2Footer />
    </main>
  );
}
