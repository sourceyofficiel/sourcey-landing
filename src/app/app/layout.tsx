import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/AppShell";
import { getCurrentUser } from "@/lib/auth-mock";

export const metadata = {
  title: "App · Sourcey",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      }}
    >
      {children}
    </AppShell>
  );
}
