import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendEmailVerification } from "@/lib/auth-emails";
import { getIpFromHeaders, hashIp, isIpBlocked } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/resend-verification
 * Body: { email }
 *
 * Renvoie un email de vérification pour un compte non encore activé.
 * Anti-énumération : retourne toujours { ok: true }.
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
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
        disabledAt: true,
      },
    });

    // Envoi UNIQUEMENT si le user existe et n'a pas encore vérifié son mail.
    if (user && !user.emailVerifiedAt && !user.disabledAt) {
      try {
        const { plainToken } = await createAuthToken({
          userId: user.id,
          type: "email_verify",
          ipHash,
          userAgent,
        });
        await sendEmailVerification({
          to: user.email,
          fullName: user.fullName,
          token: plainToken,
        });
      } catch (e) {
        console.error("[resend-verification]", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/auth/resend-verification]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
