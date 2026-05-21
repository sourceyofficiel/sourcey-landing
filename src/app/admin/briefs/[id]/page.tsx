import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminBriefActions } from "@/components/admin/AdminBriefActions";

export const dynamic = "force-dynamic";

export default async function AdminBriefDetail({
  params,
}: {
  params: { id: string };
}) {
  const brief = await prisma.brief.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          whatsapp: true,
          plan: true,
          createdAt: true,
        },
      },
    },
  });
  if (!brief) return notFound();

  return (
    <div className="mx-auto max-w-[1000px] p-5 md:p-8">
      {/* Back link */}
      <Link
        href="/admin/briefs"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux briefs
      </Link>

      {/* Header */}
      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={brief.status} />
            <span className="font-mono text-[11px] text-neutral-400">
              #{brief.id.slice(-8)}
            </span>
          </div>
          <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[30px]">
            {brief.productName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {brief.createdAt.toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {brief.productType && (
              <>
                <span>·</span>
                <span className="capitalize">{brief.productType}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main 2 columns */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left column — details */}
        <div className="space-y-5">
          {/* Description */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-neutral-800">
              {brief.description}
            </p>
          </section>

          {/* Specs grid */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Spécifications
            </h2>
            <dl className="mt-3 grid gap-4 md:grid-cols-3">
              <Spec label="Quantité" value={brief.targetQuantity} />
              <Spec label="Budget" value={brief.targetPrice ?? "—"} />
              <Spec label="Délais" value={brief.targetDelivery ?? "—"} />
            </dl>
            {brief.inspirationUrl && (
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Inspiration
                </div>
                <Link
                  href={brief.inspirationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 break-all text-[13px] font-medium text-primary-700 hover:underline"
                >
                  {brief.inspirationUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </Link>
              </div>
            )}
          </section>

          {/* Actions: status update + internal notes */}
          <AdminBriefActions
            briefId={brief.id}
            currentStatus={brief.status}
            currentNotes={brief.internalNotes ?? ""}
          />
        </div>

        {/* Right column — client info */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Client
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[14px] font-bold text-white">
                {(brief.user.fullName ?? brief.user.email)[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-bold text-neutral-900">
                  {brief.user.fullName ?? "Nom non renseigné"}
                </div>
                <div className="truncate text-[12px] text-neutral-500">
                  {brief.user.email}
                </div>
                <div className="mt-1.5">
                  <span
                    className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      brief.user.plan === "free"
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {brief.user.plan}
                  </span>
                </div>
              </div>
            </div>

            {brief.user.whatsapp && (
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  WhatsApp
                </div>
                <Link
                  href={`https://wa.me/${brief.user.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-green-700 hover:underline"
                >
                  {brief.user.whatsapp}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            <Link
              href={`/admin/users/${brief.user.id}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2 text-[12.5px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <User className="h-3.5 w-3.5" />
              Voir le profil
            </Link>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Historique
            </h2>
            <ul className="mt-3 space-y-2 text-[12px] text-neutral-600">
              <li>
                <span className="font-semibold text-neutral-900">Créé :</span>{" "}
                {brief.createdAt.toLocaleString("fr-FR")}
              </li>
              <li>
                <span className="font-semibold text-neutral-900">Mis à jour :</span>{" "}
                {brief.updatedAt.toLocaleString("fr-FR")}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-semibold text-neutral-900">
        {value}
      </dd>
    </div>
  );
}
