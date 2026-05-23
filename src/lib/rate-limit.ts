/**
 * Rate limiting — protection brute-force sur les routes d'auth.
 *
 * Deux niveaux :
 *
 *   1. Par utilisateur : User.failedLoginAttempts. Après 5 échecs, lockedUntil
 *      est posé à now+15min. La fonction registerLoginAttempt() gère ça.
 *
 *   2. Par IP : table IpBlock. Si une IP fait > 10 tentatives échouées sur
 *      des comptes différents (= brute force / credential stuffing), elle est
 *      bloquée 15 min. Utile contre les attaques distribuées sur plusieurs
 *      comptes que le user-level lockedUntil ne couvre pas.
 *
 * Tout est stocké en DB (pas Redis) : on a quelques user/sec max, donc
 * Postgres tient sans problème. Si on scale > 1000 logins/sec un jour, on
 * migrera sur Upstash Redis.
 */

import { prisma } from "@/lib/db";
import crypto from "node:crypto";

/* ============================================================
   CONSTANTES
   ============================================================ */

export const USER_LOCKOUT_THRESHOLD = 5; // 5 échecs → blocage compte 15 min
export const USER_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const IP_LOCKOUT_THRESHOLD = 10; // 10 échecs/IP en 10min → block IP 15 min
export const IP_LOCKOUT_WINDOW_MS = 10 * 60 * 1000;
export const IP_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/* ============================================================
   HASH IP
   ============================================================ */

export function hashIp(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET ?? "sourcey-default-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function getIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "0.0.0.0"
  );
}

/* ============================================================
   USER-LEVEL — blocage compte après 5 échecs
   ============================================================ */

/**
 * À appeler à chaque tentative de login, avant de vérifier le password.
 * Returns true si l'user est temporairement bloqué.
 */
export async function isUserLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });
  if (!user?.lockedUntil) return false;
  if (user.lockedUntil > new Date()) return true;
  // Expiration passée : on nettoie au passage.
  await prisma.user.update({
    where: { id: userId },
    data: { lockedUntil: null, failedLoginAttempts: 0 },
  });
  return false;
}

/**
 * Enregistre une tentative login : incrémente le compteur, déclenche le
 * blocage 15min si seuil atteint, ou reset si success.
 */
export async function registerLoginAttempt(
  userId: string,
  success: boolean
): Promise<{ locked: boolean }> {
  if (success) {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    return { locked: false };
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
    select: { failedLoginAttempts: true },
  });
  if (user.failedLoginAttempts >= USER_LOCKOUT_THRESHOLD) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + USER_LOCKOUT_DURATION_MS),
      },
    });
    return { locked: true };
  }
  return { locked: false };
}

/* ============================================================
   IP-LEVEL — block IP en cas de brute force distribué
   ============================================================ */

/**
 * Returns true si cette IP est actuellement bloquée. À appeler en tout
 * début de POST /api/auth/login + register + forgot-password.
 */
export async function isIpBlocked(ipHash: string): Promise<boolean> {
  const block = await prisma.ipBlock.findUnique({ where: { ipHash } });
  if (!block) return false;
  if (block.blockedUntil > new Date()) return true;
  // Expiration : on supprime le block obsolète pour éviter d'accumuler.
  await prisma.ipBlock
    .delete({ where: { ipHash } })
    .catch(() => {/* race condition OK */});
  return false;
}

/**
 * Compte les LoginLog en échec depuis cette IP sur les X dernières minutes.
 * Si > seuil, créer/maj un IpBlock.
 */
export async function maybeBlockIp(ipHash: string): Promise<{ blocked: boolean }> {
  const since = new Date(Date.now() - IP_LOCKOUT_WINDOW_MS);
  const recentFailures = await prisma.loginLog.count({
    where: {
      ipHash,
      success: false,
      createdAt: { gte: since },
    },
  });

  if (recentFailures >= IP_LOCKOUT_THRESHOLD) {
    await prisma.ipBlock.upsert({
      where: { ipHash },
      update: {
        attemptCount: recentFailures,
        blockedUntil: new Date(Date.now() + IP_LOCKOUT_DURATION_MS),
      },
      create: {
        ipHash,
        reason: "login_brute_force",
        attemptCount: recentFailures,
        blockedUntil: new Date(Date.now() + IP_LOCKOUT_DURATION_MS),
      },
    });
    return { blocked: true };
  }
  return { blocked: false };
}

/* ============================================================
   LOGGING — chaque tentative est tracée pour audit
   ============================================================ */

interface LogLoginAttemptInput {
  userId?: string | null;
  email: string;
  success: boolean;
  failureReason?: string;
  ipHash: string;
  userAgent?: string;
  method: "password" | "google" | "apple" | "2fa";
}

export async function logLoginAttempt(input: LogLoginAttemptInput) {
  await prisma.loginLog
    .create({
      data: {
        userId: input.userId ?? null,
        email: input.email,
        success: input.success,
        failureReason: input.failureReason ?? null,
        ipHash: input.ipHash,
        userAgent: input.userAgent,
        method: input.method,
      },
    })
    .catch((e) => console.error("[loginLog]", e));
}
