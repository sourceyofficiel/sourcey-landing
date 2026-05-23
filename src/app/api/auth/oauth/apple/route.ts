import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildAppleAuthUrl, generateOAuthState } from "@/lib/oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/oauth/apple
 * Démarrage du flow Sign in with Apple. Cf. /api/auth/oauth/google pour
 * les détails (logique identique).
 *
 * Variables d'env requises :
 *   APPLE_OAUTH_CLIENT_ID         (= Service ID configuré côté Apple)
 *   APPLE_OAUTH_TEAM_ID
 *   APPLE_OAUTH_KEY_ID
 *   APPLE_OAUTH_PRIVATE_KEY       (clé privée .p8 en base64)
 */
export async function GET() {
  if (!process.env.APPLE_OAUTH_CLIENT_ID) {
    return NextResponse.json(
      {
        error:
          "Sign in with Apple pas configuré. Ajoute APPLE_OAUTH_CLIENT_ID, TEAM_ID, KEY_ID et PRIVATE_KEY dans les variables d'env.",
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
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(buildAppleAuthUrl(state));
}
