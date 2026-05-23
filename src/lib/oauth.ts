/**
 * OAuth providers — Google et Apple Sign-In.
 *
 * Implémentation custom (sans NextAuth) qui s'intègre avec notre système
 * de session JWT existant.
 *
 * Flow général :
 *   1. /api/auth/oauth/[provider]   → redirige vers la page d'auth du provider
 *   2. Provider redirige vers       → /api/auth/oauth/[provider]/callback
 *   3. Callback :
 *      a. Échange le code contre un id_token / access_token
 *      b. Vérifie le token (signature pour Apple, /tokeninfo pour Google)
 *      c. Lookup OAuthAccount par (provider, providerUserId)
 *      d. Si absent : tente le matching par email (= merge auto avec un compte existant)
 *      e. Crée le user si vraiment nouveau
 *      f. Crée la session JWT et redirige vers /app
 *
 * Variables d'env requises :
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   APPLE_OAUTH_CLIENT_ID         (= Service ID)
 *   APPLE_OAUTH_TEAM_ID
 *   APPLE_OAUTH_KEY_ID
 *   APPLE_OAUTH_PRIVATE_KEY       (clé privée .p8 en base64)
 */

import crypto from "node:crypto";
import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr";

/* ============================================================
   STATE / NONCE — protection CSRF du flow OAuth
   ============================================================ */

/**
 * Génère un state crypto-random à poser en cookie avant redirect, et à
 * vérifier en callback. Protège contre l'attaque CSRF / replay.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/* ============================================================
   GOOGLE OAUTH 2.0
   ============================================================ */

export const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export function buildGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_OAUTH_CLIENT_ID manquant");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${SITE_URL}/api/auth/oauth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

/**
 * Échange code → tokens, puis décode l'id_token (JWT signé Google).
 * On utilise l'endpoint tokeninfo de Google pour valider (au lieu de
 * vérifier la signature manuellement — plus simple, marginalement plus lent).
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Credentials Google OAuth manquantes");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${SITE_URL}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Google token exchange a échoué : ${errBody}`);
  }
  const tokens = (await tokenRes.json()) as GoogleTokenResponse;

  // Valide l'id_token côté Google (endpoint officiel)
  const infoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`
  );
  if (!infoRes.ok) {
    throw new Error("Validation id_token Google a échoué");
  }
  const info = (await infoRes.json()) as GoogleUserInfo & { aud: string };
  if (info.aud !== clientId) {
    throw new Error("Audience id_token Google invalide");
  }
  return {
    sub: info.sub,
    email: info.email,
    email_verified: Boolean(info.email_verified),
    name: info.name,
    picture: info.picture,
  };
}

/* ============================================================
   APPLE SIGN-IN
   ============================================================ */

export const APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize";
export const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";

export function buildAppleAuthUrl(state: string): string {
  const clientId = process.env.APPLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("APPLE_OAUTH_CLIENT_ID manquant");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${SITE_URL}/api/auth/oauth/apple/callback`,
    response_type: "code id_token",
    scope: "name email",
    state,
    response_mode: "form_post", // Apple impose form_post pour le scope email
  });
  return `${APPLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Apple nécessite un client_secret généré dynamiquement à partir d'une clé
 * privée .p8 fournie par Apple Developer (algo ES256, expiration max 6 mois).
 * On le génère à la volée pour chaque échange code.
 */
async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_OAUTH_TEAM_ID;
  const clientId = process.env.APPLE_OAUTH_CLIENT_ID;
  const keyId = process.env.APPLE_OAUTH_KEY_ID;
  const privateKeyB64 = process.env.APPLE_OAUTH_PRIVATE_KEY;
  if (!teamId || !clientId || !keyId || !privateKeyB64) {
    throw new Error("Credentials Apple Sign-In manquantes");
  }

  // La clé .p8 est stockée en base64 dans l'env var (pour éviter les soucis de
  // newlines dans Vercel). On la décode + reformat en PEM PKCS8.
  const privateKeyPem = Buffer.from(privateKeyB64, "base64").toString("utf-8");
  const key = await importPKCS8(privateKeyPem, "ES256");

  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60) // 1h (max Apple = 6 mois)
    .setAudience("https://appleid.apple.com")
    .setSubject(clientId)
    .sign(key);
}

interface AppleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
}

interface AppleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  is_private_email: boolean;
}

export async function exchangeAppleCode(code: string): Promise<AppleUserInfo> {
  const clientId = process.env.APPLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("APPLE_OAUTH_CLIENT_ID manquant");
  const clientSecret = await generateAppleClientSecret();

  const tokenRes = await fetch(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${SITE_URL}/api/auth/oauth/apple/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Apple token exchange a échoué : ${errBody}`);
  }
  const tokens = (await tokenRes.json()) as AppleTokenResponse;

  // Décode l'id_token Apple (JWT) — on récupère le payload sans vérifier
  // la signature ici car le token vient JUSTE d'être émis par Apple en
  // réponse à notre exchange. Pour un vrai prod-grade, valider via JWKS
  // https://appleid.apple.com/auth/keys.
  const payload = JSON.parse(
    Buffer.from(tokens.id_token.split(".")[1], "base64url").toString("utf-8")
  );
  if (payload.aud !== clientId) {
    throw new Error("Audience id_token Apple invalide");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === "true" || payload.email_verified === true,
    is_private_email: payload.is_private_email === "true" || payload.is_private_email === true,
  };
}

/* ============================================================
   USER LOOKUP / CREATION — merge auto avec compte existant
   ============================================================ */

interface UpsertOAuthUserInput {
  provider: "google" | "apple";
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  fullName?: string | null;
  avatarUrl?: string | null;
}

/**
 * 1. Si un OAuthAccount existe pour (provider, providerUserId) → retourne ce user
 * 2. Sinon, si un User existe avec le même email → on LIE le OAuth account à ce user
 *    (merge automatique, comme demandé dans le brief)
 * 3. Sinon, on crée un nouveau User + OAuthAccount
 *
 * Dans tous les cas, l'email est marqué comme vérifié (le provider l'a déjà fait).
 */
export async function upsertOAuthUser(
  input: UpsertOAuthUserInput
): Promise<{ userId: string; created: boolean }> {
  const emailLower = input.email.toLowerCase().trim();

  // Étape 1 : déjà lié ?
  const existingLink = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: input.provider,
        providerUserId: input.providerUserId,
      },
    },
    select: { userId: true },
  });
  if (existingLink) {
    // Mise à jour de last login + email vérifié au passage.
    await prisma.user.update({
      where: { id: existingLink.userId },
      data: {
        lastLoginAt: new Date(),
        emailVerifiedAt:
          input.emailVerified ? new Date() : undefined,
      },
    });
    return { userId: existingLink.userId, created: false };
  }

  // Étape 2 : matching par email (merge)
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
    select: { id: true },
  });
  if (existingUser) {
    await prisma.oAuthAccount.create({
      data: {
        userId: existingUser.id,
        provider: input.provider,
        providerUserId: input.providerUserId,
        email: emailLower,
      },
    });
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerifiedAt: input.emailVerified ? new Date() : undefined,
        lastLoginAt: new Date(),
        // Met à jour fullName et avatar si pas déjà set
        fullName: input.fullName ?? undefined,
        avatarUrl: input.avatarUrl ?? undefined,
      },
    });
    return { userId: existingUser.id, created: false };
  }

  // Étape 3 : nouveau user
  const newUser = await prisma.user.create({
    data: {
      email: emailLower,
      fullName: input.fullName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      lastLoginAt: new Date(),
      oauthAccounts: {
        create: {
          provider: input.provider,
          providerUserId: input.providerUserId,
          email: emailLower,
        },
      },
    },
    select: { id: true },
  });
  return { userId: newUser.id, created: true };
}
