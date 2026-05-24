import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { register, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  REF_COOKIE_NAME,
  hashIp,
  getIpFromHeaders,
  isAffiliateActive,
} from "@/lib/affiliate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/register
 * Body : { email, password, fullName? }
 *
 * MODE SIMPLE (sans vérification email) :
 *   - Crée le user
 *   - Marque emailVerifiedAt = now (= compte directement actif)
 *   - Crée la session JWT
 *   - L'user est connecté immédiatement, pas besoin de recevoir un mail
 *
 * La logique d'affiliation (cookie src_ref → referredBy) est conservée.
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
        WHATSAPP_REQUIRED: "Numéro WhatsApp requis",
      };
      return NextResponse.json(
        { error: messages[result.error] ?? "Inscription impossible" },
        { status: 400 }
      );
    }

    // Marque l'email comme vérifié immédiatement (mode simple sans mail)
    await prisma.user.update({
      where: { id: result.user.id },
      data: { emailVerifiedAt: new Date() },
    });

    // === Affiliation : lit le cookie src_ref si présent ===
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
          const ipHash = hashIp(getIpFromHeaders(req.headers));
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

    // Crée la session immédiatement → user connecté
    await createSession(result.user.id);

    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("[/api/auth/register]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
