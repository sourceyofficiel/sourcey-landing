import Link from "next/link";
import { Users, Search } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersList({
  searchParams,
}: {
  searchParams: { q?: string; plan?: string };
}) {
  const q = searchParams.q?.trim();
  const plan = searchParams.plan;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (plan && plan !== "all") {
    where.plan = plan;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      fullName: true,
      plan: true,
      subscriptionStatus: true,
      whatsapp: true,
      isAdmin: true,
      createdAt: true,
      _count: {
        select: { briefs: true, conversations: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
            Tous les utilisateurs
          </div>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[32px]">
            Utilisateurs
          </h1>
        </div>
        <div className="text-[12px] text-neutral-500">
          {users.length} résultat{users.length > 1 ? "s" : ""}
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <form className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher email ou nom…"
            className="h-9 w-full bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {plan && plan !== "all" && (
            <input type="hidden" name="plan" value={plan} />
          )}
        </form>

        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1">
          <FilterTab
            href={`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            label="Tous"
            isActive={!plan || plan === "all"}
          />
          {["free", "starter", "pro"].map((p) => (
            <FilterTab
              key={p}
              href={`/admin/users?plan=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={p[0].toUpperCase() + p.slice(1)}
              isActive={plan === p}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Users className="h-8 w-8 text-neutral-300" />
            <div className="text-[14px] font-semibold text-neutral-700">
              Aucun utilisateur trouvé
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {users.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-neutral-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[14px] font-bold text-white">
                    {(u.fullName ?? u.email)[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[14px] font-bold text-neutral-900">
                        {u.fullName ?? u.email.split("@")[0]}
                      </h3>
                      {u.isAdmin && (
                        <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-rose-700">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[12px] text-neutral-500">
                      {u.email}
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-4 text-[11.5px] text-neutral-500 sm:flex">
                    <div className="min-w-[80px] text-right">
                      <div className="font-mono font-semibold text-neutral-900">
                        {u._count.briefs}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider">
                        briefs
                      </div>
                    </div>
                    <div className="min-w-[80px] text-right">
                      <div className="font-mono font-semibold text-neutral-900">
                        {u._count.conversations}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider">
                        convos
                      </div>
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
