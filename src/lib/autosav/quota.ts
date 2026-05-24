/**
 * AutoSAV — gestion du quota mensuel de tickets IA.
 *
 * Workflow :
 *   1. Avant chaque appel IA, on check si le workspace a encore du quota
 *   2. Si plan "agency" → quota illimité, pas de check
 *   3. Sinon, increment ticketsUsedThisMonth
 *   4. Si over quota : créer un AutosavUsageRecord pour facturation au-delà
 *
 * Le reset mensuel est géré par un cron `/api/autosav/cron/reset-quotas`
 * qui tourne le 1er du mois.
 */

import { prisma } from "@/lib/db";

export const PLAN_QUOTAS = {
  trial: 200,
  starter: 200,
  pro: 1000,
  agency: -1, // -1 = illimité
} as const;

export const OVERAGE_PRICE_CENTS = 12; // 0.12€ par ticket overflow

/**
 * Increment le compteur mensuel. Retourne :
 *   - underQuota : true si l'usage est encore dans le quota
 *   - isMetered : true si on dépasse (= facturable)
 *   - newUsage : valeur après increment
 */
export async function consumeTicketQuota(workspaceId: string): Promise<{
  underQuota: boolean;
  isMetered: boolean;
  newUsage: number;
  quotaLimit: number;
}> {
  const ws = await prisma.autosavWorkspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true, quotaLimit: true, ticketsUsedThisMonth: true },
  });
  if (!ws) throw new Error("Workspace introuvable");

  // Plan illimité (agency) → consomme mais pas de check
  const isUnlimited = ws.plan === "agency";

  const updated = await prisma.autosavWorkspace.update({
    where: { id: workspaceId },
    data: { ticketsUsedThisMonth: { increment: 1 } },
    select: { ticketsUsedThisMonth: true, quotaLimit: true },
  });

  const underQuota = isUnlimited || updated.ticketsUsedThisMonth <= updated.quotaLimit;
  const isMetered = !underQuota; // overflow = facturable

  if (isMetered) {
    // Record l'usage pour reporting Stripe en fin de cycle
    await prisma.autosavUsageRecord.create({
      data: {
        workspaceId,
        quantity: 1,
      },
    });
  }

  return {
    underQuota: true, // on autorise l'usage, juste l'overflow est metered
    isMetered,
    newUsage: updated.ticketsUsedThisMonth,
    quotaLimit: updated.quotaLimit,
  };
}

/**
 * Reset mensuel — à appeler depuis le cron le 1er du mois.
 * Reset ticketsUsedThisMonth à 0 pour tous les workspaces actifs.
 */
export async function resetAllMonthlyQuotas() {
  const result = await prisma.autosavWorkspace.updateMany({
    where: { deletedAt: null },
    data: {
      ticketsUsedThisMonth: 0,
      quotaResetAt: new Date(),
    },
  });
  return { reset: result.count };
}

/**
 * Vérifie si un workspace est "blocked" (plan non payant + over quota).
 * En trial : on bloque à 200% du quota (= 400 tickets) pour éviter l'abus
 * sans CB.
 */
export async function isWorkspaceQuotaBlocked(workspaceId: string): Promise<boolean> {
  const ws = await prisma.autosavWorkspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true, ticketsUsedThisMonth: true, quotaLimit: true },
  });
  if (!ws) return true;
  if (ws.plan === "agency") return false;
  if (ws.plan === "trial" && ws.ticketsUsedThisMonth >= ws.quotaLimit * 2) {
    return true;
  }
  return false;
}
