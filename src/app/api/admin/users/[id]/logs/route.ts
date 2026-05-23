import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users/[id]/logs
 * Retourne les 50 derniers logs de connexion pour cet user.
 * IPs en hash uniquement (RGPD) — mais on peut afficher un short fingerprint
 * pour repérer rapidement les IPs récurrentes vs nouvelles.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const logs = await prisma.loginLog.findMany({
    where: { userId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      success: l.success,
      method: l.method,
      failureReason: l.failureReason,
      ipFingerprint: l.ipHash.slice(0, 10), // short version pour l'UI
      userAgent: l.userAgent,
      createdAt: l.createdAt,
    })),
  });
}
