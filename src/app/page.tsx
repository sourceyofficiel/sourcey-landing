import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ForWho } from "@/components/landing/ForWho";
import { Stats } from "@/components/landing/Stats";
import { FeaturesTabs } from "@/components/landing/FeaturesTabs";
import { Comparison } from "@/components/landing/Comparison";
import { AgentsGallery } from "@/components/landing/AgentsGallery";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <HowItWorks />
      <TrustStrip />
      <ForWho />
      <Stats />
      <FeaturesTabs />
      <Comparison />
      <AgentsGallery />
      <Testimonials />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
