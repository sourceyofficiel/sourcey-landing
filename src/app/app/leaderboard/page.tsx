import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Target, TrendingUp } from "lucide-react";
import {
  getAvatarGradient,
  getInitials,
  formatPercent,
} from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Classement · Creator Agency" };

interface Row {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  contacted_count: number;
  accepted_count: number;
  conversion_rate: number;
}

export default async function LeaderboardPage() {
  await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("leaderboard_30d")
    .select("*")
    .order("contacted_count", { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
        <Trophy className="h-3.5 w-3.5" />
        Classement · 30 derniers jours
      </div>
      <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
        Performance prospecteurs
      </h1>
      <p className="mt-1 max-w-xl text-[13px] text-neutral-500">
        Calculé sur les actions journalisées : prospection.contact pour les
        contacts initiés, prospection.accept pour les deals signés.
      </p>

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
            <Trophy className="mx-auto h-7 w-7 text-neutral-500" />
            <p className="mt-3 text-[13px] text-neutral-500">
              Pas encore d&apos;activité. Le classement se construit dès
              que les prospecteurs commencent à contacter.
            </p>
          </div>
        ) : (
          rows.map((r, idx) => <LeaderRow key={r.id} row={r} rank={idx + 1} />)
        )}
      </div>
    </div>
  );
}

function LeaderRow({ row, rank }: { row: Row; rank: number }) {
  const gradient = getAvatarGradient(row.id);
  const initials = getInitials(row.full_name, row.id);
  const rankMeta = {
    1: { emoji: "🥇", color: "from-amber-500/30 to-amber-600/10" },
    2: { emoji: "🥈", color: "from-neutral-500/30 to-neutral-600/10" },
    3: { emoji: "🥉", color: "from-orange-600/30 to-orange-700/10" },
  }[rank as 1 | 2 | 3];

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 ${
        rankMeta
          ? `bg-gradient-to-r ${rankMeta.color}`
          : "bg-white"
      } p-4`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center font-display text-[18px] font-extrabold text-neutral-900">
        {rankMeta?.emoji ?? `#${rank}`}
      </div>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[13px] font-bold text-white`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-bold text-neutral-900">
          {row.full_name ?? "—"}
        </div>
        <div className="mt-0.5 text-[11.5px] text-neutral-500">
          {row.contacted_count} contact{row.contacted_count > 1 ? "s" : ""} ·{" "}
          {row.accepted_count} accept{row.accepted_count > 1 ? "és" : "é"}
        </div>
      </div>
      <div className="flex shrink-0 gap-3 text-right">
        <KPI
          icon={Target}
          label="Contactés"
          value={String(row.contacted_count)}
        />
        <KPI
          icon={TrendingUp}
          label="Conv."
          value={formatPercent(Number(row.conversion_rate), 0)}
        />
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-neutral-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 font-display text-[18px] font-extrabold text-neutral-900">
        {value}
      </div>
    </div>
  );
}
