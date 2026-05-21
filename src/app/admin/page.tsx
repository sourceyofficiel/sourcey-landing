import Link from "next/link";
import {
  Users,
  ClipboardList,
  MessagesSquare,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalUsers,
    usersLast7d,
    totalBriefs,
    briefsNew,
    briefsInProgress,
    totalConversations,
    unreadConversations,
    paidUsers,
    recentBriefs,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: daysAgo(7) } },
    }),
    prisma.brief.count(),
    prisma.brief.count({ where: { status: "new" } }),
    prisma.brief.count({
      where: {
        status: { in: ["in-review", "supplier-contacted", "quote-ready"] },
      },
    }),
    prisma.conversation.count(),
    prisma.conversation.count({
      where: { unreadByCounterpart: { gt: 0 } },
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: { in: ["active", "trialing"] },
      },
    }),
    prisma.brief.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { email: true, fullName: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        fullName: true,
        plan: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <header className="mb-8">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
          Vue d'ensemble
        </div>
        <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[32px]">
          Dashboard
        </h1>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={totalUsers}
          subValue={`+${usersLast7d} cette semaine`}
          href="/admin/users"
          accent="blue"
        />
        <StatCard
          icon={ClipboardList}
          label="Briefs nouveaux"
          value={briefsNew}
          subValue={`${totalBriefs} au total`}
          href="/admin/briefs?status=new"
          accent={briefsNew > 0 ? "amber" : "neutral"}
          urgent={briefsNew > 0}
        />
        <StatCard
          icon={Clock}
          label="Briefs en cours"
          value={briefsInProgress}
          subValue="à suivre"
          href="/admin/briefs?status=in-progress"
          accent="blue"
        />
        <StatCard
          icon={MessagesSquare}
          label="Messages non lus"
          value={unreadConversations}
          subValue={`${totalConversations} conversations`}
          href="/admin/conversations"
          accent={unreadConversations > 0 ? "rose" : "neutral"}
          urgent={unreadConversations > 0}
        />
      </div>

      {/* Subscriber metric */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] text-neutral-500">
              Abonnés payants
            </div>
            <div className="font-display text-[22px] font-extrabold text-neutral-900">
              {paidUsers}{" "}
              <span className="text-[13px] font-medium text-neutral-500">
                / {totalUsers} utilisateurs
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-neutral-500">Taux conversion</div>
            <div className="font-display text-[18px] font-bold text-neutral-900">
              {totalUsers > 0
                ? `${((paidUsers / totalUsers) * 100).toFixed(1)}%`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: recent briefs + recent users */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Recent briefs */}
        <section className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <h2 className="text-[14px] font-bold text-neutral-900">
              Briefs récents
            </h2>
            <Link
              href="/admin/briefs"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-700 hover:text-primary-800"
            >
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentBriefs.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-neutral-500">
              Aucun brief pour l'instant.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentBriefs.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/briefs/${b.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-neutral-900">
                        {b.productName}
                      </div>
                      <div className="truncate text-[11.5px] text-neutral-500">
                        {b.user.fullName ?? b.user.email} · {b.targetQuantity}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent users */}
        <section className="rounded-2xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <h2 className="text-[14px] font-bold text-neutral-900">
              Nouveaux utilisateurs
            </h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-700 hover:text-primary-800"
            >
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-neutral-500">
              Aucun utilisateur.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentUsers.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[12px] font-bold text-white">
                      {(u.fullName ?? u.email)[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-neutral-900">
                        {u.fullName ?? "—"}
                      </div>
                      <div className="truncate text-[11.5px] text-neutral-500">
                        {u.email}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                        u.plan === "free"
                          ? "bg-neutral-100 text-neutral-600"
                          : "bg-primary-100 text-primary-700"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: I,
  label,
  value,
  subValue,
  href,
  accent,
  urgent = false,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  subValue: string;
  href: string;
  accent: "blue" | "amber" | "rose" | "neutral";
  urgent?: boolean;
}) {
  const colors = {
    blue: "bg-primary-50 text-primary-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    neutral: "bg-neutral-100 text-neutral-600",
  };
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]"
    >
      {urgent && (
        <span className="absolute right-3 top-3 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[accent]}`}
      >
        <I className="h-4 w-4" />
      </span>
      <div className="mt-3 text-[11.5px] uppercase tracking-wider text-neutral-400">
        {label}
      </div>
      <div className="mt-1 font-display text-[26px] font-extrabold leading-none text-neutral-900">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-neutral-500">{subValue}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "Nouveau", cls: "bg-amber-100 text-amber-800" },
    "in-review": { label: "En revue", cls: "bg-blue-100 text-blue-800" },
    "supplier-contacted": {
      label: "Fournisseur",
      cls: "bg-purple-100 text-purple-800",
    },
    "quote-ready": {
      label: "Devis prêt",
      cls: "bg-green-100 text-green-800",
    },
    ordered: { label: "Commandé", cls: "bg-emerald-100 text-emerald-800" },
    completed: { label: "Terminé", cls: "bg-neutral-100 text-neutral-700" },
    cancelled: { label: "Annulé", cls: "bg-rose-100 text-rose-700" },
  };
  const m = map[status] ?? {
    label: status,
    cls: "bg-neutral-100 text-neutral-700",
  };
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function daysAgo(d: number) {
  const now = new Date();
  now.setDate(now.getDate() - d);
  return now;
}
