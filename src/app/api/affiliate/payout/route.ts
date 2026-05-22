import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runMonthlyPayouts } from "@/lib/cron-affiliate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/affiliate/payout
 *
 * Déclenche les virements Stripe Connect pour toutes les commissions
 * confirmed dont le cumul par affilié ≥ 20 €.
 *
 * Accès : admin only via getCurrentUser().isAdmin
 * OU : Vercel Cron (via le header x-vercel-cron + token secret)
 *
 * Logique déléguée à lib/cron-affiliate.ts pour pouvoir l'appeler aussi
 * depuis un cron job sans HTTP (en cas de migration vers un worker).
 */
export async function POST(req: Request) {
  // 1. Accès par Vercel Cron (preferred path en prod)
  const cronSecret = req.headers.get("x-vercel-cron-secret");
  const expectedCronSecret = process.env.CRON_SECRET;
  const isCronCall =
    Boolean(expectedCronSecret) && cronSecret === expectedCronSecret;

  // 2. Accès admin (déclenchement manuel depuis /admin)
  let isAdminCall = false;
  if (!isCronCall) {
    const user = await getCurrentUser();
    if (user?.isAdmin) {
      isAdminCall = true;
    }
  }

  if (!isCronCall && !isAdminCall) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const result = await runMonthlyPayouts({
      triggeredBy: isCronCall ? "cron" : "admin",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[affiliate.payout]", e);
    return NextResponse.json(
      { error: "Erreur traitement payout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/affiliate/payout
 *
 * Alias pour Vercel Cron qui appelle GET par défaut. Même logique.
 */
export async function GET(req: Request) {
  return POST(req);
}
