import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createWorkspace } from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/workspace/create
 * Body: { name: string }
 *
 * Crée un workspace AutoSAV pour l'user connecté (role=owner) + trial 14 jours.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string };
  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json(
      { error: "Nom de workspace requis (2 caractères min)" },
      { status: 400 }
    );
  }

  try {
    const ws = await createWorkspace({
      name: body.name.trim(),
      userId: user.id,
    });
    return NextResponse.json({
      ok: true,
      workspace: { id: ws.id, slug: ws.slug, name: ws.name },
    });
  } catch (e) {
    console.error("[autosav.workspace.create]", e);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
