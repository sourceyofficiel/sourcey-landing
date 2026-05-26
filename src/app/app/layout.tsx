import { requireUser } from "@/lib/auth";
import { AppShell } from "./AppShell";

export const dynamic = "force-dynamic";

/**
 * Layout protégé pour /app/* :
 *   - Vérifie l'auth (redirige /login sinon)
 *   - Charge le profil (rôle, full_name, avatar)
 *   - Rend le shell (sidebar + topbar)
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  return (
    <AppShell
      user={{
        email: user.email!,
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? "prospector",
      }}
    >
      {children}
    </AppShell>
  );
}
