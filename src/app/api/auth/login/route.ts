import { NextResponse } from "next/server";
import { login, createSession } from "@/lib/auth";

/**
 * POST /api/auth/login
 * Body : { email, password }
 * Vérifie les credentials, crée une session si OK.
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

    const result = await login({ email: body.email, password: body.password });

    if (!result.ok) {
      const messages: Record<string, string> = {
        EMAIL_INVALID: "Email invalide",
        EMAIL_NOT_FOUND: "Aucun compte associé à cet email",
        PASSWORD_INVALID: "Mot de passe incorrect",
        OAUTH_ONLY: "Ce compte utilise une connexion OAuth (Google, etc.)",
      };
      return NextResponse.json(
        { error: messages[result.error] ?? "Identifiants invalides" },
        { status: 401 }
      );
    }

    await createSession(result.user.id);

    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("[/api/auth/login]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
