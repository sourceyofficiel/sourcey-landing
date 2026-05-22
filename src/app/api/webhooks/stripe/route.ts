import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyWebhookEvent,
  STRIPE_ENABLED,
  mapPriceIdToPlan,
} from "@/lib/stripe";
import {
  CONFIRMATION_DELAY_DAYS,
  checkCommissionFraud,
  computeOnetimeCommission,
  computeRecurringCommission,
  isAffiliateActive,
  isPlanEligibleForAffiliate,
} from "@/lib/affiliate";
import { sendEmail } from "@/lib/email";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Configurer dans Stripe Dashboard → Developers → Webhooks
 * URL : https://sourcey.fr/api/webhooks/stripe
 * Events à écouter :
 *   - checkout.session.completed    → onboarding + commission ONETIME
 *   - invoice.paid                  → commission RECURRING (mois 2+)
 *   - customer.subscription.created/updated/deleted → maj plan
 *   - invoice.payment_failed        → alerte
 *
 * Les commissions d'affiliation sont créées ici en réponse à :
 *   - checkout.session.completed : si l'utilisateur a un referredBy, on crée
 *     une commission `onetime` au montant = priceMonthly du plan du filleul.
 *   - invoice.paid avec billing_reason='subscription_cycle' : on crée une
 *     commission `recurring` au taux du plan ACTUEL de l'affilié × prix mensuel
 *     du filleul.
 */
export async function POST(req: Request) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { error: "Stripe non configuré" },
      { status: 503 }
    );
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }
  const body = await req.text();
  const event = verifyWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "account.updated":
        // Stripe Connect : l'affilié a terminé son onboarding KYC/IBAN
        await handleConnectAccountUpdated(event.data.object as Stripe.Account);
        break;
      default:
        console.info("[stripe.webhook] unhandled", event.type);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe.webhook]", err);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }
}

/* ============================================================
   CHECKOUT COMPLETED — premier paiement, commission ONETIME
   ============================================================ */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !customerId) return;

  // Récupère la subscription pour avoir le plan + status + renews_at directement.
  // Évite la race condition où customer.subscription.created arrive AVANT
  // ou APRÈS checkout.session.completed dans un ordre imprévisible (Stripe
  // ne garantit pas l'ordre des webhooks).
  let plan: string | undefined;
  let subscriptionStatus: string | undefined;
  let planRenewsAt: Date | null | undefined;

  if (subscriptionId && STRIPE_ENABLED) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price?.id;
      if (priceId) plan = mapPriceIdToPlan(priceId);
      subscriptionStatus = sub.status;
      const periodEnd = sub.items.data[0]?.current_period_end;
      planRenewsAt = periodEnd ? new Date(periodEnd * 1000) : null;
    } catch (e) {
      console.error("[stripe.webhook] failed to retrieve sub", e);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId ?? null,
      ...(plan ? { plan } : {}),
      ...(subscriptionStatus ? { subscriptionStatus } : {}),
      ...(planRenewsAt !== undefined ? { planRenewsAt } : {}),
    },
  });

  // === Commission ONETIME ===
  // Si le user a un referredBy en base et que le plan est éligible, on crée
  // une commission "onetime" au prix mensuel du filleul.
  await createOnetimeCommissionIfApplicable(userId);

  console.info("[stripe.webhook] checkout completed", {
    userId,
    customerId,
    plan,
  });
}

/**
 * Crée la commission ONETIME pour le premier mois d'un filleul.
 *
 * Appelée depuis checkout.session.completed. Idempotent :
 * si une commission onetime existe déjà pour ce filleul, no-op.
 */
async function createOnetimeCommissionIfApplicable(referredUserId: string) {
  const referredUser = await prisma.user.findUnique({
    where: { id: referredUserId },
    select: {
      id: true,
      plan: true,
      referredBy: true,
    },
  });
  if (!referredUser?.referredBy) return;
  if (!isPlanEligibleForAffiliate(referredUser.plan)) return;

  // Idempotence : si une commission onetime existe déjà pour ce filleul, no-op.
  const existing = await prisma.affiliateCommission.findFirst({
    where: { referredUserId, type: "onetime" },
    select: { id: true },
  });
  if (existing) return;

  // Récupère l'affilié via son code unique.
  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: referredUser.referredBy },
    select: { id: true, plan: true, email: true, fullName: true },
  });
  if (!affiliate) return;

  // Anti-fraude : self-referral, same-IP signup, affilié encore actif ?
  const fraud = await checkCommissionFraud({
    affiliateId: affiliate.id,
    referredUserId,
    affiliateCode: referredUser.referredBy,
  });

  const amount = computeOnetimeCommission(referredUser.plan);
  const confirmedAt = new Date(
    Date.now() + CONFIRMATION_DELAY_DAYS * 24 * 3600 * 1000
  );

  // Si fraud détecté → commission créée mais en status 'cancelled' + flag.
  // On garde la trace pour audit plutôt que de la supprimer.
  const status = fraud.ok ? "pending" : "cancelled";
  const flaggedReason = fraud.ok ? null : fraud.reason;

  await prisma.affiliateCommission.create({
    data: {
      affiliateId: affiliate.id,
      referredUserId,
      type: "onetime",
      amount,
      status,
      periodMonth: 1,
      affiliatePlanAtTime: affiliate.plan,
      referredPlanAtTime: referredUser.plan,
      confirmedAt: status === "pending" ? confirmedAt : null,
      flaggedReason,
    },
  });

  // Marquer le clic correspondant comme converti (pour les stats).
  await prisma.affiliateClick.updateMany({
    where: {
      affiliateCode: referredUser.referredBy,
      converted: false,
    },
    data: { converted: true, convertedUserId: referredUserId },
  });

  // Email à l'affilié — "tu touches X€ à la fin du 1er mois de ton filleul"
  if (fraud.ok && affiliate.email) {
    await sendEmail({
      to: affiliate.email,
      subject: "🎉 Un nouveau filleul vient de rejoindre Sourcey",
      html: `
        <p>Salut ${affiliate.fullName ?? ""},</p>
        <p>Bonne nouvelle — quelqu'un a rejoint Sourcey via ton lien d'affiliation.</p>
        <p>Tu toucheras <strong>${amount} €</strong> à la fin de son premier mois,
        puis une commission récurrente chaque mois suivant tant qu'il reste abonné.</p>
        <p>Voir ton dashboard : <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Programme affiliation</a></p>
      `,
    }).catch((e) => console.error("[stripe.webhook] mail onetime", e));
  }

  console.info("[affiliate] onetime commission created", {
    affiliateId: affiliate.id,
    referredUserId,
    amount,
    status,
  });
}

/* ============================================================
   INVOICE PAID — renouvellements, commission RECURRING
   ============================================================ */

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // billing_reason :
  //   - "subscription_create" → 1er paiement après checkout → géré par checkout.session.completed
  //   - "subscription_cycle"  → renouvellement mensuel/annuel → commission RECURRING
  //   - "subscription_update" → upgrade/downgrade au milieu du cycle → on ignore (le prochain cycle remet d'aplomb)
  const reason = invoice.billing_reason;
  if (reason !== "subscription_cycle") return;

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;

  const referredUser = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: {
      id: true,
      plan: true,
      referredBy: true,
      subscriptionStatus: true,
    },
  });
  if (!referredUser?.referredBy) return;
  if (!isPlanEligibleForAffiliate(referredUser.plan)) return;

  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: referredUser.referredBy },
    select: { id: true, plan: true, email: true, fullName: true },
  });
  if (!affiliate) return;

  // L'affilié doit toujours être actif POUR CE PAIEMENT — c'est ce qui
  // implémente "résiliation = arrêt des commissions récurrentes".
  if (!(await isAffiliateActive(affiliate.id))) return;

  // Compte le nombre de commissions précédentes pour numéroter le mois.
  // periodMonth = count + 1 (1 était la onetime, donc minimum 2 ici).
  const previousCount = await prisma.affiliateCommission.count({
    where: { referredUserId: referredUser.id },
  });
  const periodMonth = previousCount + 1;

  // Idempotence : si on a déjà une commission pour cette invoice Stripe → skip.
  // Empêche les doubles webhooks Stripe (retry) de créer 2 commissions.
  const existing = await prisma.affiliateCommission.findFirst({
    where: {
      referredUserId: referredUser.id,
      stripeInvoiceId: invoice.id,
    },
    select: { id: true },
  });
  if (existing) return;

  const { amount, rate } = computeRecurringCommission(
    affiliate.plan,
    referredUser.plan
  );
  if (amount <= 0) return;

  const fraud = await checkCommissionFraud({
    affiliateId: affiliate.id,
    referredUserId: referredUser.id,
    affiliateCode: referredUser.referredBy,
  });
  const status = fraud.ok ? "pending" : "cancelled";
  const confirmedAt = new Date(
    Date.now() + CONFIRMATION_DELAY_DAYS * 24 * 3600 * 1000
  );

  await prisma.affiliateCommission.create({
    data: {
      affiliateId: affiliate.id,
      referredUserId: referredUser.id,
      type: "recurring",
      amount,
      status,
      periodMonth,
      affiliatePlanAtTime: affiliate.plan,
      referredPlanAtTime: referredUser.plan,
      commissionRate: rate,
      stripeInvoiceId: invoice.id,
      confirmedAt: status === "pending" ? confirmedAt : null,
      flaggedReason: fraud.ok ? null : fraud.reason,
    },
  });

  console.info("[affiliate] recurring commission created", {
    affiliateId: affiliate.id,
    referredUserId: referredUser.id,
    amount,
    rate,
    periodMonth,
    status,
  });
}

/* ============================================================
   SUBSCRIPTION CHANGES — maj plan + suspension affilié
   ============================================================ */

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id;
  if (!customerId || !priceId) return;

  const plan = mapPriceIdToPlan(priceId);
  const periodEnd = sub.items.data[0]?.current_period_end;
  const planRenewsAt = periodEnd ? new Date(periodEnd * 1000) : null;

  // Match d'abord par stripeCustomerId (le cas nominal).
  const updated = await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan,
      subscriptionStatus: sub.status,
      stripeSubscriptionId: sub.id,
      planRenewsAt,
    },
  });

  // Fallback : si on n'a trouvé personne via stripeCustomerId (race condition
  // où subscription.created arrive avant checkout.session.completed), on
  // essaie via metadata.userId qu'on a posé dans createCheckoutSession.
  if (updated.count === 0) {
    const userId = sub.metadata?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          plan,
          subscriptionStatus: sub.status,
          planRenewsAt,
        },
      });
      console.info("[stripe.webhook] subscription change (via metadata)", {
        userId,
        plan,
      });
      return;
    }
  }

  // Si la sub passe en past_due / canceled / unpaid → l'affilié ne reçoit plus
  // les récurrents (géré par isAffiliateActive au prochain invoice.paid).
  console.info("[stripe.webhook] subscription change", {
    customerId,
    plan,
    status: sub.status,
    matched: updated.count,
  });
}

async function handleSubscriptionCanceled(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  if (!customerId) return;

  // Récupère l'user pour l'email d'alerte avant maj.
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: {
      id: true,
      email: true,
      fullName: true,
      affiliateActive: true,
      affiliateCode: true,
    },
  });

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      planRenewsAt: null,
    },
  });

  // Email d'alerte si l'user était affilié actif → son lien est désormais inactif.
  if (user?.affiliateActive && user.affiliateCode && user.email) {
    await sendEmail({
      to: user.email,
      subject: "⚠️ Ton programme d'affiliation Sourcey est suspendu",
      html: `
        <p>Salut ${user.fullName ?? ""},</p>
        <p>Ton abonnement Sourcey a expiré ou a été annulé. En conséquence :</p>
        <ul>
          <li>Ton lien d'affiliation est désactivé jusqu'à nouvel ordre.</li>
          <li>Les commissions récurrentes sur tes filleuls sont stoppées.</li>
          <li>Les commissions déjà confirmées seront versées normalement.</li>
        </ul>
        <p>Réabonne-toi pour réactiver ton programme :
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/pricing">Voir les plans</a></p>
      `,
    }).catch((e) => console.error("[stripe.webhook] mail suspended", e));
  }

  console.info("[stripe.webhook] subscription canceled", { customerId });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  console.warn("[stripe.webhook] payment failed", {
    customerId,
    amount: invoice.amount_due,
  });
}

/* ============================================================
   STRIPE CONNECT — l'affilié a fini son onboarding KYC/IBAN
   ============================================================ */

async function handleConnectAccountUpdated(account: Stripe.Account) {
  // Stripe envoie account.updated quand le compte Connect change d'état.
  // On regarde charges_enabled + payouts_enabled : si true, l'IBAN est OK.
  const onboarded = Boolean(account.charges_enabled && account.payouts_enabled);
  await prisma.user.updateMany({
    where: { stripeConnectAccountId: account.id },
    data: { stripeConnectOnboarded: onboarded },
  });
  console.info("[stripe.webhook] connect updated", {
    accountId: account.id,
    onboarded,
  });
}

