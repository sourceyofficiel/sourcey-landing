import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  KanbanSquare,
  Megaphone,
  Trophy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard · Creator Agency" };

/**
 * Dashboard d'accueil. Compteurs simples sur les données de l'user
 * (sécurisé via RLS — le prospecteur ne voit que ses prospections, l'admin
 * voit tout).
 */
export default async function DashboardPage() {
  const { profile } = await requireUser();
  const supabase = createClient();

  const [
    { count: totalInfluencers },
    { count: myActiveProspections },
    { count: activeCampaigns },
  ] = await Promise.all([
    supabase.from("influencers").select("*", { count: "exact", head: true }),
    supabase
      .from("prospections")
      .select("*", { count: "exact", head: true })
      .in("status", ["to_contact", "contacted", "awaiting_reply", "negotiating"]),
    supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Bonsoir";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
      {/* Greeting */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
          Bienvenue
        </div>
        <h2 className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-white">
          {greeting}
          {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-1 max-w-xl text-[13.5px] text-neutral-400">
          {profile?.role === "admin"
            ? "Voici une vue d'ensemble de toutes les opérations."
            : "Voici un récap de tes prospections en cours."}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Influenceurs en base"
          value={totalInfluencers ?? 0}
          icon={Users}
          href="/app/influencers"
        />
        <StatCard
          label={
            profile?.role === "admin"
              ? "Prospections actives"
              : "Mes prospections actives"
          }
          value={myActiveProspections ?? 0}
          icon={KanbanSquare}
          href="/app/pipeline"
        />
        <StatCard
          label="Campagnes en cours"
          value={activeCampaigns ?? 0}
          icon={Megaphone}
          href="/app/campaigns"
        />
        <StatCard
          label="Classement"
          value={"📊"}
          icon={Trophy}
          href="/app/leaderboard"
        />
      </div>

      {/* Onboarding empty state */}
      {(totalInfluencers ?? 0) === 0 && (
        <div className="mt-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-[15px] font-bold text-white">
                Premiers pas
              </h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-400">
                Commence par ajouter un influenceur. Colle son URL TikTok ou
                Instagram, l&apos;IA analysera son profil et te dira s&apos;il vaut le
                coup de le contacter pour tes marques.
              </p>
              <Link
                href="/app/influencers/new"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[12.5px] font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:brightness-110"
              >
                Ajouter un influenceur
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 transition-all hover:border-violet-500/40 hover:bg-neutral-900"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-violet-400" />
        <ArrowRight className="h-3.5 w-3.5 text-neutral-700 transition-all group-hover:translate-x-0.5 group-hover:text-violet-400" />
      </div>
      <div className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-neutral-400">{label}</div>
    </Link>
  );
}
