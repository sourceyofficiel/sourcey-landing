import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { normalizePlanSlug } from "@/lib/plans";
import { DashboardShell } from "./DashboardShell";

export const dynamic = "force-dynamic";

/**
 * Layout partagé pour /autosav/w/[slug]/* :
 *   - Vérifie l'appartenance au workspace (server-side)
 *   - Récupère workspace + user
 *   - Rend le shell (sidebar + topbar) qui wrap chaque page enfant
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  let ctx;
  try {
    ctx = await getWorkspaceBySlug(params.slug);
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      if (e.code === "UNAUTHENTICATED")
        redirect(`/login?next=/autosav/w/${params.slug}`);
      redirect("/autosav");
    }
    throw e;
  }
  const ws = ctx.workspace!;
  const planSlug = normalizePlanSlug(ws.plan);
  const trialDaysLeft = ws.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((ws.trialEndsAt.getTime() - Date.now()) / (24 * 3600 * 1000))
      )
    : 0;

  return (
    <DashboardShell
      workspace={{
        slug: ws.slug,
        name: ws.name,
        plan: planSlug,
        ticketsUsed: ws.ticketsUsedThisMonth,
        quotaLimit: ws.quotaLimit,
        trialDaysLeft,
        onboardingDone: ws.onboardingDone,
      }}
      role={ctx.role}
    >
      {children}
    </DashboardShell>
  );
}
