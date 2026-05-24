/**
 * AutoSAV — helpers d'accès aux workspaces.
 *
 * Toutes les requêtes DB sur AutoSAV* doivent passer par getWorkspace() pour
 * vérifier que l'user appartient bien au workspace ciblé. Sinon throw 403.
 *
 * Pattern : multi-tenant strict. Aucune row AutoSAV* n'est exposée à un user
 * qui n'est pas membre du workspace correspondant.
 */

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "node:crypto";

/* ============================================================
   GÉNÉRATION DE SLUG
   ============================================================ */

/**
 * Génère un slug URL-safe à partir d'un nom de workspace.
 * "ACME Customer Support" → "acme-customer-support"
 * Si collision avec un slug existant, on append un suffixe random.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const slug = base || "workspace";

  // Check unicité, append random si collision
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? slug : `${slug}-${crypto.randomBytes(2).toString("hex")}`;
    const existing = await prisma.autosavWorkspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Impossible de générer un slug unique");
}

/* ============================================================
   ACCÈS AUTORISÉ AU WORKSPACE
   ============================================================ */

export type WorkspaceRole = "owner" | "admin" | "agent";

export interface WorkspaceContext {
  workspaceId: string;
  workspace: Awaited<ReturnType<typeof prisma.autosavWorkspace.findUnique>>;
  userId: string;
  role: WorkspaceRole;
}

/**
 * Récupère le workspace par slug ET vérifie que l'user connecté en est membre.
 * Throw une erreur typée si non autorisé. Le caller (route handler ou Server
 * Component) doit catch et retourner 403/redirect.
 */
export async function getWorkspaceBySlug(slug: string): Promise<WorkspaceContext> {
  const user = await getCurrentUser();
  if (!user) throw new WorkspaceAccessError("UNAUTHENTICATED");

  const workspace = await prisma.autosavWorkspace.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: user.id }, take: 1 },
    },
  });

  if (!workspace) throw new WorkspaceAccessError("NOT_FOUND");
  if (workspace.deletedAt) throw new WorkspaceAccessError("NOT_FOUND");
  if (workspace.members.length === 0)
    throw new WorkspaceAccessError("FORBIDDEN");

  return {
    workspaceId: workspace.id,
    workspace,
    userId: user.id,
    role: workspace.members[0].role as WorkspaceRole,
  };
}

/**
 * Liste tous les workspaces dont l'user est membre. Utile pour le switcher
 * et pour rediriger automatiquement après login.
 */
export async function listUserWorkspaces(userId: string) {
  return prisma.autosavWorkspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        select: {
          id: true,
          slug: true,
          name: true,
          plan: true,
          onboardingDone: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/* ============================================================
   CRÉATION WORKSPACE (au signup ou via onboarding)
   ============================================================ */

/**
 * Crée un workspace + le membership owner, en transaction.
 * Trial 14 jours posé automatiquement.
 */
export async function createWorkspace(input: {
  name: string;
  userId: string;
}) {
  const slug = await generateUniqueSlug(input.name);
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 3600 * 1000);

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.autosavWorkspace.create({
      data: {
        name: input.name,
        slug,
        plan: "trial",
        trialEndsAt,
        quotaLimit: 200, // quota trial
        members: {
          create: {
            userId: input.userId,
            role: "owner",
          },
        },
      },
    });

    await tx.autosavAuditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: input.userId,
        action: "workspace.create",
        target: workspace.id,
      },
    });

    return workspace;
  });
}

/* ============================================================
   ERREUR TYPÉE
   ============================================================ */

export class WorkspaceAccessError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "NOT_FOUND" | "FORBIDDEN") {
    super(code);
  }
}
