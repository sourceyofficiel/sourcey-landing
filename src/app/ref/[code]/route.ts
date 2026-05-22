import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  REF_COOKIE_MAX_AGE,
  REF_COOKIE_NAME,
  FRAUD_CLICK_THRESHOLD_PER_IP_24H,
  countRecentClicksFromIp,
  getIpFromHeaders,
  hashIp,
  isAffiliateActive,
  isRecentDuplicateClick,
} from "@/lib/affiliate";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /ref/[code]
 *
 * Route de tracking et redirection des liens affiliés.
 *
 * Flow :
 *   1. Lookup du code → vérifier qu'il existe et que l'affilié est encore actif.
 *      Si invalide ou suspendu → redirect / sans poser de cookie.
 *   2. Hash l'IP du visiteur (jamais en clair en base).
 *   3. Anti-fraude : si > 50 clics depuis la même IP en 24h → suspension auto
 *      du lien + email d'alerte admin.
 *   4. Dédupliquer les clics same-IP < 24h pour éviter le spam de stats.
 *   5. Enregistrer un AffiliateClick (sauf si dédupliqué).
 *   6. Poser le cookie src_ref (90j, SameSite=Lax, HttpOnly=false, Secure en prod)
 *      UNIQUEMENT si pas déjà posé — un premier lien gagne (on ne réécrase pas).
 *   7. Redirect → /pricing (ou /).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const code = params.code?.toUpperCase() ?? "";
  const homeUrl = new URL("/", origin);
  const pricingUrl = new URL("/pricing", origin);

  // === Validation basique du format ===
  // 8 caractères alphanumériques majuscules. Si malformé → home sans cookie.
  if (!/^[A-Z0-9]{6,12}$/.test(code)) {
    return NextResponse.redirect(homeUrl);
  }

  // === Lookup affilié ===
  const affiliate = await prisma.user.findUnique({
    where: { affiliateCode: code },
    select: { id: true, email: true, fullName: true },
  });
  if (!affiliate) {
    return NextResponse.redirect(homeUrl);
  }

  // L'affilié doit être en état actif (plan payant + sub OK + pas suspendu).
  if (!(await isAffiliateActive(affiliate.id))) {
    return NextResponse.redirect(homeUrl);
  }

  // === Tracking ===
  const ip = getIpFromHeaders(req.headers);
  const ipHash = hashIp(ip);
  const userAgent = req.headers.get("user-agent") ?? null;
  const referrer = req.headers.get("referer") ?? null;

  // Anti-fraude : > 50 clics même IP en 24h → suspension + alerte admin.
  const recentSameIp = await countRecentClicksFromIp(code, ipHash);
  if (recentSameIp >= FRAUD_CLICK_THRESHOLD_PER_IP_24H) {
    await prisma.user.update({
      where: { id: affiliate.id },
      data: { affiliateSuspendedAt: new Date() },
    });
    // Email admin
    const adminEmail =
      process.env.AFFILIATE_ALERT_EMAIL ?? "admin@sourcey.fr";
    await sendEmail({
      to: adminEmail,
      subject: "🚨 Affilié suspendu pour spam de clics",
      html: `
        <p>Le code <strong>${code}</strong> (affilié ${affiliate.email}) a généré
        ${recentSameIp} clics depuis la même IP en moins de 24h.</p>
        <p>Le lien est suspendu automatiquement. À revoir manuellement.</p>
      `,
    }).catch((e) => console.error("[ref] mail alert", e));
    // On laisse passer le redirect home (pas de cookie) — le user normal n'est pas
    // dérangé, mais le tracking de l'affilié est stoppé.
    return NextResponse.redirect(homeUrl);
  }

  // Déduplication : skip insert si déjà un clic même-IP < 24h.
  const isDuplicate = await isRecentDuplicateClick(code, ipHash);
  if (!isDuplicate) {
    await prisma.affiliateClick.create({
      data: {
        affiliateCode: code,
        ipHash,
        userAgent: userAgent ?? undefined,
        referrer: referrer ?? undefined,
      },
    });
  }

  // === Redirect + cookie ===
  const response = NextResponse.redirect(pricingUrl);

  // On ne RÉÉCRASE PAS un cookie existant. Logique anti-écrasement décrite
  // dans le brief : si un visiteur a déjà cliqué sur le lien d'un affilié A,
  // un autre lien (affilié B) ne doit pas voler la commission de A.
  const alreadyHasCookie = req.cookies.get(REF_COOKIE_NAME)?.value;
  if (!alreadyHasCookie) {
    response.cookies.set({
      name: REF_COOKIE_NAME,
      value: code,
      maxAge: REF_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false, // doit être lisible en JS pour la bannière de bienvenue
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}
