import { NextResponse } from "next/server";
import { verifyLoginCredentials, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * MODE SIMPLE (sans 2FA email) :
 *   - Vérifie email + password
 *   - Crée la session direct
 *   - Pas de code à 6 chiffres, pas de mail
 *
 * On garde bcrypt pour la sécu de base, et le check email vérifié (qui
 * passe systématiquement puisque le register pose emailVerifiedAt direct).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const result = await verifyLoginCredentials({
      email: body.email,
      password: body.password,
    });

    if (!result.ok) {
      // Edge case : un user créé AVANT le mode simple peut ne pas avoir
      // emailVerifiedAt. On lui force la valeur pour ne pas le bloquer.
      if (result.error === "EMAIL_NOT_VERIFIED") {
        const u = await prisma.user.findUnique({
          where: { email: body.email.trim().toLowerCase() },
          select: { id: true },
        });
        if (u) {
          await prisma.user.update({
            where: { id: u.id },
            data: { emailVerifiedAt: new Date() },
          });
          // Retry une fois
          const retry = await verifyLoginCredentials({
            email: body.email,
            password: body.password,
          });
          if (retry.ok) {
            await createSession(retry.user.id);
            return NextResponse.json({ ok: true, user: retry.user });
          }
        }
      }

      const messages: Record<string, string> = {
        EMAIL_INVALID: "Email invalide",
        EMAIL_NOT_FOUND: "Email ou mot de passe incorrect",
        PASSWORD_INVALID: "Email ou mot de passe incorrect",
        OAUTH_ONLY: "Ce compte utilise Google/Apple",
        ACCOUNT_LOCKED: "Compte temporairement bloqué",
        ACCOUNT_DISABLED: "Ce compte a été désactivé",
      };
      return NextResponse.json(
        { error: messages[result.error] ?? "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Crée la session direct (pas de 2FA)
    await createSession(result.user.id);

    // Update last login simple sans tracking
    await prisma.user
      .update({
        where: { id: result.user.id },
        data: { lastLoginAt: new Date(), failedLoginAttempts: 0 },
      })
      .catch(() => {/* silent */});

    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("[/api/auth/login]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
