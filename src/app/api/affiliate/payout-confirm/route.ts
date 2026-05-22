import { NextResponse } from "next/server";
import { confirmPendingCommissions } from "@/lib/cron-affiliate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET/POST /api/affiliate/payout-confirm
 *
 * Job quotidien : passe les commissions `pending` à `confirmed` quand
 * leur délai de 15 jours est écoulé. Branché sur Vercel Cron (daily).
 *
 * Sécurisé via le header x-vercel-cron-secret (variable CRON_SECRET).
 */
async function handler(req: Request) {
  const cronSecret = req.headers.get("x-vercel-cron-secret");
  const expectedCronSecret = process.env.CRON_SECRET;
  if (!expectedCronSecret || cronSecret !== expectedCronSecret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const result = await confirmPendingCommissions();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[affiliate.payout-confirm]", e);
    return NextResponse.json(
      { error: "Erreur traitement" },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
