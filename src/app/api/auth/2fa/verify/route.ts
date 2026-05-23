import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { createSession } from "@/lib/auth";
import {
  getIpFromHeaders,
  hashIp,
  isIpBlocked,
  isUserLocked,
  registerLoginAttempt,
  logLoginAttempt,
  maybeBlockIp,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/2fa/verify
 * Body: { email, code }
 *
 * Deuxième étape du login : on vérifie le code 2FA reçu par mail.
 *
 * Si le code est OK :
 *   - on consomme le token (one-shot)
 *   - on reset failedLoginAttempts
 *   - on pose lastLoginAt + lastLoginIpHash
 *   - on crée la session JWT
 *
 * Si KO :
 *   - on log + incrémente failedLoginAttempts (5 échecs = lockout 15min)
 *   - message vague
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

    const body = (await req.json()) as { email?: string; code?: string };
    if (!body.email || !body.code) {
      return NextResponse.json(
        { error: "Email et code requis" },
        { status: 400 }
      );
    }

    const emailLower = body.email.trim().toLowerCase();
    const cleanCode = body.code.replace(/\D/g, "").trim();

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
    if (!user) {
      await logLoginAttempt({
        email: emailLower,
        success: false,
        failureReason: "no_account",
        ipHash,
        userAgent,
        method: "2fa",
      });
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    if (await isUserLocked(user.id)) {
      return NextResponse.json(
        { error: "Compte temporairement bloqué. Réessaie dans 15 minutes." },
        { status: 423 }
      );
    }

    const result = await consumeAuthToken(cleanCode, "totp_email");
    if (!result.ok || result.userId !== user.id) {
      await registerLoginAttempt(user.id, false);
      await logLoginAttempt({
        userId: user.id,
        email: emailLower,
        success: false,
        failureReason: "2fa_failed",
        ipHash,
        userAgent,
        method: "2fa",
      });
      await maybeBlockIp(ipHash);
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    // === Succès ===
    await registerLoginAttempt(user.id, true);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIpHash: ipHash,
      },
    });
    await logLoginAttempt({
      userId: user.id,
      email: emailLower,
      success: true,
      ipHash,
      userAgent,
      method: "2fa",
    });

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (e) {
    console.error("[/api/auth/2fa/verify]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
