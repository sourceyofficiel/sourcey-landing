import type { Metadata } from "next";
import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Pricing } from "@/components/v2/V2Pricing";
import { V2FinalCTA } from "@/components/v2/V2FinalCTA";
import { V2Footer } from "@/components/v2/V2Footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tarifs — Sourcey",
  description:
    "Plans de sourcing managé Sourcey : Gratuit, Starter 29€, Pro 79€. Tu paies l'abonnement, on s'occupe de tout.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} />
      <V2Pricing />
      <V2FinalCTA />
      <V2Footer />
    </main>
  );
}
