"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Sparkles,
  Settings,
  CreditCard,
  Users,
  ChevronDown,
  Search,
  Bell,
  Mail,
  Truck,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Plug,
  LifeBuoy,
  LogOut,
  Star,
  Filter,
} from "lucide-react";

interface WorkspaceData {
  slug: string;
  name: string;
  plan: string;
  ticketsUsed: number;
  quotaLimit: number;
  trialDaysLeft: number;
  onboardingDone: boolean;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Trial",
  essential: "Starter",
  pro: "Pro",
  premium: "Agency",
};

/**
 * DashboardShell — sidebar + topbar partagés sur toutes les pages du workspace.
 * Layout fixed sidebar 240px (left) + main content scrollable.
 * Mobile : drawer (à implémenter en phase 2, pour l'instant masqué <md).
 */
export function DashboardShell({
  workspace,
  role,
  children,
}: {
  workspace: WorkspaceData;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/autosav/w/${workspace.slug}`;
  const quotaPct = Math.min(
    100,
    Math.round((workspace.ticketsUsed / Math.max(1, workspace.quotaLimit)) * 100)
  );

  // Catégories d'inbox (mock counts — à brancher sur DB en phase 2)
  const inboxFolders = [
    { href: base, label: "À traiter", icon: Inbox, count: 12, badge: "primary" },
    { href: `${base}/drafts`, label: "Drafts IA", icon: Sparkles, count: 8, badge: "ai" },
    { href: `${base}/waiting`, label: "En attente", icon: Clock, count: 3 },
    { href: `${base}/sent`, label: "Envoyés", icon: CheckCircle2, count: 47 },
    { href: `${base}/resolved`, label: "Résolus", icon: CheckCircle2, count: 124 },
    { href: `${base}/spam`, label: "Spam", icon: Trash2, count: 2 },
  ];

  const tags = [
    { label: "Suivi colis", color: "emerald", count: 8, icon: Truck },
    { label: "Retour produit", color: "amber", count: 3, icon: RotateCw },
    { label: "Réclamation", color: "rose", count: 1, icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/50">
      {/* === SIDEBAR === */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-neutral-200/70 bg-white md:flex">
        {/* Workspace switcher */}
        <button className="flex items-center justify-between border-b border-neutral-200/70 px-4 py-3.5 hover:bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-amber-200">
              <Mail className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-[13px] font-bold leading-tight text-neutral-900">
                {workspace.name}
              </div>
              <div className="text-[11px] leading-tight text-neutral-500">
                Plan {PLAN_LABEL[workspace.plan] ?? "Trial"}
                {workspace.trialDaysLeft > 0 && workspace.plan === "free" && (
                  <span> · {workspace.trialDaysLeft}j</span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </button>

        {/* Search */}
        <div className="border-b border-neutral-200/70 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100/70 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="flex-1 bg-transparent text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
            />
            <kbd className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Inbox folders */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="px-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
            Inbox
          </div>
          <div className="mt-1 space-y-0.5">
            {inboxFolders.map((f) => {
              const Icon = f.icon;
              const active = pathname === f.href;
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "bg-emerald-100/60 font-bold text-emerald-900"
                      : "text-neutral-600 hover:bg-neutral-100/60"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        f.badge === "ai" ? "text-emerald-600" : ""
                      }`}
                    />
                    {f.label}
                  </span>
                  <span
                    className={`rounded-md px-1.5 text-[10.5px] font-bold ${
                      active
                        ? "bg-emerald-800 text-amber-200"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {f.count}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Tags */}
          <div className="mt-6 px-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
            Tags
          </div>
          <div className="mt-1 space-y-0.5">
            {tags.map((t) => {
              const Icon = t.icon;
              const colors = {
                emerald: "text-emerald-600",
                amber: "text-amber-600",
                rose: "text-rose-600",
              }[t.color];
              return (
                <button
                  key={t.label}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100/60"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`h-3.5 w-3.5 ${colors}`} />
                    {t.label}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quota card */}
          <div className="mt-6 rounded-xl border border-neutral-200/70 bg-amber-50/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                Quota IA
              </span>
              <span className="font-display text-[11.5px] font-bold text-emerald-900">
                {quotaPct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
              <div
                className={`h-full rounded-full transition-all ${
                  quotaPct > 80 ? "bg-amber-500" : "bg-emerald-700"
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-[14px] font-extrabold text-emerald-900">
                {workspace.ticketsUsed}
              </span>
              <span className="text-[10.5px] text-neutral-500">
                / {workspace.quotaLimit} tickets
              </span>
            </div>
          </div>
        </nav>

        {/* Bottom nav */}
        <div className="border-t border-neutral-200/70 p-3">
          {[
            { href: `${base}/playground`, label: "Playground IA", icon: Sparkles },
            { href: `${base}/settings`, label: "Réglages", icon: Settings },
            { href: `${base}/billing`, label: "Facturation", icon: CreditCard },
            { href: `${base}/team`, label: "Équipe", icon: Users },
            { href: `${base}/integrations`, label: "Intégrations", icon: Plug },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors ${
                  active
                    ? "bg-emerald-100/60 font-bold text-emerald-900"
                    : "text-neutral-600 hover:bg-neutral-100/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200/70 bg-white px-5">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[15px] font-bold tracking-tight text-neutral-900">
              {pathnameToTitle(pathname, base)}
            </h1>
            {pathname === base && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200/50">
                12 nouveaux
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
              <LifeBuoy className="h-4 w-4" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            <div className="ml-2 h-6 w-px bg-neutral-200" />
            <UserMenu />
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   USER MENU
   ============================================================ */

function UserMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg pl-1.5 pr-2 hover:bg-neutral-100"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-[11px] font-bold text-white">
          M
        </div>
        <ChevronDown className="h-3 w-3 text-neutral-400" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]">
            <div className="border-b border-neutral-100 px-3 py-3">
              <div className="text-[13px] font-bold text-neutral-900">Toi</div>
              <div className="text-[11px] text-neutral-500">connecté</div>
            </div>
            <div className="py-1">
              <button className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 hover:bg-neutral-100">
                <Settings className="h-3.5 w-3.5" />
                Profil
              </button>
              <Link
                href="/api/auth/logout"
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 hover:bg-neutral-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function pathnameToTitle(pathname: string, base: string): string {
  if (pathname === base) return "Boîte de réception";
  if (pathname.endsWith("/playground")) return "Playground IA";
  if (pathname.endsWith("/settings")) return "Réglages";
  if (pathname.endsWith("/billing")) return "Facturation";
  if (pathname.endsWith("/team")) return "Équipe";
  if (pathname.endsWith("/integrations")) return "Intégrations";
  if (pathname.endsWith("/drafts")) return "Drafts IA";
  if (pathname.endsWith("/waiting")) return "En attente";
  if (pathname.endsWith("/sent")) return "Envoyés";
  if (pathname.endsWith("/resolved")) return "Résolus";
  if (pathname.endsWith("/spam")) return "Spam";
  return "AutoSAV";
}
