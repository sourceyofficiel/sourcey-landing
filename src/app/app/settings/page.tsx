import { requireUser } from "@/lib/auth";
import { SettingsView } from "./SettingsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réglages · Creator Agency" };

export default async function SettingsPage() {
  const { user, profile } = await requireUser();
  return (
    <SettingsView
      email={user.email!}
      fullName={profile?.full_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      role={profile?.role ?? "prospector"}
      dailyTarget={profile?.daily_target ?? 50}
      userId={user.id}
    />
  );
}
