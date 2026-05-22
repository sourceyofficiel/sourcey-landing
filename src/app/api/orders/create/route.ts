import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computeOrderAmounts,
  getOrderDiscount,
  normalizePlanSlug,
} from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/create
 *
 * Body : { supplierName, productDescription, grossAmount }
 *
 * - Lit le plan actif de l'utilisateur
 * - Calcule la réduction selon le plan (0/5/10/15%)
 * - Persiste la commande en DB avec montants détaillés
 * - Retourne la commande créée
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { supplierName?: string; productDescription?: string; grossAmount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { supplierName, productDescription, grossAmount } = body;
  if (
    !supplierName?.trim() ||
    !productDescription?.trim() ||
    typeof grossAmount !== "number" ||
    grossAmount <= 0
  ) {
    return NextResponse.json(
      { error: "Champs manquants : supplierName, productDescription, grossAmount > 0" },
      { status: 400 }
    );
  }

  // Récupère le plan stocké sur User (champ `plan` — populé par le webhook Stripe)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });
  const stripePlan = dbUser?.plan ?? "free";
  const planAtOrder = normalizePlanSlug(stripePlan);
  const discountPct = getOrderDiscount(stripePlan);
  const { savedAmount, netAmount } = computeOrderAmounts(grossAmount, discountPct);

  try {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        supplierName: supplierName.trim(),
        productDescription: productDescription.trim(),
        grossAmount,
        discountPct,
        savedAmount,
        netAmount,
        planAtOrder,
      },
    });
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error("[/api/orders/create]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
