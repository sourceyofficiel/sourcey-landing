"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Megaphone,
  Building2,
  FileText,
  Trophy,
  UserCog,
  Settings,
  Sparkles,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppUser {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "admin" | "prospector";
}

/**
 * Shell global de /app : sidebar 240px + topbar 56px.
 * Mobile : drawer.
 */
export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = user.role === "admin";

  const navMain = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/influencers", label: "Influenceurs", icon: Users },
    { href: "/app/pipeline", label: "Pipeline", icon: KanbanSquare },
  ];

  const navAdmin = [
    { href: "/app/team", label: "Équipe", icon: UserCog },
  ];

  const navBottom = [
    { href: "/app/settings", label: "Réglages", icon: Settings },
  ];

  const initials = (user.fullName ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900">
      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* === SIDEBAR === */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 transition-transform duration-200 ease-out md:static md:z-auto md:w-[240px] md:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-neutral-900" />
            </div>
            <div className="font-display text-[14px] font-bold tracking-tight">
              Creator Agency
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-white hover:text-neutral-800 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="px-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
            Espace
          </div>
          <ul className="mt-1 space-y-0.5">
            {navMain.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </ul>

          {isAdmin && (
            <>
              <div className="mt-6 px-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Administration
              </div>
              <ul className="mt-1 space-y-0.5">
                {navAdmin.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                    }
                  />
                ))}
              </ul>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-neutral-200 p-3">
          <ul className="space-y-0.5">
            {navBottom.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
              />
            ))}
          </ul>
        </div>
      </aside>

      {/* === MAIN === */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-900 md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="font-display text-[14.5px] font-bold tracking-tight">
              {pageTitle(pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-900">
              <Bell className="h-4 w-4" />
            </button>
            <div className="ml-1 h-6 w-px bg-neutral-100" />
            <UserMenu user={user} initials={initials} />
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
          active
            ? "bg-violet-50 font-bold text-violet-700 ring-1 ring-inset ring-violet-200"
            : "text-neutral-500 hover:bg-white hover:text-neutral-900"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Link>
    </li>
  );
}

function UserMenu({
  user,
  initials,
}: {
  user: AppUser;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 hover:bg-white"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white">
          {initials}
        </div>
        <ChevronDown className="h-3 w-3 text-neutral-500" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-20 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
            <div className="border-b border-neutral-200 px-3 py-3">
              <div className="truncate text-[13px] font-bold text-neutral-900">
                {user.fullName ?? user.email}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-neutral-500">
                {user.email}
              </div>
              <div className="mt-2 inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-inset ring-violet-200">
                {user.role}
              </div>
            </div>
            <form action="/auth/sign-out" method="post" className="py-1">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function pageTitle(pathname: string): string {
  if (pathname === "/app") return "Dashboard";
  if (pathname.startsWith("/app/influencers")) return "Influenceurs";
  if (pathname.startsWith("/app/pipeline")) return "Pipeline";
  if (pathname.startsWith("/app/campaigns")) return "Campagnes";
  if (pathname.startsWith("/app/templates")) return "Modèles de messages";
  if (pathname.startsWith("/app/leaderboard")) return "Classement";
  if (pathname.startsWith("/app/brands")) return "Marques";
  if (pathname.startsWith("/app/team")) return "Équipe";
  if (pathname.startsWith("/app/settings")) return "Réglages";
  return "Creator Agency";
}
