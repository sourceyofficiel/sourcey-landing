import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/verify-email?token=...
 *
 * Appelée depuis le lien du mail "Confirme ton adresse email".
 * Si le token est valide, on pose `emailVerifiedAt`, on crée la session,
 * puis on redirige vers /app.
 *
 * Réponses :
 *   - Redirect /app : succès, user connecté direct
 *   - Redirect /auth/login?error=verify_invalid : token KO
 *   - Redirect /auth/login?error=verify_expired : token expiré
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login?error=verify_missing", origin)
    );
  }

  const result = await consumeAuthToken(token, "email_verify");
  if (!result.ok) {
    const errMap = {
      expired: "verify_expired",
      already_used: "verify_used",
      not_found: "verify_invalid",
    } as const;
    return NextResponse.redirect(
      new URL(`/auth/login?error=${errMap[result.reason]}`, origin)
    );
  }

  // Marque l'email comme vérifié
  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerifiedAt: new Date() },
  });

  // Crée la session directement (UX optimale : l'user vient de confirmer
  // son email, on lui évite de retaper son mdp).
  await createSession(result.userId);

  return NextResponse.redirect(new URL("/app/bienvenue", origin));
}
