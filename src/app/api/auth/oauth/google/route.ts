import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, generateOAuthState } from "@/lib/oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/oauth/google
 *
 * Démarrage du flow OAuth Google. On génère un state crypto-random posé
 * en cookie HttpOnly pour vérifier le callback (anti-CSRF), puis on redirige
 * l'user vers la page de consentement Google.
 *
 * Variables d'env requises (sinon erreur 503) :
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 */
export async function GET() {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    return NextResponse.json(
      {
        error:
          "OAuth Google pas configuré. Ajoute GOOGLE_OAUTH_CLIENT_ID et GOOGLE_OAUTH_CLIENT_SECRET dans les variables d'env.",
      },
      { status: 503 }
    );
  }

  const state = generateOAuthState();
  cookies().set({
    name: "oauth_state",
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60, // 10 min
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
