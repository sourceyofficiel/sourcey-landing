import { redirect } from "next/navigation";
import { CreditCard, TrendingUp, AlertCircle, Check } from "lucide-react";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Facturation · AutoSAV" };

const PLANS_LABEL: Record<string, { name: string; price: string; color: string }> = {
  trial: { name: "Trial", price: "Gratuit · 14 jours", color: "amber" },
  starter: { name: "Starter", price: "39 €/mois", color: "emerald" },
  pro: { name: "Pro", price: "99 €/mois", color: "emerald" },
  agency: { name: "Agency", price: "299 €/mois", color: "emerald" },
};

const ALL_PLANS = [
  {
    slug: "starter",
    name: "Starter",
    price: "39",
    quota: "200",
    features: ["1 boutique", "1 boîte mail", "Support email"],
  },
  {
    slug: "pro",
    name: "Pro",
    price: "99",
    quota: "1 000",
    features: ["3 boutiques", "Boîtes illimitées", "Mode auto-pilote", "5 langues"],
    popular: true,
  },
  {
    slug: "agency",
    name: "Agency",
    price: "299",
    quota: "Illimité",
    features: ["Tout Pro inclus", "10 sièges", "API + webhooks", "SLA 99,9%"],
  },
];

export default async function AutosavBillingPage({
  params,
}: {
  params: { slug: string };
}) {
  let ctx;
  try {
    ctx = await getWorkspaceBySlug(params.slug);
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      if (e.code === "UNAUTHENTICATED") redirect("/login?next=/autosav");
      redirect("/autosav");
    }
    throw e;
  }
  const ws = ctx.workspace!;
  const planInfo = PLANS_LABEL[ws.plan] ?? PLANS_LABEL.trial;
  const trialDaysLeft = ws.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((ws.trialEndsAt.getTime() - Date.now()) / (24 * 3600 * 1000))
      )
    : 0;
  const quotaPct = Math.min(
    100,
    Math.round((ws.ticketsUsedThisMonth / Math.max(1, ws.quotaLimit)) * 100)
  );

  return (
    <div className="h-full overflow-y-auto bg-neutral-50/40">
      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
          Facturation & abonnement
        </h1>
        <p className="mt-1 text-[13.5px] text-neutral-500">
          Gère ton plan, consulte ta consommation et accède aux factures Stripe.
        </p>

        {/* === Plan actuel === */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 bg-gradient-to-br from-emerald-50/60 to-amber-50/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-700">
                  Plan actuel
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <h2 className="font-display text-[28px] font-extrabold tracking-tight text-neutral-900">
                    {planInfo.name}
                  </h2>
                  <span className="text-[14px] text-neutral-500">{planInfo.price}</span>
                </div>
                {ws.plan === "trial" && trialDaysLeft > 0 && (
                  <p className="mt-3 text-[13px] text-emerald-800">
                    Il te reste <strong>{trialDaysLeft} jours</strong> d&apos;essai
                    gratuit. Choisis un plan avant la fin du trial pour ne pas
                    perdre ton accès.
                  </p>
                )}
              </div>
              <div className="rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Actif
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                  Consommation ce mois-ci
                </div>
                <div className="mt-2 font-display text-[22px] font-extrabold leading-none text-neutral-900">
                  {ws.ticketsUsedThisMonth} / {ws.quotaLimit} tickets
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-[24px] font-extrabold text-emerald-700">
                  {quotaPct}%
                </div>
                <div className="text-[11.5px] text-neutral-500">
                  du quota mensuel
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full transition-all ${
                  quotaPct > 80 ? "bg-amber-500" : "bg-emerald-700"
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            {quotaPct > 80 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  Tu approches de ton quota. Au-delà, chaque ticket
                  supplémentaire est facturé <strong>0,12 €</strong>. Passe sur
                  un plan supérieur pour augmenter ta limite.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* === Changer de plan === */}
        <section className="mt-8">
          <h3 className="font-display text-[16px] font-extrabold tracking-tight text-neutral-900">
            Changer de plan
          </h3>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            Sans engagement. Résiliable en 1 clic depuis le portail Stripe.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ALL_PLANS.map((p) => (
              <div
                key={p.slug}
                className={`relative rounded-2xl border bg-white p-5 ${
                  p.popular
                    ? "border-emerald-700 shadow-[0_20px_40px_-20px_rgba(6,95,70,0.25)]"
                    : "border-neutral-200"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-950">
                    Populaire
                  </div>
                )}
                <div className="font-display text-[20px] font-extrabold tracking-tight text-emerald-900">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-[32px] font-extrabold leading-none text-emerald-800">
                    {p.price}€
                  </span>
                  <span className="text-[12px] text-neutral-500">/mois</span>
                </div>
                <div className="mt-1 text-[11.5px] text-neutral-500">
                  {p.quota} tickets/mois
                </div>
                <button
                  disabled
                  className={`mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg text-[12.5px] font-bold ${
                    p.popular
                      ? "bg-emerald-800 text-white opacity-60"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-400"
                  }`}
                >
                  Bientôt
                </button>
                <ul className="mt-5 space-y-1.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-[12px] text-neutral-700"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* === Customer Portal === */}
        <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-[14.5px] font-extrabold tracking-tight text-neutral-900">
                Gérer ta facturation Stripe
              </h3>
              <p className="mt-0.5 text-[12.5px] text-neutral-500">
                Factures, CB, annulation, changement de plan — tout est dans le
                portail Stripe sécurisé.
              </p>
            </div>
          </div>
          <button
            disabled={!ws.stripeCustomerId}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-[12.5px] font-bold text-white hover:bg-emerald-900 disabled:opacity-50"
          >
            {ws.stripeCustomerId ? "Ouvrir le portail" : "Aucun abonnement"}
          </button>
        </section>

        {/* === Usage history teaser === */}
        <section className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <TrendingUp className="mx-auto h-6 w-6 text-neutral-300" />
          <p className="mt-3 text-[13px] text-neutral-500">
            Graph de consommation mensuelle disponible en phase 2.
          </p>
        </section>
      </div>
    </div>
  );
}
