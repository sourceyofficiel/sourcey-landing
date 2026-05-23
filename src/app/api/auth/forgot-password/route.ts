import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail } from "@/lib/auth-emails";
import {
  getIpFromHeaders,
  hashIp,
  isIpBlocked,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Envoie un email avec un lien de reset (token 1h). Anti-énumération :
 * la réponse est toujours { ok: true } même si l'email n'existe pas.
 */
export async function POST(req: Request) {
  const ipHash = hashIp(getIpFromHeaders(req.headers));
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    if (await isIpBlocked(ipHash)) {
      return NextResponse.json(
        { error: "Trop de tentatives." },
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
      select: { id: true, email: true, fullName: true, passwordHash: true },
    });

    // On n'envoie l'email QUE si :
    //   - le user existe
    //   - il a un passwordHash (= pas OAuth-only — sinon "reset password" ne
    //     fait pas sens, l'user doit se connecter via Google/Apple)
    if (user?.passwordHash) {
      try {
        const { plainToken } = await createAuthToken({
          userId: user.id,
          type: "password_reset",
          ipHash,
          userAgent,
        });
        await sendPasswordResetEmail({
          to: user.email,
          fullName: user.fullName,
          token: plainToken,
        });
      } catch (e) {
        console.error("[forgot-password] send", e);
      }
    }

    // Réponse identique dans tous les cas
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/auth/forgot-password]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
