import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendEmailVerification } from "@/lib/auth-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[id]/actions
 * Body: { action: 'unlock' | 'disable' | 'enable' | 'resend_verification' }
 *
 * Actions admin sur un user. Logguées dans LoginLog avec method='admin' pour audit.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = (await req.json()) as { action?: string };
  const action = body.action;

  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      emailVerifiedAt: true,
      disabledAt: true,
      lockedUntil: true,
    },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User introuvable" }, { status: 404 });
  }

  switch (action) {
    case "unlock":
      // Reset les tentatives + lockedUntil
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
      // Nettoie aussi le blocage IP éventuel lié à ce user
      // (le block IP est par hash, on ne peut pas le retrouver sans l'IP brute)
      return NextResponse.json({ ok: true, message: "Compte débloqué" });

    case "disable":
      if (targetUser.id === admin.id) {
        return NextResponse.json(
          { error: "Tu ne peux pas désactiver ton propre compte." },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { disabledAt: new Date() },
      });
      return NextResponse.json({ ok: true, message: "Compte désactivé" });

    case "enable":
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { disabledAt: null },
      });
      return NextResponse.json({ ok: true, message: "Compte réactivé" });

    case "resend_verification": {
      if (targetUser.emailVerifiedAt) {
        return NextResponse.json(
          { error: "Email déjà vérifié." },
          { status: 400 }
        );
      }
      const { plainToken } = await createAuthToken({
        userId: targetUser.id,
        type: "email_verify",
      });
      await sendEmailVerification({
        to: targetUser.email,
        fullName: targetUser.fullName,
        token: plainToken,
      });
      return NextResponse.json({
        ok: true,
        message: "Email de vérification renvoyé",
      });
    }

    default:
      return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }
}
