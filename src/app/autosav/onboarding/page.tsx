import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listUserWorkspaces } from "@/lib/autosav/workspace";
import { OnboardingClient } from "./OnboardingClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Onboarding · AutoSAV" };

/**
 * Page d'orientation après login/signup :
 *   - Si l'user n'est pas connecté → /login
 *   - Si l'user a déjà un workspace → redirige direct vers son dashboard
 *   - Sinon → affiche le flow de création (OnboardingClient)
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/autosav/onboarding");
  }

  const workspaces = await listUserWorkspaces(user.id);
  if (workspaces.length > 0) {
    // L'user a déjà un workspace → on l'envoie sur le plus récent
    const first = workspaces[0].workspace;
    redirect(`/autosav/w/${first.slug}`);
  }

  return <OnboardingClient />;
}
