import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WelcomeOnboarding } from "@/components/app-shell/WelcomeOnboarding";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bienvenue · Sourcey",
};

export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <WelcomeOnboarding
      firstName={user.fullName?.split(" ")[0] ?? user.email.split("@")[0]}
    />
  );
}
