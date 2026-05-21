"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  MessagesSquare,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/briefs", label: "Briefs", icon: ClipboardList },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/conversations", label: "Conversations", icon: MessagesSquare },
];

export function AdminSidebar({
  user,
}: {
  user: { email: string; fullName: string | null };
}) {
  const pathname = usePathname();
  const firstName = user.fullName?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo />
        </Link>
        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-neutral-100 pt-3">
          <div className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
            Raccourcis
          </div>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/app"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
                App client
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
                Landing public
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-neutral-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[13px] font-bold text-white">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-neutral-900">
              {firstName}
            </div>
            <div className="truncate text-[11px] text-neutral-500">
              {user.email}
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
