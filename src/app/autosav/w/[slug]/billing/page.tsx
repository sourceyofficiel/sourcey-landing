import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "AutoSAV · Facturation" };

const PLANS_LABEL: Record<string, { name: string; price: string }> = {
  trial: { name: "Trial", price: "Gratuit · 14 jours" },
  starter: { name: "Starter", price: "39 €/mois" },
  pro: { name: "Pro", price: "99 €/mois" },
  agency: { name: "Agency", price: "299 €/mois" },
};

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
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-5 md:px-8">
          <Link
            href={`/autosav/w/${ws.slug}`}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-5 py-8 md:px-8 md:py-10">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">
          Facturation
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          Gère ton abonnement et consulte ta consommation.
        </p>

        {/* === Plan actuel === */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
            <div className="text-[11.5px] font-bold uppercase tracking-wider text-indigo-700">
              Plan actuel
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="font-display text-[28px] font-extrabold tracking-tight text-neutral-900">
                {planInfo.name}
              </h2>
              <span className="text-[14px] text-neutral-500">{planInfo.price}</span>
            </div>
            {ws.plan === "trial" && (
              <p className="mt-2 text-[13px] text-indigo-800">
                Il te reste <strong>{trialDaysLeft} jours</strong> d&apos;essai
                gratuit. Choisis un plan ci-dessous avant la fin du trial pour
                ne pas perdre ton accès.
              </p>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                  Consommation ce mois-ci
                </div>
                <div className="mt-2 font-display text-[22px] font-extrabold leading-none">
                  {ws.ticketsUsedThisMonth} / {ws.quotaLimit} tickets
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-[24px] font-extrabold text-indigo-600">
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
                  quotaPct > 80 ? "bg-amber-500" : "bg-indigo-600"
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
        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="font-display text-[16px] font-extrabold tracking-tight">
            Changer de plan
          </h3>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            Stripe Checkout pas encore configuré sur cette installation test.
            Configure tes Stripe Products + Price IDs dans les variables
            d&apos;env pour activer l&apos;upgrade.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {(["starter", "pro", "agency"] as const).map((p) => {
              const info = PLANS_LABEL[p];
              return (
                <div
                  key={p}
                  className="rounded-xl border border-neutral-200 bg-white p-5"
                >
                  <div className="font-display text-[18px] font-extrabold tracking-tight">
                    {info.name}
                  </div>
                  <div className="mt-0.5 text-[13px] text-neutral-500">
                    {info.price}
                  </div>
                  <button
                    disabled
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 text-[12.5px] font-bold text-neutral-400"
                  >
                    Bientôt
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* === Customer Portal Stripe === */}
        <section className="mt-8 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-extrabold tracking-tight">
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
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-[13px] font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {ws.stripeCustomerId ? "Ouvrir le portail" : "Aucun abonnement"}
          </button>
        </section>

        {/* === Usage history teaser === */}
        <section className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center">
          <TrendingUp className="mx-auto h-6 w-6 text-neutral-300" />
          <p className="mt-3 text-[13px] text-neutral-500">
            Graph de consommation mensuelle disponible en phase 2.
          </p>
        </section>
      </div>
    </main>
  );
}
