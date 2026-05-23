import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode, upsertOAuthUser } from "@/lib/oauth";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getIpFromHeaders,
  hashIp,
  logLoginAttempt,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/oauth/google/callback?code=...&state=...
 *
 * Callback Google après consentement. Étapes :
 *   1. Vérifie le state (anti-CSRF)
 *   2. Échange code → tokens → info user
 *   3. Upsert user (merge auto par email si existant)
 *   4. Crée la session JWT
 *   5. Redirect /app
 *
 * Pas de 2FA email pour les logins OAuth — le provider a déjà authentifié
 * l'user de son côté (Google a même un 2FA TOTP optionnel). Ajouter une
 * 2FA email par-dessus serait redondant et ferait fuir les users.
 */
export async function GET(req: Request) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const ipHash = hashIp(getIpFromHeaders(req.headers));
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // L'user a refusé le consentement Google
  if (error) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_denied", origin)
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_missing", origin)
    );
  }

  // Vérifie le state vs cookie
  const cookieState = cookies().get("oauth_state")?.value;
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_state", origin)
    );
  }
  cookies().delete("oauth_state");

  try {
    const userInfo = await exchangeGoogleCode(code);
    if (!userInfo.email_verified) {
      return NextResponse.redirect(
        new URL("/auth/login?error=oauth_email_unverified", origin)
      );
    }

    const { userId, created } = await upsertOAuthUser({
      provider: "google",
      providerUserId: userInfo.sub,
      email: userInfo.email,
      emailVerified: true,
      fullName: userInfo.name ?? null,
      avatarUrl: userInfo.picture ?? null,
    });

    // Check si compte désactivé
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { disabledAt: true, email: true },
    });
    if (user?.disabledAt) {
      return NextResponse.redirect(
        new URL("/auth/login?error=account_disabled", origin)
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), lastLoginIpHash: ipHash },
    });

    await logLoginAttempt({
      userId,
      email: userInfo.email,
      success: true,
      ipHash,
      userAgent,
      method: "google",
    });

    await createSession(userId);

    return NextResponse.redirect(
      new URL(created ? "/app/bienvenue" : "/app", origin)
    );
  } catch (e) {
    console.error("[oauth.google.callback]", e);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", origin)
    );
  }
}
