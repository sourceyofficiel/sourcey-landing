import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TeamView } from "./TeamView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Équipe · Creator Agency" };

export default async function TeamPage() {
  await requireAdmin();
  const supabase = createClient();
  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("*, inviter:profiles!invited_by(id, full_name, email)")
      .gt("expires_at", new Date().toISOString())
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <TeamView
      initialMembers={members ?? []}
      initialInvitations={invitations ?? []}
    />
  );
}
