import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeAuthToken, peekAuthToken } from "@/lib/auth-tokens";
import { hashPassword } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/auth-emails";
import {
  getIpFromHeaders,
  hashIp,
  isIpBlocked,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/reset-password?token=...
 * Vérifie le token SANS le consommer (pour que la page de reset puisse
 * dire "lien valide / expiré" avant de soumettre le form).
 *
 * POST /api/auth/reset-password
 * Body: { token, password, confirmPassword }
 * Vérifie + consomme le token, hash + set le nouveau password, envoie un
 * email de confirmation, invalide TOUS les autres tokens password_reset du
 * user (au cas où il en a plusieurs).
 *
 * Note : on n'invalide PAS les sessions JWT existantes — c'est volontaire,
 * un user qui change son mdp doit pouvoir continuer à utiliser son tab actuel.
 * Si tu veux invalider toutes les sessions, il faudrait tracker chaque JWT
 * en DB (table Session) — pas implémenté ici.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
  }
  const r = await peekAuthToken(token, "password_reset");
  if (!r.ok) {
    return NextResponse.json({ ok: false, reason: r.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const ipHash = hashIp(getIpFromHeaders(req.headers));

  try {
    if (await isIpBlocked(ipHash)) {
      return NextResponse.json(
        { error: "Trop de tentatives." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      token?: string;
      password?: string;
      confirmPassword?: string;
    };
    if (!body.token || !body.password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      );
    }
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit faire 8 caractères minimum" },
        { status: 400 }
      );
    }
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Les deux mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    const result = await consumeAuthToken(body.token, "password_reset");
    if (!result.ok) {
      const msg = {
        expired: "Ce lien a expiré. Demande un nouveau lien.",
        already_used: "Ce lien a déjà été utilisé.",
        not_found: "Lien invalide.",
      }[result.reason];
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.update({
      where: { id: result.userId },
      data: {
        passwordHash,
        // Reset les tentatives échouées au passage (cas où le user était locked
        // et a fait reset password pour débloquer).
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      select: { email: true, fullName: true },
    });

    // Invalide tous les autres tokens reset password actifs (sécurité)
    await prisma.authToken.updateMany({
      where: {
        userId: result.userId,
        type: "password_reset",
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Email de confirmation (avec lien contact si pas l'user)
    await sendPasswordChangedEmail({
      to: user.email,
      fullName: user.fullName,
    }).catch((e) => console.error("[reset-password] mail", e));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/auth/reset-password]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
