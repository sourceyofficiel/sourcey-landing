import type { Metadata } from "next";
import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2FAQ } from "@/components/v2/V2FAQ";
import { V2FinalCTA } from "@/components/v2/V2FinalCTA";
import { V2Footer } from "@/components/v2/V2Footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FAQ — Sourcey",
  description:
    "Toutes les réponses aux questions fréquentes sur Sourcey : sécurité, garantie, types de produits, agents, annulation.",
};

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const user = await getCurrentUser();

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} transparentTop />
      <V2FAQ />
      <V2FinalCTA />
      <V2Footer />
    </main>
  );
}
