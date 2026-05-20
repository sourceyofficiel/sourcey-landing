import Link from "next/link";
import { Check, Crown, ExternalLink, Sparkles, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { BillingActions } from "./BillingActions";

export const metadata = { title: "Facturation · Sourcey" };
export const dynamic = "force-dynamic";

const PLAN_DETAILS = {
  free: {
    label: "Gratuit",
    price: "0 €",
    color: "neutral",
    description: "Découverte de Sourcey",
    features: [
      "1 brief de sourcing par mois",
      "Réponse sous 5 jours",
      "Négociation basique",
    ],
  },
  starter: {
    label: "Starter",
    price: "29 €/mois",
    color: "primary",
    description: "Pour démarrer ton e-commerce",
    features: [
      "3 briefs par mois",
      "Réponse sous 48h",
      "Négociation standard",
      "Support WhatsApp prioritaire",
    ],
  },
  pro: {
    label: "Pro",
    price: "79 €/mois",
    color: "primary",
    description: "Pour scaler ton catalogue",
    features: [
      "Briefs illimités",
      "Réponse sous 24h",
      "Négociation agressive (volume)",
      "Account manager dédié",
      "Suivi fournisseurs à vie",
    ],
  },
} as const;

export default async function BillingPage() {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      planRenewsAt: true,
      stripeCustomerId: true,
    },
  });
  if (!user) return null;

  const currentPlan = PLAN_DETAILS[user.plan as keyof typeof PLAN_DETAILS] ??
    PLAN_DETAILS.free;
  const isActive =
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "trialing";

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 md:py-10">
      <div>
        <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
          Facturation
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Gère ton abonnement et tes factures
        </p>
      </div>

      {/* Current plan card */}
      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700">
                <Crown className="h-3 w-3" />
                Plan actuel
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11.5px] font-bold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Actif
                </span>
              )}
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              {currentPlan.label}
            </h2>
            <p className="mt-1 text-[15px] text-neutral-600">
              {currentPlan.description}
            </p>
            <p className="mt-3 font-mono text-[22px] font-bold text-neutral-900">
              {currentPlan.price}
            </p>
            {user.planRenewsAt && isActive && (
              <p className="mt-1 text-[12.5px] text-neutral-500">
                Prochaine facturation :{" "}
                {new Date(user.planRenewsAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Actions */}
          <BillingActions
            hasSubscription={Boolean(user.stripeCustomerId)}
            currentPlan={user.plan}
          />
        </div>

        {/* Features */}
        <ul className="mt-6 grid gap-2 border-t border-neutral-100 pt-6 sm:grid-cols-2">
          {currentPlan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[14px] text-neutral-700">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Upgrade options */}
      {user.plan !== "pro" && (
        <section className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Passer au plan supérieur
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {user.plan === "free" && (
              <UpgradeCard
                plan="starter"
                priceKey="starter_monthly"
                price="29 €/mois"
                features={PLAN_DETAILS.starter.features}
                icon={<Zap className="h-5 w-5 text-amber-600" />}
              />
            )}
            <UpgradeCard
              plan="pro"
              priceKey="pro_monthly"
              price="79 €/mois"
              features={PLAN_DETAILS.pro.features}
              icon={<Sparkles className="h-5 w-5 text-primary-600" />}
              highlight
            />
          </div>
        </section>
      )}

      {/* Help */}
      <p className="mt-12 text-center text-[12.5px] text-neutral-500">
        Une question sur ta facturation ?{" "}
        <Link
          href="mailto:hello@sourcey.fr"
          className="font-semibold text-primary-700 hover:underline"
        >
          hello@sourcey.fr
        </Link>
      </p>
    </div>
  );
}

function UpgradeCard({
  plan,
  priceKey,
  price,
  features,
  icon,
  highlight,
}: {
  plan: "starter" | "pro";
  priceKey: string;
  price: string;
  features: readonly string[];
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  const label = plan === "starter" ? "Starter" : "Pro";
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        highlight
          ? "border-2 border-primary-500 shadow-[0_20px_50px_-25px_rgba(37,99,235,0.4)]"
          : "border-neutral-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-[16px] font-bold text-neutral-900">{label}</h4>
        {highlight && (
          <span className="ml-auto rounded-full bg-primary-600 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
            Recommandé
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-xl font-bold text-neutral-900">{price}</p>
      <ul className="mt-4 grid gap-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-neutral-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" />
            {f}
          </li>
        ))}
      </ul>
      <UpgradeButton priceKey={priceKey} label={`Passer ${label}`} />
    </div>
  );
}

function UpgradeButton({ priceKey, label }: { priceKey: string; label: string }) {
  return (
    <form action="/api/billing/checkout" method="POST" className="mt-5">
      <input type="hidden" name="priceKey" value={priceKey} />
      <CheckoutFormButton priceKey={priceKey} label={label} />
    </form>
  );
}

import { CheckoutFormButton } from "./CheckoutFormButton";
