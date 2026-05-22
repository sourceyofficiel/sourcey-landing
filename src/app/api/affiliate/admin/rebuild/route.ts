import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOnetimeCommissionIfApplicable } from "@/lib/affiliate-commission";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/affiliate/admin/rebuild
 *
 * Reconstruit les commissions onetime manquantes pour les filleuls de
 * l'admin appelant. Idempotent : skip si la commission existe déjà.
 *
 * Use case : le webhook checkout.session.completed n'a pas tourné pour
 * certains paiements (mauvaise config, redéploiement raté, etc.), et les
 * filleuls apparaissent dans le dashboard mais sans commission associée.
 *
 * Pour chaque filleul (User avec referredBy = admin.affiliateCode) :
 *   1. Check si une AffiliateCommission onetime existe
 *   2. Sinon, appelle createOnetimeCommissionIfApplicable() qui gère tout
 *      (fraud check, création, virement immédiat, email)
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { affiliateCode: true },
  });
  if (!me?.affiliateCode) {
    return NextResponse.json(
      { error: "Tu n'as pas encore activé ton lien d'affiliation" },
      { status: 400 }
    );
  }

  // Tous les filleuls qui ont été parrainés par cet admin.
  const referrals = await prisma.user.findMany({
    where: { referredBy: me.affiliateCode },
    select: { id: true, email: true, plan: true },
  });

  const results: Array<{
    userId: string;
    email: string;
    plan: string;
    status: string;
    reason?: string;
    commissionId?: string;
  }> = [];

  for (const ref of referrals) {
    const r = await createOnetimeCommissionIfApplicable(ref.id);
    results.push({
      userId: ref.id,
      email: ref.email,
      plan: ref.plan,
      status: r.status,
      reason: r.reason,
      commissionId: r.commissionId,
    });
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  });
}
