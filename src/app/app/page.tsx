import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Package,
  ArrowRight,
  Sparkles,
  Headphones,
  User as UserIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format-time";

export const metadata = {
  title: "Tableau de bord · Sourcey",
};

export default async function AppDashboardPage() {
  const userId = await getCurrentUserId();
  const user = (await prisma.user.findUnique({ where: { id: userId } }))!;

  const conversations = await prisma.conversation.findMany({
    where: { userId, archivedAt: null },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unreadByUser, 0);
  const activeConversations = conversations.filter(
    (c) => c.type === "agent"
  ).length;
  const planLabel =
    user.plan === "free"
      ? "Gratuit"
      : user.plan === "starter"
        ? "Starter"
        : user.plan === "pro"
          ? "Pro"
          : user.plan;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {greeting()} 👋
          </p>
          <h1 className="mt-1 font-display text-[clamp(24px,3.2vw,36px)] font-extrabold leading-tight tracking-tight text-neutral-900">
            {user.fullName ?? user.email.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Voici un aperçu de ton activité sur Sourcey.
          </p>
        </div>
        <Link
          href="/app/inbox"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "0 8px 20px -4px rgba(37,99,235,0.45)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          <Sparkles className="h-4 w-4" />
          Démarrer un sourcing
        </Link>
      </div>

      {/* Stat cards — simplified to 3 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={MessageCircle}
          label="Messages non lus"
          value={totalUnread.toString()}
          href="/app/inbox"
          color="bg-primary-50 text-primary-700"
        />
        <StatCard
          icon={Package}
          label="Sourcings actifs"
          value={activeConversations.toString()}
          href="/app/orders"
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={UserIcon}
          label="Plan"
          value={planLabel}
          href="/app/profile"
          color="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Recent conversations */}
      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-bold text-neutral-900">
            Conversations récentes
          </h2>
          <Link
            href="/app/inbox"
            className="text-xs font-semibold text-primary-700 hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        {conversations.length === 0 ? (
          <EmptyMini
            icon={MessageCircle}
            title="Pas encore de conversation"
            cta={{ href: "/app/inbox", label: "Voir mon inbox" }}
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href="/app/inbox"
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                >
                  {c.type === "support" ? (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                      <Headphones className="h-4 w-4" />
                    </div>
                  ) : c.agentAvatarUrl ? (
                    <Image
                      src={c.agentAvatarUrl}
                      alt={c.agentName ?? ""}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[13.5px] font-bold text-neutral-900">
                        {c.type === "support" ? "Support Sourcey" : c.agentName}
                      </p>
                      <span className="shrink-0 text-[10.5px] text-neutral-500">
                        {formatRelative(c.lastMessageAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[12.5px] text-neutral-500">
                      {c.lastMessagePreview ?? "—"}
                    </p>
                  </div>
                  {c.unreadByUser > 0 && (
                    <span className="mt-2 grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                      {c.unreadByUser}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          Actions rapides
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/app/inbox"
            icon={MessageCircle}
            title="Messagerie"
            sub="Discute avec ton agent en français"
            color="bg-primary-50 hover:bg-primary-100 text-primary-700"
          />
          <QuickAction
            href="/app/orders"
            icon={Package}
            title="Mes commandes"
            sub="Suivi en temps réel"
            color="bg-amber-50 hover:bg-amber-100 text-amber-700"
          />
          <QuickAction
            href="/app/profile"
            icon={UserIcon}
            title="Mon profil"
            sub="Plan & paramètres"
            color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-0.5 text-[11.5px] text-neutral-500">{label}</p>
      <ArrowRight className="absolute right-3 top-3 h-3 w-3 text-neutral-300 transition-all group-hover:right-2 group-hover:text-neutral-500" />
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  sub,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors",
        color
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-[13px] font-bold text-neutral-900">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-neutral-600">{sub}</p>
      </div>
    </Link>
  );
}

function EmptyMini({
  icon: Icon,
  title,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="grid place-items-center px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-neutral-300" />
      <p className="mt-3 text-[13px] font-semibold text-neutral-700">{title}</p>
      <Link
        href={cta.href}
        className="mt-2 text-xs font-semibold text-primary-700 hover:underline"
      >
        {cta.label} →
      </Link>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Bonsoir";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}
