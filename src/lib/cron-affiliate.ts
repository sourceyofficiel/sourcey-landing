/**
 * Affiliate — jobs mensuels (cron Vercel ou autre).
 *
 * Deux jobs distincts :
 *
 *   1. confirmPendingCommissions()
 *      Passe les commissions `pending` à `confirmed` quand confirmedAt < now.
 *      Délai = 15 jours (CONFIRMATION_DELAY_DAYS). À exécuter quotidiennement.
 *
 *   2. runMonthlyPayouts()
 *      Le 1er du mois : pour chaque affilié, groupe ses commissions `confirmed`
 *      non encore associées à un payout. Si total ≥ 20 €, crée un
 *      AffiliatePayout + déclenche un Stripe Transfer vers son compte Connect.
 *
 * Configuration Vercel Cron (vercel.json) :
 *   - /api/affiliate/payout-confirm (daily) → confirmPendingCommissions
 *   - /api/affiliate/payout (monthly, 1st)  → runMonthlyPayouts
 */

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { PAYOUT_MIN_AMOUNT } from "@/lib/affiliate";
import { STRIPE_ENABLED } from "@/lib/stripe";
import Stripe from "stripe";

/* ============================================================
   PAIEMENT IMMÉDIAT d'une commission unique
   ============================================================ */

/**
 * Tente de virer immédiatement une commission via Stripe Transfer.
 *
 * Appelée depuis les webhooks Stripe juste après création de la commission
 * pour que l'affilié reçoive son argent dès le paiement du filleul.
 *
 * Conditions :
 *   - Commission en status='confirmed' (sinon no-op)
 *   - Affilié avec stripeConnectOnboarded=true (sinon on attend le callback
 *     Stripe Connect qui re-triggera ce paiement)
 *
 * Si le transfer échoue (réseau Stripe, etc.), la commission reste en
 * `confirmed` et sera reprise par le cron mensuel ou par un retry manuel.
 *
 * IMPORTANT : cette fonction est appelée depuis un webhook, donc on
 * `try/catch` partout — ne JAMAIS faire planter le webhook à cause d'un
 * échec de transfer (Stripe nous renverrait l'event en boucle).
 */
export async function payoutSingleCommissionImmediate(
  commissionId: string
): Promise<{
  status: "paid" | "skipped_no_connect" | "failed" | "cancelled" | "not_confirmed";
  transferId?: string;
  error?: string;
}> {
  const commission = await prisma.affiliateCommission.findUnique({
    where: { id: commissionId },
    include: {
      affiliate: {
        select: {
          id: true,
          email: true,
          fullName: true,
          stripeConnectAccountId: true,
          stripeConnectOnboarded: true,
        },
      },
    },
  });

  if (!commission) return { status: "cancelled" };
  if (commission.status === "cancelled") return { status: "cancelled" };
  if (commission.status === "paid") return { status: "paid" }; // déjà payée
  if (commission.status !== "confirmed") return { status: "not_confirmed" };

  const affiliate = commission.affiliate;
  if (
    !affiliate.stripeConnectAccountId ||
    !affiliate.stripeConnectOnboarded
  ) {
    // L'affilié n'a pas (encore) son IBAN. On laisse la commission en
    // confirmed — elle sera traitée dès qu'il complète son onboarding.
    return { status: "skipped_no_connect" };
  }

  // Mock mode : on simule un transfer réussi.
  if (!STRIPE_ENABLED) {
    const mockId = `mock_tr_${commission.id}`;
    await prisma.affiliateCommission.update({
      where: { id: commission.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePayoutId: mockId,
      },
    });
    return { status: "paid", transferId: mockId };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const transfer = await stripe.transfers.create({
      amount: Math.round(commission.amount * 100),
      currency: "eur",
      destination: affiliate.stripeConnectAccountId,
      description: `Sourcey affiliation — commission ${commission.type}`,
      metadata: {
        commissionId: commission.id,
        affiliateId: affiliate.id,
        type: commission.type,
      },
    });

    await prisma.affiliateCommission.update({
      where: { id: commission.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePayoutId: transfer.id,
      },
    });

    // Email instantané à l'affilié
    if (affiliate.email) {
      await sendEmail({
        to: affiliate.email,
        subject: `💸 ${commission.amount} € viennent d'arriver sur ton compte`,
        html: `
          <p>Salut ${affiliate.fullName ?? ""},</p>
          <p>Un filleul vient de payer son abonnement et tu as été crédité de
          <strong>${commission.amount} €</strong> immédiatement sur ton compte
          de paiement (réception sous 1-3 jours ouvrés selon ta banque).</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Voir le détail</a></p>
        `,
      }).catch((e) => console.error("[immediate-payout] mail", e));
    }

    return { status: "paid", transferId: transfer.id };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Erreur Stripe inconnue";
    console.error("[immediate-payout] transfer failed", { commissionId, error });
    // On laisse la commission en 'confirmed' — le cron mensuel la reprendra.
    return { status: "failed", error };
  }
}

/**
 * Traite toutes les commissions confirmées non payées d'un affilié.
 * Appelée depuis le callback Stripe Connect après que l'affilié ait fini
 * son onboarding KYC/IBAN — pour rattraper les commissions qui s'étaient
 * accumulées en `confirmed`.
 */
export async function payoutPendingCommissionsForAffiliate(
  affiliateId: string
) {
  const pending = await prisma.affiliateCommission.findMany({
    where: { affiliateId, status: "confirmed" },
    select: { id: true },
  });
  for (const c of pending) {
    await payoutSingleCommissionImmediate(c.id);
  }
  return { processed: pending.length };
}

/* ============================================================
   1. CONFIRMATION quotidienne
   ============================================================ */

/**
 * Bascule en `confirmed` toutes les commissions dont confirmedAt est dépassé.
 * Envoie un email à l'affilié pour chaque commission confirmée.
 */
export async function confirmPendingCommissions() {
  const now = new Date();
  const toConfirm = await prisma.affiliateCommission.findMany({
    where: {
      status: "pending",
      confirmedAt: { lte: now },
    },
    include: {
      affiliate: { select: { email: true, fullName: true } },
    },
  });

  for (const c of toConfirm) {
    await prisma.affiliateCommission.update({
      where: { id: c.id },
      data: { status: "confirmed" },
    });
    if (c.affiliate.email) {
      await sendEmail({
        to: c.affiliate.email,
        subject: `✅ Commission de ${c.amount} € confirmée`,
        html: `
          <p>Salut ${c.affiliate.fullName ?? ""},</p>
          <p>Ta commission de <strong>${c.amount} €</strong> vient d'être
          confirmée. Elle sera virée sur ton compte le 1er du mois prochain
          (si ton total atteint ${PAYOUT_MIN_AMOUNT} €).</p>
          <p>Voir le détail : <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Dashboard affiliation</a></p>
        `,
      }).catch((e) => console.error("[cron] mail confirmed", e));
    }
  }

  return { confirmed: toConfirm.length };
}

/* ============================================================
   2. PAYOUTS mensuels
   ============================================================ */

interface RunPayoutsOptions {
  /** Pour audit : qui a déclenché ce run (cron / admin) */
  triggeredBy?: "cron" | "admin";
  /** Mode dry-run pour debug : calcule sans virer */
  dryRun?: boolean;
}

interface PayoutResult {
  processedAffiliates: number;
  successfulTransfers: number;
  failedTransfers: number;
  skippedBelowMin: number;
  totalAmount: number;
  details: Array<{
    affiliateId: string;
    amount: number;
    status: "paid" | "failed" | "skipped_no_connect" | "skipped_below_min";
    error?: string;
  }>;
}

/**
 * Job mensuel : crée un payout par affilié pour la somme de ses commissions
 * `confirmed` non encore versées.
 *
 * Workflow par affilié :
 *   1. Sum des commissions confirmed non liées à un payout.
 *   2. Si total < 20 € → skip (les commissions restent en `confirmed` et
 *      seront cumulées au mois suivant).
 *   3. Si l'affilié n'a pas terminé son onboarding Stripe Connect → skip avec
 *      log + email d'incentive à terminer l'onboarding.
 *   4. Crée un AffiliatePayout + Stripe Transfer.
 *   5. Update les commissions à status='paid' + lien vers payoutId.
 *   6. Email récap mensuel à l'affilié.
 */
export async function runMonthlyPayouts(
  options: RunPayoutsOptions = {}
): Promise<PayoutResult> {
  const dryRun = options.dryRun ?? false;
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // dernier jour mois précédent

  // Groupe les commissions confirmed par affilié.
  const confirmed = await prisma.affiliateCommission.findMany({
    where: { status: "confirmed", payoutId: null },
  });

  const byAffiliate = new Map<string, typeof confirmed>();
  for (const c of confirmed) {
    const arr = byAffiliate.get(c.affiliateId) ?? [];
    arr.push(c);
    byAffiliate.set(c.affiliateId, arr);
  }

  const result: PayoutResult = {
    processedAffiliates: 0,
    successfulTransfers: 0,
    failedTransfers: 0,
    skippedBelowMin: 0,
    totalAmount: 0,
    details: [],
  };

  const stripe = STRIPE_ENABLED
    ? new Stripe(process.env.STRIPE_SECRET_KEY!)
    : null;

  for (const [affiliateId, commissions] of byAffiliate.entries()) {
    result.processedAffiliates++;
    const total = commissions.reduce((acc, c) => acc + c.amount, 0);
    const rounded = Math.round(total * 100) / 100;

    if (rounded < PAYOUT_MIN_AMOUNT) {
      result.skippedBelowMin++;
      result.details.push({
        affiliateId,
        amount: rounded,
        status: "skipped_below_min",
      });
      continue;
    }

    const affiliate = await prisma.user.findUnique({
      where: { id: affiliateId },
      select: {
        id: true,
        email: true,
        fullName: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    if (!affiliate?.stripeConnectAccountId || !affiliate.stripeConnectOnboarded) {
      result.details.push({
        affiliateId,
        amount: rounded,
        status: "skipped_no_connect",
      });
      if (affiliate?.email && !dryRun) {
        await sendEmail({
          to: affiliate.email,
          subject: `💰 ${rounded} € t'attendent — finalise ton onboarding`,
          html: `
            <p>Tu as accumulé <strong>${rounded} €</strong> de commissions
            sur Sourcey. Pour les recevoir, finalise l'onboarding de ton
            compte de paiement (IBAN).</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Compléter mes infos bancaires</a></p>
          `,
        }).catch((e) => console.error("[cron] mail incentive onboard", e));
      }
      continue;
    }

    if (dryRun) {
      result.details.push({
        affiliateId,
        amount: rounded,
        status: "paid",
      });
      continue;
    }

    // === Crée le AffiliatePayout en `processing` ===
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId,
        amount: rounded,
        status: "processing",
        periodStart,
        periodEnd,
      },
    });

    // Lie les commissions à ce payout (avant le transfer Stripe pour atomicité).
    await prisma.affiliateCommission.updateMany({
      where: { id: { in: commissions.map((c) => c.id) } },
      data: { payoutId: payout.id },
    });

    // === Stripe Transfer ===
    let success = false;
    let stripeTransferId: string | null = null;
    let failureReason: string | null = null;

    if (stripe) {
      try {
        const transfer = await stripe.transfers.create({
          amount: Math.round(rounded * 100), // en cents
          currency: "eur",
          destination: affiliate.stripeConnectAccountId,
          description: `Sourcey affiliation — ${commissions.length} commissions`,
          metadata: {
            payoutId: payout.id,
            affiliateId,
            commissionCount: String(commissions.length),
          },
        });
        success = true;
        stripeTransferId = transfer.id;
      } catch (e) {
        failureReason =
          e instanceof Error ? e.message : "Erreur Stripe inconnue";
      }
    } else {
      // Mock mode : on simule un transfer réussi.
      success = true;
      stripeTransferId = `mock_tr_${payout.id}`;
    }

    if (success) {
      await prisma.affiliatePayout.update({
        where: { id: payout.id },
        data: {
          status: "paid",
          stripeTransferId,
          paidAt: new Date(),
        },
      });
      await prisma.affiliateCommission.updateMany({
        where: { payoutId: payout.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          stripePayoutId: stripeTransferId,
        },
      });
      result.successfulTransfers++;
      result.totalAmount += rounded;
      result.details.push({
        affiliateId,
        amount: rounded,
        status: "paid",
      });

      // Email récap mensuel à l'affilié.
      if (affiliate.email) {
        await sendEmail({
          to: affiliate.email,
          subject: `💸 ${rounded} € viennent d'être virés sur ton compte`,
          html: `
            <p>Salut ${affiliate.fullName ?? ""},</p>
            <p>Ton virement mensuel Sourcey de <strong>${rounded} €</strong>
            vient d'être envoyé sur ton compte (réception sous 1-3 jours
            ouvrés selon ta banque).</p>
            <p><strong>Détail :</strong> ${commissions.length} commissions
            sur la période du ${periodStart.toLocaleDateString("fr-FR")} au
            ${periodEnd.toLocaleDateString("fr-FR")}.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Voir le détail</a></p>
          `,
        }).catch((e) => console.error("[cron] mail payout", e));
      }
    } else {
      // Rollback : on remet les commissions à `confirmed` et le payout à `failed`.
      await prisma.affiliateCommission.updateMany({
        where: { payoutId: payout.id },
        data: { payoutId: null },
      });
      await prisma.affiliatePayout.update({
        where: { id: payout.id },
        data: { status: "failed", failureReason },
      });
      result.failedTransfers++;
      result.details.push({
        affiliateId,
        amount: rounded,
        status: "failed",
        error: failureReason ?? undefined,
      });
    }
  }

  console.info("[cron] runMonthlyPayouts done", {
    triggeredBy: options.triggeredBy,
    ...result,
  });
  return result;
}
