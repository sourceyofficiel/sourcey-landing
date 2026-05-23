import { NextResponse } from "next/server";
import { verifyLoginCredentials } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendTwoFactorCode } from "@/lib/auth-emails";
import {
  getIpFromHeaders,
  hashIp,
  isIpBlocked,
  isUserLocked,
  registerLoginAttempt,
  maybeBlockIp,
  logLoginAttempt,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/login
 *
 * Nouveau flow avec 2FA email :
 *   1. Check IP block (rate limit global)
 *   2. Vérifie credentials sans encore créer la session
 *   3. Check email vérifié + compte non bloqué + non désactivé
 *   4. Génère un code 2FA email à 6 chiffres + envoi
 *   5. Retourne { needs2FA: true, email } — frontend redirect /auth/2fa
 *
 * Messages d'erreur volontairement vagues côté client ("Identifiants
 * incorrects") pour ne pas révéler si l'email existe ou pas (anti-énumération).
 * Mais on log la vraie raison côté server pour le debug.
 */
export async function POST(req: Request) {
  const ip = getIpFromHeaders(req.headers);
  const ipHash = hashIp(ip);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    // === Rate limit IP global ===
    if (await isIpBlocked(ipHash)) {
      await logLoginAttempt({
        email: "",
        success: false,
        failureReason: "ip_blocked",
        ipHash,
        userAgent,
        method: "password",
      });
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans 15 minutes." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const emailLower = body.email.trim().toLowerCase();

    const result = await verifyLoginCredentials({
      email: body.email,
      password: body.password,
    });

    if (!result.ok) {
      // Log la tentative pour audit + rate limit IP
      const userIdGuess = await prisma.user
        .findUnique({ where: { email: emailLower }, select: { id: true } })
        .then((u) => u?.id);

      if (userIdGuess && result.error === "PASSWORD_INVALID") {
        await registerLoginAttempt(userIdGuess, false);
      }

      await logLoginAttempt({
        userId: userIdGuess ?? null,
        email: emailLower,
        success: false,
        failureReason:
          result.error === "PASSWORD_INVALID"
            ? "bad_password"
            : result.error === "EMAIL_NOT_FOUND"
              ? "no_account"
              : result.error === "EMAIL_NOT_VERIFIED"
                ? "email_not_verified"
                : result.error === "ACCOUNT_LOCKED"
                  ? "locked"
                  : result.error === "ACCOUNT_DISABLED"
                    ? "disabled"
                    : "other",
        ipHash,
        userAgent,
        method: "password",
      });

      // Check si on doit bloquer l'IP (10 échecs en 10 min)
      await maybeBlockIp(ipHash);

      // Messages spécifiques pour les cas où ça aide l'user
      if (result.error === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          {
            error:
              "Ton email n'a pas encore été vérifié. Clique sur le lien que tu as reçu, ou demande un nouvel email.",
            code: "EMAIL_NOT_VERIFIED",
            email: emailLower,
          },
          { status: 403 }
        );
      }
      if (result.error === "ACCOUNT_LOCKED") {
        return NextResponse.json(
          {
            error:
              "Compte temporairement bloqué après plusieurs tentatives. Réessaie dans 15 minutes.",
          },
          { status: 423 }
        );
      }
      if (result.error === "ACCOUNT_DISABLED") {
        return NextResponse.json(
          {
            error:
              "Ce compte a été désactivé. Contacte-nous à hello@sourcey.fr.",
          },
          { status: 403 }
        );
      }
      if (result.error === "OAUTH_ONLY") {
        return NextResponse.json(
          {
            error:
              "Ce compte se connecte avec Google ou Apple. Utilise un de ces boutons.",
            code: "OAUTH_ONLY",
          },
          { status: 401 }
        );
      }

      // Cas généraux : message volontairement vague
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // === Credentials OK → génère + envoie code 2FA ===
    if (await isUserLocked(result.user.id)) {
      return NextResponse.json(
        { error: "Compte temporairement bloqué. Réessaie dans 15 minutes." },
        { status: 423 }
      );
    }

    const { plainToken: code } = await createAuthToken({
      userId: result.user.id,
      type: "totp_email",
      ipHash,
      userAgent,
    });

    await sendTwoFactorCode({
      to: result.user.email,
      fullName: result.user.fullName,
      code,
    }).catch((e) => console.error("[login] sendTwoFactorCode", e));

    // On ne crée PAS encore de session — l'user doit valider le code d'abord.
    // On retourne un challenge token (= juste l'email) pour la prochaine étape.
    return NextResponse.json({
      ok: true,
      needs2FA: true,
      email: result.user.email,
    });
  } catch (e) {
    console.error("[/api/auth/login]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
