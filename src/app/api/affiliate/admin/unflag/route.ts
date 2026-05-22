import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { payoutSingleCommissionImmediate } from "@/lib/cron-affiliate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/affiliate/admin/unflag
 * Body: { commissionId: string } OR { all: true } (toutes les cancelled)
 *
 * Réservé aux admins. Permet de "débloquer" une commission cancelled
 * (faux positif anti-fraude, test perso same-IP, etc.) :
 *   1. status: 'cancelled' → 'confirmed'
 *   2. flaggedReason: cleared
 *   3. Déclenche un Stripe Transfer immédiat
 *
 * Usage UI : bouton "Forcer le paiement" sur les lignes cancelled du
 * ReferralTable, visible seulement si user.isAdmin.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    commissionId?: string;
    all?: boolean;
  };

  let targetIds: string[] = [];

  if (body.commissionId) {
    targetIds = [body.commissionId];
  } else if (body.all) {
    // Toutes les cancelled de l'admin (par sécurité : pas toutes les
    // cancelled de la plateforme, juste les siennes).
    const cancelled = await prisma.affiliateCommission.findMany({
      where: { affiliateId: user.id, status: "cancelled" },
      select: { id: true },
    });
    targetIds = cancelled.map((c) => c.id);
  }

  if (targetIds.length === 0) {
    return NextResponse.json(
      { error: "Aucune commission à débloquer" },
      { status: 400 }
    );
  }

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const id of targetIds) {
    // Reset status + clear flag.
    await prisma.affiliateCommission.update({
      where: { id },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
        flaggedReason: null,
      },
    });
    // Tente le virement immédiat.
    const r = await payoutSingleCommissionImmediate(id);
    results.push({ id, status: r.status, error: r.error });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
