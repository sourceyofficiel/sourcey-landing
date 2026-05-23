import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { register } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  REF_COOKIE_NAME,
  hashIp,
  getIpFromHeaders,
  isAffiliateActive,
} from "@/lib/affiliate";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendEmailVerification } from "@/lib/auth-emails";
import { isIpBlocked } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/register
 *
 * Nouveau flow (sécurisé) :
 *   1. Vérifie que l'IP n'est pas bloquée (rate limit)
 *   2. Crée le user en base avec emailVerifiedAt=null (compte inactif)
 *   3. Lie le referredBy si cookie src_ref présent
 *   4. Envoie un email avec un lien d'activation (token 24h)
 *   5. NE CRÉE PAS DE SESSION — l'user doit cliquer sur le lien d'abord
 *   6. Frontend redirige vers /auth/verify-pending
 */
export async function POST(req: Request) {
  try {
    const ipHash = hashIp(getIpFromHeaders(req.headers));
    if (await isIpBlocked(ipHash)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessaie dans 15 minutes." },
        { status: 429 }
      );
    }

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
        WHATSAPP_REQUIRED: "Numéro WhatsApp requis",
      };
      return NextResponse.json(
        { error: messages[result.error] ?? "Inscription impossible" },
        { status: 400 }
      );
    }

    // === Affiliation : lit le cookie src_ref ===
    const refCode = cookies().get(REF_COOKIE_NAME)?.value;
    if (refCode) {
      try {
        const affiliate = await prisma.user.findUnique({
          where: { affiliateCode: refCode.toUpperCase() },
          select: { id: true },
        });
        if (
          affiliate &&
          affiliate.id !== result.user.id &&
          (await isAffiliateActive(affiliate.id))
        ) {
          await prisma.user.update({
            where: { id: result.user.id },
            data: {
              referredBy: refCode.toUpperCase(),
              referredByIpHash: ipHash,
            },
          });
        }
      } catch (e) {
        console.error("[register] referredBy", e);
      }
    }

    // === Envoi de l'email de vérification ===
    // Si l'email ne part pas (Resend down ou pas configuré), on log mais
    // on retourne quand même OK — l'user pourra demander un renvoi.
    try {
      const { plainToken } = await createAuthToken({
        userId: result.user.id,
        type: "email_verify",
        ipHash,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
      await sendEmailVerification({
        to: result.user.email,
        fullName: result.user.fullName,
        token: plainToken,
      });
    } catch (e) {
      console.error("[register] sendEmailVerification", e);
    }

    return NextResponse.json({
      ok: true,
      // PAS de user dans la réponse — l'user n'est pas connecté.
      needsEmailVerification: true,
      email: result.user.email,
    });
  } catch (e) {
    console.error("[/api/auth/register]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
