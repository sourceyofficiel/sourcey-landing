import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2FinalCTA } from "@/components/v2/V2FinalCTA";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

import { FEATURES, getFeature, type Feature } from "@/lib/features-data";
import { getCurrentUser } from "@/lib/auth";

// Interactive demos (each feature gets its own)
import { SourcingDemo } from "@/components/features/SourcingDemo";
import { NegociationDemo } from "@/components/features/NegociationDemo";
import { QualityDemo } from "@/components/features/QualityDemo";
import { ExpeditionDemo } from "@/components/features/ExpeditionDemo";
import { TrackingDemo } from "@/components/features/TrackingDemo";
import { RelationDemo } from "@/components/features/RelationDemo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const feature = getFeature(params.slug);
  if (!feature) return { title: "Fonctionnalité — Sourcey" };
  return {
    title: `${feature.title} — Sourcey`,
    description: feature.pageSubtitle,
  };
}

export default async function FeaturePage({
  params,
}: {
  params: { slug: string };
}) {
  const feature = getFeature(params.slug);
  if (!feature) return notFound();

  const user = await getCurrentUser();

  // Autres features (pour le footer "Explorer le reste")
  const others = FEATURES.filter((f) => f.slug !== feature.slug);

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} transparentTop />

      <FeatureHero feature={feature} />
      <FeatureDemo slug={feature.slug} />
      <FeatureBullets feature={feature} />
      <FeatureSteps feature={feature} />
      <FeatureFAQ feature={feature} />
      <FeatureOthers others={others} />

      <V2FinalCTA />
      <V2Footer />
    </main>
  );
}

/* ============================================================
   FEATURE DEMO — switch sur le slug pour rendre la bonne demo
   ============================================================ */

function FeatureDemo({ slug }: { slug: string }) {
  switch (slug) {
    case "sourcing":
      return <SourcingDemo />;
    case "negociation":
      return <NegociationDemo />;
    case "controle-qualite":
      return <QualityDemo />;
    case "expedition":
      return <ExpeditionDemo />;
    case "suivi-colis":
      return <TrackingDemo />;
    case "relation-fournisseur":
      return <RelationDemo />;
    default:
      return null;
  }
}

/* ============================================================
   HERO
   ============================================================ */

function FeatureHero({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-8 md:pb-20 md:pt-24">
      <div className="mx-auto max-w-[860px] text-center">
        <V2SectionLabel>{feature.eyebrow}</V2SectionLabel>

        {/* Icon hero */}
        <div className="mx-auto mt-6 flex h-[80px] w-[80px] items-center justify-center rounded-[22px] bg-gradient-to-b from-primary-500 to-primary-700"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(15,40,100,0.4)",
              "0 14px 32px -8px rgba(37,99,235,0.55)",
              "0 4px 8px -2px rgba(15,23,42,0.18)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          <Icon className="h-10 w-10 text-white" strokeWidth={2} />
        </div>

        <h1 className="mt-8 font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
          {feature.pageTitle}
        </h1>

        <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-relaxed text-neutral-500 md:text-[17px]">
          {feature.pageSubtitle}
        </p>

        {/* Stat */}
        <div className="mt-10 inline-flex items-baseline gap-3 rounded-full border border-neutral-200 bg-white px-5 py-2.5 shadow-sm">
          <span className="font-display text-[22px] font-extrabold text-primary-600 md:text-[26px]">
            {feature.stat.value}
          </span>
          <span className="text-[13px] text-neutral-600 md:text-[14px]">
            {feature.stat.label}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.35)",
                "inset 0 -2px 0 rgba(15,40,100,0.35)",
                "0 12px 28px -8px rgba(37,99,235,0.55)",
                "0 0 0 1px rgba(29,78,216,0.45)",
              ].join(", "),
            }}
          >
            Démarrer un brief
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[14px] font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BULLETS — "Ce qu'on fait pour toi" en grid 2 cols
   ============================================================ */

function FeatureBullets({
  feature,
}: {
  feature: Feature;
}) {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Ce qu'on fait pour toi</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Concrètement, voilà ce qu'on couvre.
        </h2>
      </div>

      <ul className="mx-auto mt-12 grid max-w-[1000px] gap-4 md:grid-cols-2 md:gap-5">
        {feature.bullets.map((b, i) => (
          <li
            key={b.title}
            className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.12)]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold tracking-tight text-neutral-900 md:text-[16px]">
                  <span className="mr-2 text-[12px] font-mono font-semibold text-neutral-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {b.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                  {b.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============================================================
   STEPS — comment ça marche spécifique à la feature
   ============================================================ */

function FeatureSteps({
  feature,
}: {
  feature: Feature;
}) {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Comment ça marche</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Du brief à la livraison,{" "}
          <span className="italic text-primary-600">en 3 étapes.</span>
        </h2>
      </div>

      <ol className="mx-auto mt-12 grid max-w-[1000px] gap-5 md:grid-cols-3">
        {feature.steps.map((s) => (
          <li
            key={s.n}
            className="relative rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[12px] font-bold text-white">
              {s.n}
            </span>
            <h3 className="mt-4 text-[16px] font-bold tracking-tight text-neutral-900 md:text-[17px]">
              {s.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
              {s.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================================================
   FAQ — questions spécifiques à la feature
   ============================================================ */

function FeatureFAQ({
  feature,
}: {
  feature: Feature;
}) {
  return (
    <section className="relative mx-auto max-w-[860px] px-5 py-16 md:px-8 md:py-24">
      <div className="text-center">
        <V2SectionLabel>Petite FAQ</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Les questions qu'on nous pose souvent.
        </h2>
      </div>

      <ul className="mt-12 grid gap-3">
        {feature.faq.map((item) => (
          <li
            key={item.q}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <h3 className="text-[15px] font-bold tracking-tight text-neutral-900 md:text-[16px]">
              {item.q}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600 md:text-[14px]">
              {item.a}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============================================================
   OTHERS — "Explorer les autres fonctionnalités"
   ============================================================ */

function FeatureOthers({ others }: { others: Feature[] }) {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Le reste</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(24px,3vw,36px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Les autres fonctionnalités.
        </h2>
      </div>

      <ul className="mx-auto mt-10 grid max-w-[1100px] gap-3 md:grid-cols-3">
        {others.map((f) => {
          const I = f.icon;
          return (
            <li key={f.slug}>
              <Link
                href={`/features/${f.slug}`}
                className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.12)]"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100 transition-colors group-hover:bg-primary-100">
                  <I className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-neutral-900">
                    {f.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-neutral-500">
                    {f.tagline}
                  </span>
                </span>
                <ArrowRight className="mt-1.5 h-3.5 w-3.5 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
