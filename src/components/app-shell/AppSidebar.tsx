"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageCircle,
  Package,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "unreadMessages" | "activeOrders";
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/app/new", label: "Nouveau brief", icon: Plus },
      { href: "/app/orders", label: "Mes briefs", icon: Package, badgeKey: "activeOrders" },
      { href: "/app/inbox", label: "Notifications", icon: MessageCircle, badgeKey: "unreadMessages" },
    ],
  },
];

interface BadgeCounts {
  unreadMessages: number;
  activeOrders: number;
}

interface UserSummary {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  plan: string;
}

export function AppSidebar({
  user,
  onCloseMobile,
}: {
  user: UserSummary;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<BadgeCounts>({
    unreadMessages: 0,
    activeOrders: 0,
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Poll unread counts every 30s
  useEffect(() => {
    let stopped = false;
    const fetchBadges = async () => {
      try {
        const [convRes, ordRes] = await Promise.all([
          fetch("/api/conversations", { cache: "no-store" }),
          fetch("/api/services/order", { cache: "no-store" }),
        ]);
        if (stopped) return;
        const convData = await convRes.json();
        const ordData = await ordRes.json();
        const unread = (convData.conversations ?? []).reduce(
          (s: number, c: { unreadByUser: number }) => s + (c.unreadByUser ?? 0),
          0
        );
        const active = (ordData.orders ?? []).filter(
          (o: { status: string }) =>
            o.status !== "delivered" && o.status !== "cancelled"
        ).length;
        setBadges({ unreadMessages: unread, activeOrders: active });
      } catch {
        /* ignore */
      }
    };
    fetchBadges();
    const id = window.setInterval(fetchBadges, 30_000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  return (
    <aside
      className="flex h-full w-full flex-col border-r border-neutral-200 bg-white"
      aria-label="Navigation principale"
    >
      <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-5">
        <Link
          href="/"
          className="rounded-lg -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Accueil Sourcey"
          onClick={onCloseMobile}
        >
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-5" : ""}>
            {group.title && (
              <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/app" && pathname.startsWith(item.href));
                const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-primary-600"
                            : "text-neutral-400 group-hover:text-neutral-600"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={cn(
                            "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                            isActive
                              ? "bg-primary-600 text-white"
                              : "bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300"
                          )}
                        >
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary-50 to-enterprise-50/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">
            ✨ Sourcey IA
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-tight text-neutral-900">
            Pas envie de chercher ? Décris ton besoin.
          </p>
          <Link
            href="/match"
            onClick={onCloseMobile}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary-700 hover:underline"
          >
            Lancer Match IA →
          </Link>
        </div>
      </nav>

      {/* User card with dropdown */}
      <div className="relative border-t border-neutral-100 p-3">
        {userMenuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default bg-transparent"
              onClick={() => setUserMenuOpen(false)}
              aria-label="Fermer le menu"
            />
            <div className="absolute bottom-full left-3 right-3 z-20 mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              <Link
                href="/app/profile"
                onClick={() => {
                  setUserMenuOpen(false);
                  onCloseMobile?.();
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <User className="h-4 w-4 text-neutral-400" />
                Mon profil
              </Link>
              <Link
                href="/app/billing"
                onClick={() => {
                  setUserMenuOpen(false);
                  onCloseMobile?.();
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Settings className="h-4 w-4 text-neutral-400" />
                Facturation
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setUserMenuOpen(false);
                  onCloseMobile?.();
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                  } catch {}
                  window.location.href = "/";
                }}
                className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <LogOut className="h-4 w-4 text-neutral-400" />
                Se déconnecter
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-neutral-50"
        >
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-neutral-900">
              {user.fullName ?? user.email.split("@")[0]}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-neutral-500">
              Plan{" "}
              <span
                className={cn(
                  "inline-flex rounded px-1 py-0 text-[10px] font-bold uppercase",
                  user.plan === "pro"
                    ? "bg-primary-100 text-primary-700"
                    : user.plan === "enterprise"
                    ? "bg-enterprise-100 text-enterprise-700"
                    : "bg-neutral-100 text-neutral-700"
                )}
              >
                {user.plan}
              </span>
            </p>
          </div>
          <ChevronUp
            className={cn(
              "h-3.5 w-3.5 text-neutral-400 transition-transform",
              userMenuOpen ? "rotate-180" : ""
            )}
          />
        </button>
      </div>
    </aside>
  );
}

function UserAvatar({ user }: { user: UserSummary }) {
  const initials = (user.fullName ?? user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.fullName ?? user.email}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
      {initials}
    </div>
  );
}
