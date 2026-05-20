"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ArrowRight, Building2 } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { b2cPlans, enterprisePlan, type PricingPlan } from "@/lib/data/pricing";
import { cn, formatEuro } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { SavingsCalculator } from "./SavingsCalculator";
import { ConcreteExample } from "./ConcreteExample";

type Audience = "b2c" | "enterprise";
type Cycle = "monthly" | "yearly";

export function Pricing() {
  const [audience, setAudience] = useState<Audience>("b2c");
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <Section id="pricing" className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Tarifs"
          title={
            <>
              Choisis ton plan, change-le{" "}
              <span className="text-primary-600">à tout moment</span>
            </>
          }
          description="Plus ton plan est élevé, plus la négociation Sourcey est forte sur tes prix usine. Sans engagement, annulation 1 clic."
        />

        {/* Toggle audience + cycle */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <SegmentToggle<Audience>
            value={audience}
            onChange={setAudience}
            options={[
              { value: "b2c", label: "Solo / Particulier" },
              { value: "enterprise", label: "Entreprises", icon: Building2 },
            ]}
          />
          <AnimatePresence mode="wait">
            {audience === "b2c" && (
              <motion.div
                key="cycle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SegmentToggle<Cycle>
                  value={cycle}
                  onChange={setCycle}
                  options={[
                    { value: "monthly", label: "Mensuel" },
                    { value: "yearly", label: "Annuel", badge: "-20%" },
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {audience === "b2c" ? (
            <motion.div
              key="b2c"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mt-12"
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={stagger}
                className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                {b2cPlans.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ y: -4 }}
                    transition={{
                      opacity: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
                      y: { type: "spring", stiffness: 250, damping: 22 },
                    }}
                  >
                    <PlanCard plan={plan} cycle={cycle} />
                  </motion.div>
                ))}
              </motion.div>

              <SavingsCalculator />
              <ConcreteExample />
            </motion.div>
          ) : (
            <motion.div
              key="enterprise"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mt-12"
            >
              <EnterpriseCard />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Section>
  );
}

function PlanCard({ plan, cycle }: { plan: PricingPlan; cycle: Cycle }) {
  const isFree = plan.priceMonthly === 0;
  const isFeatured = plan.featured;

  const priceLabel = isFree
    ? "0 €"
    : formatEuro(cycle === "monthly" ? plan.priceMonthly : plan.priceYearly);
  const yearlySavings = isFree
    ? 0
    : Math.round(plan.priceMonthly * 12 - plan.priceYearly * 12);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all",
        isFeatured
          ? "border-primary-300 shadow-sm ring-1 ring-primary-200"
          : "border-neutral-200 hover:border-neutral-300"
      )}
    >
      {isFeatured && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Le plus choisi
        </span>
      )}

      {/* Title */}
      <header>
        <h3 className="text-base font-bold text-neutral-900">{plan.name}</h3>
        <p className="mt-1 text-[12.5px] text-neutral-500">{plan.tagline}</p>
      </header>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-extrabold tracking-tight text-neutral-900 tabular-nums">
            {priceLabel}
          </span>
          {!isFree && (
            <span className="text-[13px] font-medium text-neutral-500">
              /mois
            </span>
          )}
        </div>
        <p className="mt-1 h-4 text-[11px] text-neutral-400">
          {isFree
            ? "Toujours gratuit"
            : cycle === "yearly"
              ? `Soit ${yearlySavings} € économisés / an`
              : `ou ${plan.priceYearly} €/mois en annuel`}
        </p>
      </div>

      {/* Discount block — single accent (primary) */}
      <div
        className={cn(
          "mt-6 rounded-xl border px-4 py-3 text-center",
          plan.unitDiscount > 0
            ? "border-primary-100 bg-primary-50/60"
            : "border-neutral-200 bg-neutral-50/60"
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {plan.unitDiscount > 0 ? "Tarif négocié" : "Prix usine"}
        </p>
        <p
          className={cn(
            "mt-0.5 font-display text-3xl font-extrabold tabular-nums",
            plan.unitDiscount > 0 ? "text-primary-700" : "text-neutral-700"
          )}
        >
          {plan.unitDiscount > 0
            ? `−${Math.round(plan.unitDiscount * 100)} %`
            : "Standard"}
        </p>
        {plan.breakEvenLabel && (
          <p className="mt-1 text-[10.5px] text-neutral-500">
            {plan.breakEvenLabel}
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        asChild
        variant={isFeatured ? "primary" : "outline"}
        size="md"
        className="mt-5 w-full"
      >
        <Link href={plan.href}>
          {plan.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>

      {/* Features */}
      <ul className="mt-6 space-y-2.5 border-t border-neutral-100 pt-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0",
                isFeatured ? "text-primary-600" : "text-neutral-700"
              )}
              strokeWidth={2.5}
            />
            <span className="text-[13px] leading-snug text-neutral-700">{f}</span>
          </li>
        ))}
        {plan.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2.5 opacity-40">
            <X
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400"
              strokeWidth={2.5}
            />
            <span className="text-[13px] leading-snug text-neutral-500 line-through">
              {f}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function EnterpriseCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-8 md:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Entreprise</h3>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-4xl">
            Pour les marques et les gros volumes
          </h2>
          <p className="mt-3 text-[15px] text-neutral-600">
            Agent dédié, entrepôt EU intégré, SLA garanti. Tarif personnalisé
            selon ton volume.
          </p>

          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Tarif négocié
            </p>
            <p className="mt-0.5 font-display text-3xl font-extrabold text-primary-700">
              −40 % et plus
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">
              Sur devis · typique 499 – 2 999 €/mois
            </p>
          </div>

          <Button asChild variant="primary" size="lg" className="mt-6">
            <Link href="/entreprise">
              Parler à un commercial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-[11px] text-neutral-500">
            Réponse sous 24h ouvrées · Aucun engagement
          </p>
        </div>

        <ul className="space-y-2.5 rounded-xl border border-neutral-100 bg-neutral-50/40 p-6">
          {enterprisePlan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600"
                strokeWidth={2.5}
              />
              <span className="text-[13px] text-neutral-700">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function SegmentToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: typeof Building2; badge?: string }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {active && (
              <motion.span
                layoutId={`toggle-bg-${options[0].value}`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 rounded-full bg-neutral-100"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opt.icon && <opt.icon className="h-3.5 w-3.5" />}
              {opt.label}
              {opt.badge && (
                <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700">
                  {opt.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
