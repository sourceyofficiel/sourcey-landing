import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { register, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  REF_COOKIE_NAME,
  getIpFromHeaders,
  hashIp,
  isAffiliateActive,
} from "@/lib/affiliate";

/**
 * POST /api/auth/register
 * Body : { email, password, fullName? }
 * Crée un compte + session auto si OK.
 *
 * Affiliation : si le cookie src_ref est posé et que le code pointe vers un
 * affilié actif, on enregistre :
 *   - referredBy = code
 *   - referredByIpHash = hash SHA-256 de l'IP (anti-fraude self-referral)
 * Le champ referredBy est IMMUTABLE : il n'est jamais modifié après création.
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

    // === Affiliation : applique le cookie src_ref si présent + valide ===
    const refCode = cookies().get(REF_COOKIE_NAME)?.value;
    if (refCode) {
      try {
        const affiliate = await prisma.user.findUnique({
          where: { affiliateCode: refCode.toUpperCase() },
          select: { id: true },
        });
        // Vérifie que l'affilié existe ET est actif ET n'est pas le nouvel user
        // (pas de self-referral même si quelqu'un bricole les cookies).
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
        // L'inscription ne doit pas échouer si la résolution du parrainage casse.
        console.error("[register] referredBy lookup", e);
      }
    }

    await createSession(result.user.id);

    return NextResponse.json({ ok: true, user: result.user });
  } catch (e) {
    console.error("[/api/auth/register]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
