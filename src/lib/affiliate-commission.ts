/**
 * Affiliate commission helpers — création + virement immédiat.
 *
 * Extrait du webhook Stripe pour pouvoir être appelé aussi depuis :
 *   - /api/billing/sync (failsafe quand le webhook n'a pas tourné)
 *   - /api/affiliate/admin/rebuild (reconstruction rétroactive)
 *
 * Idempotent à tous les niveaux : skip si la commission existe déjà.
 */

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  checkCommissionFraud,
  computeOnetimeCommission,
  isPlanEligibleForAffiliate,
} from "@/lib/affiliate";
import { payoutSingleCommissionImmediate } from "@/lib/cron-affiliate";

/**
 * Crée la commission ONETIME (1er mois 100%) pour un filleul et tente un
 * virement Stripe Transfer immédiat. Idempotent.
 *
 * Returns null si la commission n'a pas été créée (déjà existante, plan non
 * éligible, pas de referredBy, etc.). Returns l'id sinon.
 *
 * Cette fonction ne LOG que ses échecs — elle n'envoie pas d'exception
 * pour ne pas faire planter le webhook ou la route appelante.
 */
export async function createOnetimeCommissionIfApplicable(
  referredUserId: string
): Promise<{
  status: "created" | "skipped";
  reason?: string;
  commissionId?: string;
}> {
  const referredUser = await prisma.user.findUnique({
    where: { id: referredUserId },
    select: {
      id: true,
      plan: true,
      referredBy: true,
    },
  });
  if (!referredUser) return { status: "skipped", reason: "user_not_found" };
  if (!referredUser.referredBy)
    return { status: "skipped", reason: "no_referrer" };
  if (!isPlanEligibleForAffiliate(referredUser.plan))
    return { status: "skipped", reason: "plan_not_eligible" };

  // Idempotence
  const existing = await prisma.affiliateCommission.findFirst({
    where: { referredUserId, type: "onetime" },
    select: { id: true },
  });
  if (existing) return { status: "skipped", reason: "already_exists" };

  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: referredUser.referredBy },
    select: { id: true, plan: true, email: true, fullName: true },
  });
  if (!affiliate)
    return { status: "skipped", reason: "affiliate_not_found" };

  // Anti-fraude
  const fraud = await checkCommissionFraud({
    affiliateId: affiliate.id,
    referredUserId,
    affiliateCode: referredUser.referredBy,
  });

  const amount = computeOnetimeCommission(referredUser.plan);
  const status = fraud.ok ? "confirmed" : "cancelled";
  const flaggedReason = fraud.ok ? null : fraud.reason;

  const created = await prisma.affiliateCommission.create({
    data: {
      affiliateId: affiliate.id,
      referredUserId,
      type: "onetime",
      amount,
      status,
      periodMonth: 1,
      affiliatePlanAtTime: affiliate.plan,
      referredPlanAtTime: referredUser.plan,
      confirmedAt: status === "confirmed" ? new Date() : null,
      flaggedReason,
    },
  });

  // Marquer le clic correspondant comme converti
  await prisma.affiliateClick.updateMany({
    where: { affiliateCode: referredUser.referredBy, converted: false },
    data: { converted: true, convertedUserId: referredUserId },
  });

  // Email à l'affilié (si pas fraud)
  if (fraud.ok && affiliate.email) {
    await sendEmail({
      to: affiliate.email,
      subject: "🎉 Un nouveau filleul vient de rejoindre Sourcey",
      html: `
        <p>Salut ${affiliate.fullName ?? ""},</p>
        <p>Bonne nouvelle — quelqu'un a rejoint Sourcey via ton lien d'affiliation.</p>
        <p>Tu touches <strong>${amount} €</strong> de commission. Le virement
        est en cours sur ton compte de paiement.</p>
        <p>Voir ton dashboard : <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr"}/app/affiliation">Programme affiliation</a></p>
      `,
    }).catch((e) => console.error("[commission.create] mail", e));
  }

  // Virement immédiat
  if (status === "confirmed") {
    await payoutSingleCommissionImmediate(created.id).catch((e) =>
      console.error("[commission.create] payout", e)
    );
  }

  return { status: "created", commissionId: created.id };
}
