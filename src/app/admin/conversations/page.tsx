import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminConversationsList({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter ?? "all";

  const where: Record<string, unknown> = {};
  if (filter === "unread") {
    where.unreadByCounterpart = { gt: 0 };
  } else if (filter === "support") {
    where.type = "support";
  }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: [{ unreadByCounterpart: "desc" }, { lastMessageAt: "desc" }],
    take: 100,
    include: {
      user: { select: { email: true, fullName: true } },
    },
  });

  return (
    <div className="mx-auto max-w-[1100px] p-5 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
            Toutes les conversations
          </div>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[32px]">
            Conversations
          </h1>
        </div>
        <div className="text-[12px] text-neutral-500">
          {conversations.length} résultat
          {conversations.length > 1 ? "s" : ""}
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1">
        <FilterTab href="/admin/conversations" label="Toutes" isActive={filter === "all"} />
        <FilterTab
          href="/admin/conversations?filter=unread"
          label="Non lues"
          isActive={filter === "unread"}
        />
        <FilterTab
          href="/admin/conversations?filter=support"
          label="Support seulement"
          isActive={filter === "support"}
        />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <MessagesSquare className="h-8 w-8 text-neutral-300" />
            <div className="text-[14px] font-semibold text-neutral-700">
              Aucune conversation
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/conversations/${c.id}`}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 ${
                    c.unreadByCounterpart > 0 ? "bg-amber-50/40" : ""
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                      c.type === "support"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {c.type === "support"
                      ? "S"
                      : c.agentName?.[0]?.toUpperCase() ?? "A"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[14px] font-bold text-neutral-900">
                        {c.title ??
                          (c.type === "support"
                            ? "Support Sourcey"
                            : c.agentName ?? "Agent")}
                      </h3>
                      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                        {c.type}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[12.5px] text-neutral-500">
                      {c.lastMessagePreview ?? "—"}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-400">
                      {c.user.fullName ?? c.user.email}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {c.unreadByCounterpart > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-bold text-white">
                        {c.unreadByCounterpart} nouveau
                        {c.unreadByCounterpart > 1 ? "x" : ""}
                      </span>
                    )}
                    <time className="text-[11px] text-neutral-400">
                      {formatRelative(c.lastMessageAt)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterTab({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        isActive
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {label}
    </Link>
  );
}

function formatRelative(d: Date) {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
