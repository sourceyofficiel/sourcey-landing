import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = [
  "shopify",
  "woocommerce",
  "gmail",
  "outlook",
  "ionos",
  "laposte",
] as const;

type IntegrationType = (typeof ALLOWED_TYPES)[number];

/**
 * GET /api/autosav/workspace/[slug]/integrations
 * Liste toutes les intégrations connectées (sans révéler la config chiffrée).
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ctx = await getWorkspaceBySlug(params.slug);

    const rows = await prisma.autosavIntegration.findMany({
      where: { workspaceId: ctx.workspaceId },
      select: {
        id: true,
        type: true,
        status: true,
        lastSyncAt: true,
        lastSyncError: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ integrations: rows });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.integrations.list]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * POST /api/autosav/workspace/[slug]/integrations
 * Body: { type, config }
 *
 * Crée ou met à jour une intégration. La config est sérialisée et stockée
 * dans `encryptedConfig` (en clair pour l'instant, à chiffrer avec @47ng/cloak
 * en phase 2 quand on aura la masterkey).
 *
 * Seuls owner et admin peuvent.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = (await req.json()) as {
      type?: string;
      config?: Record<string, unknown>;
    };
    if (!body.type || !ALLOWED_TYPES.includes(body.type as IntegrationType)) {
      return NextResponse.json(
        { error: `type invalide (${ALLOWED_TYPES.join(", ")})` },
        { status: 400 }
      );
    }
    if (!body.config || typeof body.config !== "object") {
      return NextResponse.json({ error: "config requise" }, { status: 400 });
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Pour l'instant, sérialise en JSON. @47ng/cloak viendra plus tard.
    const serialized = JSON.stringify(body.config);

    const integration = await prisma.autosavIntegration.upsert({
      where: {
        workspaceId_type: {
          workspaceId: ctx.workspaceId,
          type: body.type,
        },
      },
      update: {
        encryptedConfig: serialized,
        status: "connected",
        lastSyncError: null,
      },
      create: {
        workspaceId: ctx.workspaceId,
        type: body.type,
        encryptedConfig: serialized,
        status: "connected",
      },
      select: {
        id: true,
        type: true,
        status: true,
        lastSyncAt: true,
        lastSyncError: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, integration });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.integrations.save]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * DELETE /api/autosav/workspace/[slug]/integrations?type=…
 * Déconnecte une intégration.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    if (!type || !ALLOWED_TYPES.includes(type as IntegrationType)) {
      return NextResponse.json({ error: "type invalide" }, { status: 400 });
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.autosavIntegration.deleteMany({
      where: { workspaceId: ctx.workspaceId, type },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.integrations.delete]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
