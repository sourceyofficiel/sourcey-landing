import { NextResponse } from "next/server";
import { register, createSession } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Body : { email, password, fullName? }
 * Crée un compte + session auto si OK.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      whatsapp?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const result = await register({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      whatsapp: body.whatsapp,
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        EMAIL_INVALID: "Email invalide",
        PASSWORD_TOO_SHORT: "Le mot de passe doit faire 8 caractères minimum",
        EMAIL_TAKEN: "Un compte existe déjà avec cet email",
        WHATSAPP_REQUIRED: "Numéro WhatsApp requis (notre canal principal)",
      };
      return NextResponse.json(
        { error: messages[result.error] ?? "Inscription impossible" },
        { status: 400 }
      );
    }

    await createSession(result.user.id);

    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("[/api/auth/register]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
