import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendTwoFactorCode } from "@/lib/auth-emails";
import {
  getIpFromHeaders,
  hashIp,
  isIpBlocked,
  isUserLocked,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/2fa/resend
 * Body: { email }
 *
 * Renvoie un nouveau code 2FA si l'user est en cours de login (= a déjà
 * passé l'étape password). Invalide automatiquement les codes précédents
 * (un seul code valide à la fois via createAuthToken).
 *
 * On ne révèle JAMAIS si l'email existe ou pas — on retourne toujours ok:true.
 * Limité par le rate-limit IP comme les autres routes auth.
 */
export async function POST(req: Request) {
  const ip = getIpFromHeaders(req.headers);
  const ipHash = hashIp(ip);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    if (await isIpBlocked(ipHash)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans 15 minutes." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string };
    if (!body.email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }
    const emailLower = body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
        disabledAt: true,
      },
    });
    // Réponse identique si user inexistant ou actif (anti-énumération)
    if (!user || !user.emailVerifiedAt || user.disabledAt) {
      return NextResponse.json({ ok: true });
    }
    if (await isUserLocked(user.id)) {
      return NextResponse.json({ ok: true });
    }

    const { plainToken: code } = await createAuthToken({
      userId: user.id,
      type: "totp_email",
      ipHash,
      userAgent,
    });
    await sendTwoFactorCode({
      to: user.email,
      fullName: user.fullName,
      code,
    }).catch((e) => console.error("[2fa.resend]", e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/auth/2fa/resend]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
