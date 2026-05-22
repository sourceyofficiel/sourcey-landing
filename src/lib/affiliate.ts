/**
 * Affiliate program — fonctions utilitaires partagées.
 *
 * Source unique de vérité pour :
 *   - génération de codes affiliés (8 chars alphanum, crypto.randomBytes)
 *   - calcul des taux selon le plan de l'affilié (5/10/15%)
 *   - calcul du montant d'une commission (one-shot vs recurring)
 *   - hash d'IP (SHA-256) pour le tracking anti-fraude
 *   - détection de self-referral et de spam IP
 *
 * Aucun side-effect base : pure fonctions ou queries en lecture seule.
 * Les mutations vivent dans les Route Handlers / webhooks Stripe.
 */

import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getPlan, normalizePlanSlug, type PlanSlug } from "@/lib/plans";

/* ============================================================
   CONSTANTES
   ============================================================ */

/** Plans payants éligibles au programme (Découvrir exclu). */
export const ELIGIBLE_PLAN_SLUGS: PlanSlug[] = ["essential", "pro", "premium"];

/** Taux de commission récurrente selon le plan de l'AFFILIÉ (pas du filleul). */
export const RECURRING_RATES: Record<PlanSlug, number> = {
  free: 0,
  essential: 0.05,
  pro: 0.1,
  premium: 0.15,
};

/** Durée du cookie src_ref en secondes (90 jours). */
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
export const REF_COOKIE_NAME = "src_ref";

/** Délai entre createdAt et confirmedAt (15 jours, période de remboursement). */
export const CONFIRMATION_DELAY_DAYS = 15;

/** Seuil minimum pour déclencher un virement Stripe Connect. */
export const PAYOUT_MIN_AMOUNT = 20;

/** Statuts de subscription Stripe considérés actifs pour le programme. */
export const ACTIVE_SUB_STATUSES = ["active", "trialing"] as const;

/** Anti-fraude : seuil de clics depuis la même IP en 24h → suspension. */
export const FRAUD_CLICK_THRESHOLD_PER_IP_24H = 50;

/** Anti-fraude : fenêtre de déduplication des clics same-IP. */
export const CLICK_DEDUP_WINDOW_HOURS = 24;

/* ============================================================
   GÉNÉRATION DE CODES
   ============================================================ */

/**
 * Génère un code affilié cryptographiquement sûr de 8 caractères
 * alphanumériques en majuscules (A-Z, 0-9 → 36 chars, ~36^8 = 2.8e12 combos).
 *
 * On évite les caractères ambigus (O/0, I/1) pour limiter les erreurs de
 * saisie quand un user dicte son code à un proche.
 */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars sans 0/O/1/I

function generateRandomCode(length = 8): string {
  // crypto.randomBytes(N) → on en lit assez pour piocher length indices.
  // 256 % 32 == 0 → pas de biais en faisant byte % 32.
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Génère un code unique en base. Boucle avec retry au cas où la collision
 * arrive (extrêmement rare avec 32^8 combos, mais on protège).
 */
export async function generateUniqueAffiliateCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = generateRandomCode(8);
    const existing = await prisma.user.findUnique({
      where: { affiliateCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  // Si on a 5 collisions d'affilée, il y a un bug — on throw plutôt que d'insister.
  throw new Error("Impossible de générer un code affilié unique après 5 essais");
}

/* ============================================================
   HASH IP (anti-fraude)
   ============================================================ */

/**
 * Hash SHA-256 d'une IP, salé avec NEXTAUTH_SECRET pour éviter le rainbow.
 * On ne stocke JAMAIS d'IP en clair (RGPD + sécurité).
 */
export function hashIp(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET ?? "sourcey-default-salt";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}

/**
 * Extrait l'IP "réelle" depuis les headers de la requête (Vercel, Cloudflare,
 * proxies). Fallback sur 0.0.0.0 si rien trouvé (dev local).
 */
export function getIpFromHeaders(headers: Headers): string {
  // X-Forwarded-For peut contenir une chaîne "client, proxy1, proxy2" → on prend le premier.
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "0.0.0.0"
  );
}

/* ============================================================
   ÉLIGIBILITÉ
   ============================================================ */

/**
 * Un user est éligible au programme s'il a un plan payant ET une sub active.
 * Le plan brut peut contenir des variantes annuelles (ex: "pro_annual") qu'on
 * normalise via normalizePlanSlug.
 */
export function isPlanEligibleForAffiliate(plan: string | null | undefined): boolean {
  const slug = normalizePlanSlug(plan);
  return ELIGIBLE_PLAN_SLUGS.includes(slug);
}

export function isSubscriptionActive(status: string | null | undefined): boolean {
  if (!status) return false;
  return (ACTIVE_SUB_STATUSES as readonly string[]).includes(status);
}

/**
 * Check complet : l'affilié peut-il toucher des commissions en ce moment ?
 * Doit être appelé à chaque événement Stripe pour décider si on crée
 * une AffiliateCommission ou pas.
 */
export async function isAffiliateActive(affiliateUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: affiliateUserId },
    select: {
      affiliateActive: true,
      affiliateSuspendedAt: true,
      plan: true,
      subscriptionStatus: true,
    },
  });
  if (!user) return false;
  if (!user.affiliateActive) return false;
  if (user.affiliateSuspendedAt) return false;
  if (!isPlanEligibleForAffiliate(user.plan)) return false;
  if (!isSubscriptionActive(user.subscriptionStatus)) return false;
  return true;
}

/* ============================================================
   CALCUL DE COMMISSION
   ============================================================ */

/**
 * Calcule le montant de la commission ONE-SHOT (1er mois) :
 * 100% du prix mensuel du plan du FILLEUL, quel que soit le plan de l'affilié.
 * → Filleul Essentiel = 29 €, Pro = 79 €, Premium = 149 €.
 *
 * On utilise toujours priceMonthly (pas yearly), même si le filleul prend
 * un abonnement annuel. La logique : la commission compense le 1er mois
 * d'usage Sourcey, indépendamment de l'engagement.
 */
export function computeOnetimeCommission(referredPlan: string): number {
  const plan = getPlan(normalizePlanSlug(referredPlan));
  return plan?.priceMonthly ?? 0;
}

/**
 * Calcule le montant de la commission RECURRING (mois 2+) :
 *   amount = priceMonthly du filleul × taux du plan de l'AFFILIÉ
 *
 * Ex affilié Pro (taux 10%) parrain d'un filleul Premium :
 *   149 € × 0.10 = 14.90 €
 * Si l'affilié upgrade en Premium plus tard, le calcul de la commission
 * suivante utilisera automatiquement 15% (pas de migration rétroactive).
 */
export function computeRecurringCommission(
  affiliatePlan: string,
  referredPlan: string
): { amount: number; rate: number } {
  const affSlug = normalizePlanSlug(affiliatePlan);
  const refSlug = normalizePlanSlug(referredPlan);
  const rate = RECURRING_RATES[affSlug] ?? 0;
  const refPrice = getPlan(refSlug)?.priceMonthly ?? 0;
  // Math.round avec 2 décimales pour éviter les floats foireux (€).
  const amount = Math.round(refPrice * rate * 100) / 100;
  return { amount, rate };
}

/* ============================================================
   ANTI-FRAUDE — checks au moment de créer une commission
   ============================================================ */

export type FraudCheckResult =
  | { ok: true }
  | { ok: false; reason: "self_referral" | "same_ip_signup" | "affiliate_inactive" };

/**
 * Vérifie qu'on peut légitimement créer une commission :
 *   1. L'affilié et le filleul sont des users distincts (pas de self-parrainage)
 *   2. Le filleul ne s'est PAS inscrit depuis une IP qui apparaît dans les clics
 *      de l'affilié (parrainage frauduleux d'un compte secondaire)
 *   3. L'affilié est toujours actif (plan payant + sub OK + pas suspendu)
 */
export async function checkCommissionFraud(input: {
  affiliateId: string;
  referredUserId: string;
  affiliateCode: string;
}): Promise<FraudCheckResult> {
  // Self-referral check : TOUJOURS appliqué, même en mode test/debug.
  if (input.affiliateId === input.referredUserId) {
    return { ok: false, reason: "self_referral" };
  }

  // Affilié encore actif ?
  const active = await isAffiliateActive(input.affiliateId);
  if (!active) {
    return { ok: false, reason: "affiliate_inactive" };
  }

  // Flag d'env pour désactiver le check same-IP en mode test (utile quand un
  // dev teste son propre flow depuis sa machine). Le self-referral check
  // ci-dessus reste actif pour éviter les abus évidents.
  if (process.env.SOURCEY_AFFILIATE_DISABLE_IP_CHECK === "1") {
    return { ok: true };
  }

  // IP de signup du filleul ∈ IPs de clic de l'affilié ?
  const referredUser = await prisma.user.findUnique({
    where: { id: input.referredUserId },
    select: { referredByIpHash: true },
  });
  if (referredUser?.referredByIpHash) {
    const suspiciousClick = await prisma.affiliateClick.findFirst({
      where: {
        affiliateCode: input.affiliateCode,
        ipHash: referredUser.referredByIpHash,
      },
      select: { id: true },
    });
    if (suspiciousClick) {
      return { ok: false, reason: "same_ip_signup" };
    }
  }

  return { ok: true };
}

/**
 * Anti-fraude : compte le nombre de clics depuis une IP donnée pour un code
 * sur les dernières 24h. Si ≥ FRAUD_CLICK_THRESHOLD_PER_IP_24H → suspension.
 */
export async function countRecentClicksFromIp(
  affiliateCode: string,
  ipHash: string
): Promise<number> {
  const since = new Date(Date.now() - CLICK_DEDUP_WINDOW_HOURS * 3600 * 1000);
  return prisma.affiliateClick.count({
    where: {
      affiliateCode,
      ipHash,
      createdAt: { gte: since },
    },
  });
}

/**
 * Vérifie si on doit dédupliquer ce clic (même IP, même code, < 24h).
 * Retourne true si un clic identique existe déjà.
 */
export async function isRecentDuplicateClick(
  affiliateCode: string,
  ipHash: string
): Promise<boolean> {
  const since = new Date(Date.now() - CLICK_DEDUP_WINDOW_HOURS * 3600 * 1000);
  const existing = await prisma.affiliateClick.findFirst({
    where: {
      affiliateCode,
      ipHash,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

/* ============================================================
   HELPERS DASHBOARD
   ============================================================ */

/** Pseudonymise un userId pour affichage dans le tableau filleuls. */
export function anonymizeUserId(userId: string): string {
  // SHA-256 court (8 chars) → opaque mais stable pour grouper les lignes.
  return (
    "F-" +
    crypto.createHash("sha256").update(userId).digest("hex").slice(0, 8).toUpperCase()
  );
}

/** Construit le lien complet d'un affilié à partir du site URL et du code. */
export function buildAffiliateLink(code: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://sourcey.fr";
  return `${origin}/ref/${code}`;
}

/** Retourne le taux récurrent pour un plan donné (helper UI). */
export function getRecurringRateForPlan(plan: string | null | undefined): number {
  return RECURRING_RATES[normalizePlanSlug(plan)];
}
