import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "./DashboardView";

export const metadata = { title: "Dashboard · Creator Agency" };
export const dynamic = "force-dynamic";

/**
 * Dashboard tarpin complet :
 *   - KPIs aujourd'hui / cette semaine / total
 *   - Analyseur rapide de profil TikTok (sans sauvegarder)
 *   - Leads récentes (10 dernières)
 *   - Répartition par taille (nano/micro/mid/macro/mega)
 *   - Top prospecteurs (admin only)
 *   - Activité récente
 */
export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const supabase = createClient();
  const isAdmin = profile?.role === "admin";

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  // Tous les counts en parallèle pour la perf
  const [
    { count: totalInfluencers },
    { count: leadsToday },
    { count: leadsWeek },
    { count: acceptedTotal },
    influencersAggRes,
    { data: recentLeads },
    { data: tierDistribution },
    { data: recentActivity },
    leaderboardRes,
  ] = await Promise.all([
    supabase.from("influencers").select("*", { count: "exact", head: true }),
    supabase
      .from("influencers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay.toISOString())
      .eq(
        isAdmin ? "global_status" : "created_by",
        isAdmin ? "accepted" : user.id
      ),
    supabase
      .from("influencers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfWeek.toISOString())
      .eq(
        isAdmin ? "global_status" : "created_by",
        isAdmin ? "accepted" : user.id
      ),
    supabase
      .from("influencers")
      .select("*", { count: "exact", head: true })
      .eq("global_status", "accepted"),
    // Agg : somme followers + somme pricing
    supabase
      .from("influencers")
      .select("followers_count, pricing_min_cents")
      .eq("global_status", "accepted"),
    // Leads récentes
    supabase
      .from("influencers")
      .select(
        "id, display_name, handle_tiktok, handle_instagram, avatar_url, followers_count, size_tier, global_status, created_at, created_by, profiles:profiles!created_by(full_name, email)"
      )
      .order("created_at", { ascending: false })
      .limit(10),
    // Distribution par tier
    supabase
      .from("influencers")
      .select("size_tier")
      .eq("global_status", "accepted"),
    // Activité récente
    supabase
      .from("activity_log")
      .select(
        "id, action, target_id, metadata, created_at, user_id, profiles:profiles!user_id(full_name, email)"
      )
      .order("created_at", { ascending: false })
      .limit(15),
    // Leaderboard du jour (admin only mais on fetch quand même)
    supabase
      .from("activity_log")
      .select("user_id, profiles:profiles!user_id(full_name, email)")
      .eq("action", "prospection.accept")
      .gte("created_at", startOfDay.toISOString()),
  ]);

  // Agrège manuellement (Supabase ne fait pas SUM nativement via le client JS pour les rows non-aggregated)
  const aggRows = (influencersAggRes.data ?? []) as Array<{
    followers_count: number;
    pricing_min_cents: number | null;
  }>;
  const totalFollowers = aggRows.reduce(
    (s, r) => s + (r.followers_count ?? 0),
    0
  );
  const totalBudgetCents = aggRows.reduce(
    (s, r) => s + (r.pricing_min_cents ?? 0),
    0
  );

  // Tier distribution
  const tierCounts: Record<string, number> = {
    nano: 0,
    micro: 0,
    mid: 0,
    macro: 0,
    mega: 0,
  };
  for (const row of (tierDistribution ?? []) as Array<{ size_tier: string }>) {
    if (row.size_tier in tierCounts) tierCounts[row.size_tier]++;
  }

  // Top prospecteurs du jour
  const topToday = new Map<
    string,
    { userId: string; name: string; count: number }
  >();
  type LeaderboardRow = {
    user_id: string;
    profiles: { full_name: string | null; email: string } | null;
  };
  for (const row of ((leaderboardRes.data ?? []) as unknown as LeaderboardRow[])) {
    if (!row.user_id) continue;
    const name = row.profiles?.full_name ?? row.profiles?.email ?? "—";
    const existing = topToday.get(row.user_id);
    if (existing) existing.count++;
    else topToday.set(row.user_id, { userId: row.user_id, name, count: 1 });
  }
  const topProspectors = Array.from(topToday.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Supabase renvoie les FK joins comme array — on prend le premier élément
  // pour matcher l'interface du DashboardView.
  type WithProfileArray = {
    profiles: { full_name: string | null; email: string }[] | null;
  };
  function flattenProfile<T extends WithProfileArray>(
    row: T
  ): Omit<T, "profiles"> & {
    profiles: { full_name: string | null; email: string } | null;
  } {
    const p = row.profiles;
    return { ...row, profiles: Array.isArray(p) ? (p[0] ?? null) : p };
  }
  const flatLeads = (recentLeads ?? []).map((l) =>
    flattenProfile(l as unknown as WithProfileArray)
  ) as unknown as DashboardLead[];
  const flatActivity = (recentActivity ?? []).map((a) =>
    flattenProfile(a as unknown as WithProfileArray)
  ) as unknown as DashboardActivity[];

  return (
    <DashboardView
      user={{
        firstName: profile?.full_name?.split(" ")[0] ?? null,
        role: profile?.role ?? "prospector",
      }}
      kpis={{
        totalInfluencers: totalInfluencers ?? 0,
        leadsToday: leadsToday ?? 0,
        leadsWeek: leadsWeek ?? 0,
        acceptedTotal: acceptedTotal ?? 0,
        totalFollowers,
        totalBudgetCents,
      }}
      recentLeads={flatLeads}
      tierCounts={tierCounts}
      recentActivity={flatActivity}
      topProspectors={topProspectors}
      isAdmin={isAdmin}
    />
  );
}

// Types réutilisables
export interface DashboardLead {
  id: string;
  display_name: string;
  handle_tiktok: string | null;
  handle_instagram: string | null;
  avatar_url: string | null;
  followers_count: number;
  size_tier: string;
  global_status: string;
  created_at: string;
  created_by: string | null;
  profiles: { full_name: string | null; email: string } | null;
}

export interface DashboardActivity {
  id: string;
  action: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
  profiles: { full_name: string | null; email: string } | null;
}
