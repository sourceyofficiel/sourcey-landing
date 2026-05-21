import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  AdminStatusBadge,
  BRIEF_STATUSES,
} from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminBriefsList({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status;
  const q = searchParams.q?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    if (status === "in-progress") {
      where.status = {
        in: ["in-review", "supplier-contacted", "quote-ready"],
      };
    } else {
      where.status = status;
    }
  }
  if (q) {
    where.OR = [
      { productName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { fullName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const briefs = await prisma.brief.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
            Tous les briefs
          </div>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[32px]">
            Briefs
          </h1>
        </div>
        <div className="text-[12px] text-neutral-500">
          {briefs.length} résultat{briefs.length > 1 ? "s" : ""}
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <form className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher produit, client, email…"
            className="h-9 w-full bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {status && status !== "all" && (
            <input type="hidden" name="status" value={status} />
          )}
        </form>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1">
          <FilterTab
            href={`/admin/briefs${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            label="Tous"
            isActive={!status || status === "all"}
          />
          {BRIEF_STATUSES.slice(0, 4).map((s) => (
            <FilterTab
              key={s.value}
              href={`/admin/briefs?status=${s.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={s.label}
              isActive={status === s.value}
            />
          ))}
        </div>
      </div>

      {/* Briefs table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {briefs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <ClipboardList className="h-8 w-8 text-neutral-300" />
            <div className="text-[14px] font-semibold text-neutral-700">
              Aucun brief trouvé
            </div>
            <div className="text-[12px] text-neutral-500">
              {q ? "Essaye une autre recherche" : "Quand un client soumettra un brief, il apparaîtra ici."}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {briefs.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/briefs/${b.id}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[14px] font-bold text-neutral-900">
                        {b.productName}
                      </h3>
                      <AdminStatusBadge status={b.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-neutral-500">
                      {b.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-neutral-500">
                      <span className="font-semibold text-neutral-700">
                        {b.user.fullName ?? b.user.email}
                      </span>
                      <span>·</span>
                      <span>Qté : {b.targetQuantity}</span>
                      {b.targetPrice && (
                        <>
                          <span>·</span>
                          <span>Budget : {b.targetPrice}</span>
                        </>
                      )}
                      {b.productType && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{b.productType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <time className="shrink-0 text-[11px] text-neutral-400">
                    {formatRelative(b.createdAt)}
                  </time>
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
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `il y a ${days}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
