/**
 * Auth tokens — génération, hash, vérification, expiration.
 *
 * Gère 3 types de tokens stockés dans la table AuthToken :
 *   - 'email_verify' : lien d'activation, expire 24h
 *   - 'password_reset' : lien reset password, expire 1h
 *   - 'totp_email' : code 6 chiffres 2FA, expire 10 min
 *
 * Principes de sécurité :
 *   - Les tokens sont des chaînes cryptographiquement aléatoires (crypto.randomBytes)
 *   - Stockés HASHÉS (SHA-256) en base, jamais en clair
 *   - One-shot : usedAt posé dès la première utilisation, impossible de réutiliser
 *   - Indexés sur expiresAt pour cleanup régulier
 */

import crypto from "node:crypto";
import { prisma } from "@/lib/db";

export type TokenType = "email_verify" | "password_reset" | "totp_email";

/* ============================================================
   DURÉES DE VIE
   ============================================================ */

export const TOKEN_TTL_MS: Record<TokenType, number> = {
  email_verify: 24 * 60 * 60 * 1000, // 24h
  password_reset: 60 * 60 * 1000, // 1h
  totp_email: 10 * 60 * 1000, // 10 min
};

/* ============================================================
   GÉNÉRATION
   ============================================================ */

/**
 * Token URL-safe de 32 octets en base64url (= ~43 chars).
 * Utilisé pour email_verify et password_reset.
 */
function generateUrlSafeToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Code numérique à 6 chiffres pour la 2FA email.
 * On utilise crypto.randomInt pour éviter le biais de Math.random.
 * Min 100_000 pour garantir 6 chiffres (pas de zéros en tête).
 */
function generate6DigitCode(): string {
  const n = crypto.randomInt(100_000, 1_000_000);
  return String(n);
}

/**
 * Hash SHA-256 d'un token, encodé en hex. Toujours utilisé avant stockage en DB.
 * Pas besoin de bcrypt ici : le token est déjà cryptographiquement random,
 * donc résistant au brute-force par construction.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/* ============================================================
   CRÉATION
   ============================================================ */

interface CreateTokenInput {
  userId: string;
  type: TokenType;
  ipHash?: string;
  userAgent?: string;
}

/**
 * Crée un AuthToken en base et retourne la valeur EN CLAIR (à envoyer par mail).
 * Cette valeur n'est jamais retournée par la suite — seul son hash existe en DB.
 *
 * Pour les codes 2FA on retourne aussi le code en clair (à envoyer par mail).
 * Pour les links email_verify / password_reset on retourne le token URL-safe.
 */
export async function createAuthToken(input: CreateTokenInput): Promise<{
  plainToken: string;
  expiresAt: Date;
}> {
  // Invalide les anciens tokens du même type pour cet user (un seul actif à la fois).
  // Évite qu'un user qui demande 5 fois "renvoyer le code" ait 5 codes valides.
  await prisma.authToken.updateMany({
    where: { userId: input.userId, type: input.type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const plainToken =
    input.type === "totp_email" ? generate6DigitCode() : generateUrlSafeToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[input.type]);

  await prisma.authToken.create({
    data: {
      userId: input.userId,
      type: input.type,
      tokenHash,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      expiresAt,
    },
  });

  return { plainToken, expiresAt };
}

/* ============================================================
   VÉRIFICATION + CONSOMMATION (one-shot)
   ============================================================ */

export type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "already_used" };

/**
 * Vérifie un token et le marque comme utilisé (one-shot). Atomique :
 * si deux requêtes arrivent en même temps avec le même token, seule la
 * première passera grâce au check + update en transaction.
 */
export async function consumeAuthToken(
  plainToken: string,
  type: TokenType
): Promise<ConsumeResult> {
  const tokenHash = hashToken(plainToken);

  // Lookup
  const token = await prisma.authToken.findUnique({
    where: { tokenHash },
  });
  if (!token) return { ok: false, reason: "not_found" };
  if (token.type !== type) return { ok: false, reason: "not_found" };
  if (token.usedAt) return { ok: false, reason: "already_used" };
  if (token.expiresAt < new Date()) return { ok: false, reason: "expired" };

  // Update atomique : updateMany avec where qui inclut usedAt=null pour
  // qu'un deuxième thread qui tenterait de consommer en même temps voie
  // 0 rows updated et donc rate.
  const updated = await prisma.authToken.updateMany({
    where: { id: token.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (updated.count === 0) return { ok: false, reason: "already_used" };

  return { ok: true, userId: token.userId };
}

/**
 * Vérifie un token SANS le consommer. Utile pour les pages qui affichent
 * un formulaire (reset password) avant de soumettre. La consommation se fait
 * au moment de la soumission.
 */
export async function peekAuthToken(
  plainToken: string,
  type: TokenType
): Promise<ConsumeResult> {
  const tokenHash = hashToken(plainToken);
  const token = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!token || token.type !== type) return { ok: false, reason: "not_found" };
  if (token.usedAt) return { ok: false, reason: "already_used" };
  if (token.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, userId: token.userId };
}
