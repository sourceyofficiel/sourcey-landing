import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Ticket,
  Inbox,
  Settings,
  CreditCard,
  Users,
  Sparkles,
  Plus,
  TrendingUp,
} from "lucide-react";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "AutoSAV · Dashboard" };

/**
 * Dashboard principal d'un workspace AutoSAV.
 *
 * Pour le MVP test : affiche les métriques de base + un sandbox pour tester
 * la génération de draft IA (page /autosav/w/[slug]/playground).
 */
export default async function AutosavDashboard({
  params,
}: {
  params: { slug: string };
}) {
  let ctx;
  try {
    ctx = await getWorkspaceBySlug(params.slug);
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      if (e.code === "UNAUTHENTICATED") redirect("/login?next=/autosav");
      redirect("/autosav");
    }
    throw e;
  }

  const ws = ctx.workspace!;
  const trialDaysLeft = ws.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((ws.trialEndsAt.getTime() - Date.now()) / (24 * 3600 * 1000))
      )
    : 0;
  const quotaPct = Math.min(
    100,
    Math.round((ws.ticketsUsedThisMonth / Math.max(1, ws.quotaLimit)) * 100)
  );

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between px-5 md:px-8">
          <Link href={`/autosav/w/${ws.slug}`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-[16px] font-extrabold tracking-tight">
              {ws.name}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {ws.plan === "trial" ? `Trial · ${trialDaysLeft}j` : ws.plan}
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            <NavLink href={`/autosav/w/${ws.slug}`} icon={Ticket} active>
              Tableau de bord
            </NavLink>
            <NavLink href={`/autosav/w/${ws.slug}/playground`} icon={Sparkles}>
              Playground IA
            </NavLink>
            <NavLink href={`/autosav/w/${ws.slug}/settings`} icon={Settings}>
              Réglages
            </NavLink>
            <NavLink href={`/autosav/w/${ws.slug}/billing`} icon={CreditCard}>
              Facturation
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1300px] px-5 py-8 md:px-8 md:py-10">
        {/* Greeting */}
        <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight">
          Bienvenue sur AutoSAV.
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          C&apos;est ici que tu gères ton SAV automatisé. Commence par tester
          le Playground IA pour voir l&apos;outil en action.
        </p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard
            icon={Inbox}
            label="Tickets ouverts"
            value="0"
            tone="neutral"
          />
          <StatCard
            icon={Ticket}
            label="Quota utilisé"
            value={`${ws.ticketsUsedThisMonth} / ${ws.quotaLimit}`}
            subValue={`${quotaPct}% du quota mensuel`}
            tone={quotaPct > 80 ? "warning" : "primary"}
          />
          <StatCard
            icon={TrendingUp}
            label="Drafts générés"
            value="0"
            subValue="Toutes équipes confondues"
            tone="neutral"
          />
          <StatCard
            icon={Users}
            label="Membres"
            value="1"
            subValue={`Toi · ${ctx.role}`}
            tone="neutral"
          />
        </div>

        {/* CTA Playground */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-[24px] font-extrabold tracking-tight md:text-[28px]">
                Teste l&apos;IA en 30 secondes.
              </h2>
              <p className="mt-2 max-w-[460px] text-[14px] text-white/80">
                Colle un email client (ou utilise notre exemple) et regarde
                comment AutoSAV rédige la réponse avec ton contexte de marque.
              </p>
            </div>
            <Link
              href={`/autosav/w/${ws.slug}/playground`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[13.5px] font-bold text-indigo-700 hover:bg-neutral-100"
            >
              <Sparkles className="h-4 w-4" />
              Ouvrir le Playground
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={Inbox}
            title="Connecter ma boîte mail"
            desc="Gmail, Outlook ou IMAP"
            href={`/autosav/w/${ws.slug}/settings`}
          />
          <ActionCard
            icon={Settings}
            title="Configurer le ton de marque"
            desc="Ajuste la signature et le style"
            href={`/autosav/w/${ws.slug}/settings`}
          />
          <ActionCard
            icon={Plus}
            title="Inviter mon équipe"
            desc="Multi-utilisateurs sur Pro/Agency"
            href={`/autosav/w/${ws.slug}/settings`}
          />
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function NavLink({
  href,
  icon: Icon,
  active,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  tone: "primary" | "warning" | "neutral";
}) {
  const colors = {
    primary: "bg-indigo-50 text-indigo-600",
    warning: "bg-amber-50 text-amber-600",
    neutral: "bg-neutral-100 text-neutral-600",
  }[tone];
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${colors}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 font-display text-[22px] font-extrabold leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[12.5px] text-neutral-500">{label}</div>
      {subValue && (
        <div className="mt-0.5 text-[11.5px] text-neutral-400">{subValue}</div>
      )}
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[14px] font-bold text-neutral-900">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-neutral-500">{desc}</div>
      </div>
    </Link>
  );
}
