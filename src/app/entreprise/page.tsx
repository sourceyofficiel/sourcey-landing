import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { EnterpriseHero } from "@/components/landing/enterprise/EnterpriseHero";
import { EnterpriseUseCases } from "@/components/landing/enterprise/EnterpriseUseCases";
import { EnterpriseHow } from "@/components/landing/enterprise/EnterpriseHow";
import { EnterpriseBenefits } from "@/components/landing/enterprise/EnterpriseBenefits";
import { EnterpriseTestimonials } from "@/components/landing/enterprise/EnterpriseTestimonials";
import { EnterpriseLeadFormSection } from "@/components/landing/enterprise/EnterpriseLeadFormSection";

export const metadata: Metadata = {
  title: "Sourcey Entreprise — Votre supply chain Chine, gérée par des humains",
  description:
    "Pour les marques DTC, distributeurs et retailers : agent dédié, entrepôt EU intégré, SLA garanti. Tarif sur devis.",
  openGraph: {
    title: "Sourcey Entreprise — Sourcing Chine pour marques et gros volumes",
    description:
      "Agent 100% dédié, visites d'usine, entrepôt EU, gestion TVA. Demandez votre devis sous 24h.",
  },
};

export default function EntreprisePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <EnterpriseHero />
      <EnterpriseUseCases />
      <EnterpriseHow />
      <EnterpriseBenefits />
      <EnterpriseTestimonials />
      <EnterpriseLeadFormSection />
      <Footer />
    </main>
  );
}
