import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  anonymizeUserId,
  buildAffiliateLink,
  getRecurringRateForPlan,
  PAYOUT_MIN_AMOUNT,
} from "@/lib/affiliate";
import { normalizePlanSlug, getPlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * GET /api/affiliate/stats
 *
 * Retourne les stats du dashboard affilié :
 *   - code + lien
 *   - clics totaux
 *   - filleuls actifs (filleuls qui ont une sub active actuellement)
 *   - commissions par status
 *   - taux récurrent actuel selon le plan
 *   - historique des payouts
 *   - liste anonymisée des filleuls (pour le tableau)
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      affiliateCode: true,
      affiliateActive: true,
      affiliateSuspendedAt: true,
      plan: true,
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      subscriptionStatus: true,
    },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Si pas encore activé → renvoyer une payload "vide" pour que la page sache
  // afficher l'écran "Activer le programme".
  if (!dbUser.affiliateCode || !dbUser.affiliateActive) {
    return NextResponse.json({
      activated: false,
      planSlug: normalizePlanSlug(dbUser.plan),
      suspended: false,
    });
  }

  const code = dbUser.affiliateCode;

  // === Clics ===
  const totalClicks = await prisma.affiliateClick.count({
    where: { affiliateCode: code },
  });
  const convertedClicks = await prisma.affiliateClick.count({
    where: { affiliateCode: code, converted: true },
  });

  // === Filleuls ===
  // "Actifs" = ont une subscriptionStatus active/trialing actuellement.
  const referredUsers = await prisma.user.findMany({
    where: { referredBy: code },
    select: {
      id: true,
      plan: true,
      subscriptionStatus: true,
      createdAt: true,
    },
  });
  const activeReferrals = referredUsers.filter((u) =>
    ["active", "trialing"].includes(u.subscriptionStatus ?? "")
  );

  // === Commissions ===
  const commissions = await prisma.affiliateCommission.findMany({
    where: { affiliateId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  const sum = (s: string) =>
    commissions
      .filter((c) => c.status === s)
      .reduce((acc, c) => acc + c.amount, 0);

  const pendingAmount = sum("pending");
  const confirmedAmount = sum("confirmed");
  const paidAmount = sum("paid");
  // "En attente" affiché à l'user = pending + confirmed (= pas encore versé).
  const unpaidAmount = pendingAmount + confirmedAmount;
  const lifetimeEarned = confirmedAmount + paidAmount;

  // === Payouts ===
  const payouts = await prisma.affiliatePayout.findMany({
    where: { affiliateId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // === Tableau des filleuls (anonymisé) ===
  // Pour chaque filleul, on agrège ses commissions one-shot + récurrent.
  const referralsTable = referredUsers.map((ref) => {
    const refCommissions = commissions.filter(
      (c) => c.referredUserId === ref.id
    );
    const onetime = refCommissions.find((c) => c.type === "onetime");
    const recurringTotal = refCommissions
      .filter((c) => c.type === "recurring")
      .reduce((acc, c) => acc + c.amount, 0);
    const lastRecurring = refCommissions.find((c) => c.type === "recurring");
    const isActive = ["active", "trialing"].includes(
      ref.subscriptionStatus ?? ""
    );
    return {
      anonId: anonymizeUserId(ref.id),
      joinedAt: ref.createdAt,
      currentPlan: normalizePlanSlug(ref.plan),
      onetimeAmount: onetime?.amount ?? 0,
      onetimeStatus: onetime?.status ?? "pending",
      monthlyAmount: lastRecurring?.amount ?? 0,
      totalEarned: (onetime?.amount ?? 0) + recurringTotal,
      status: isActive ? "active" : "inactive",
    };
  });

  // === Plan / taux ===
  const planSlug = normalizePlanSlug(dbUser.plan);
  const plan = getPlan(planSlug);
  const recurringRate = getRecurringRateForPlan(dbUser.plan);

  return NextResponse.json({
    activated: true,
    suspended: Boolean(dbUser.affiliateSuspendedAt),
    code,
    link: buildAffiliateLink(code),
    planSlug,
    planName: plan?.name ?? "Découvrir",
    recurringRate, // 0.05, 0.10, 0.15
    stripeConnectOnboarded: dbUser.stripeConnectOnboarded,
    needsStripeConnect: !dbUser.stripeConnectOnboarded,
    metrics: {
      totalClicks,
      convertedClicks,
      activeReferrals: activeReferrals.length,
      totalReferrals: referredUsers.length,
      unpaidAmount,
      pendingAmount,
      confirmedAmount,
      paidAmount,
      lifetimeEarned,
      payoutMinAmount: PAYOUT_MIN_AMOUNT,
    },
    referrals: referralsTable,
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
    })),
  });
}
