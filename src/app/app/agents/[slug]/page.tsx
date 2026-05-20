import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  BadgeCheck,
  Languages,
  Briefcase,
  Sparkles,
  Clock,
  TrendingUp,
  Calendar,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { agentBySlug } from "@/lib/data/agents";
import { prisma } from "@/lib/db";
import { toProductSummary } from "@/lib/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ContactAgentCTA } from "@/components/agents/ContactAgentCTA";

interface PageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: PageProps) {
  const agent = agentBySlug(params.slug);
  if (!agent) return { title: "Agent · Sourcey" };
  return {
    title: `${agent.fullName} · Agent Sourcey ${agent.city}`,
    description: agent.bio?.slice(0, 160),
  };
}

export default async function AgentDetailPage({ params }: PageProps) {
  const agent = agentBySlug(params.slug);
  if (!agent) notFound();

  const productRows = await prisma.product.findMany({
    where: { agentSlug: agent.slug },
    orderBy: { sourcedTimes: "desc" },
  });
  const products = productRows.map(toProductSummary);

  return (
    <div>
      {/* Banner + avatar header */}
      <section className="relative">
        <div className="relative h-48 overflow-hidden bg-neutral-100 sm:h-64">
          {agent.banner && (
            <Image
              src={agent.banner}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/30 via-transparent to-neutral-50/30" />

          <Link
            href="/app/agents"
            className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 backdrop-blur transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tous les agents
          </Link>
        </div>

        <div className="mx-auto -mt-16 max-w-5xl px-5 sm:-mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl bg-neutral-100 ring-4 ring-neutral-50">
              <Image
                src={agent.avatar}
                alt={agent.fullName}
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
              {agent.verified && (
                <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-white ring-2 ring-neutral-50">
                  <BadgeCheck className="h-4 w-4" strokeWidth={2.5} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-none tracking-tight text-neutral-900">
                {agent.fullName}
              </h1>
              {agent.tagline && (
                <p className="mt-2 text-[14px] text-neutral-600">
                  {agent.tagline}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[12.5px] text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {agent.city}, Chine
                </span>
                <span className="inline-flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5" />
                  {agent.languages.map((l) => l.toUpperCase()).join(" · ")}
                </span>
                {agent.joinedYear && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Agent depuis {agent.joinedYear}
                  </span>
                )}
              </div>
            </div>
            <ContactAgentCTA agent={agent} />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto mt-8 max-w-5xl px-5">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:grid-cols-4">
          <BigStat
            icon={Star}
            value={agent.rating.toFixed(1)}
            label={`Note client (${agent.reviews?.length ?? 0} avis)`}
            color="text-amber-500"
          />
          <BigStat
            icon={Briefcase}
            value={agent.missions.toString()}
            label="Missions réussies"
            color="text-primary-700"
          />
          <BigStat
            icon={TrendingUp}
            value={(agent.missionsThisMonth ?? 0).toString()}
            label="Ce mois-ci"
            color="text-emerald-700"
          />
          <BigStat
            icon={Clock}
            value={agent.responseTime ?? "< 4h"}
            label="Temps de réponse"
            color="text-enterprise-700"
          />
        </div>
      </section>

      {/* Main content: bio + specialties + reviews + products */}
      <section className="mx-auto mt-10 max-w-5xl px-5 pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-xl font-extrabold text-neutral-900">
              À propos
            </h2>
            {agent.bio ? (
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
                {agent.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">Bio à venir.</p>
            )}

            <div className="mt-6">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Spécialités
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {agent.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {agent.reviews && agent.reviews.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-extrabold text-neutral-900">
                  Avis clients
                </h2>
                <ul className="mt-4 space-y-3">
                  {agent.reviews.map((r, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-neutral-900">
                            {r.author}
                            {r.authorCompany && (
                              <span className="font-normal text-neutral-500">
                                {" "}
                                · {r.authorCompany}
                              </span>
                            )}
                          </p>
                          <p className="text-[10.5px] text-neutral-400">
                            {new Date(r.date).toLocaleDateString("fr-FR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={
                                idx < r.rating
                                  ? "h-3.5 w-3.5 fill-current"
                                  : "h-3.5 w-3.5 text-neutral-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-700">
                        « {r.text} »
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside>
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-bold text-neutral-900">
                Comment ça marche
              </h3>
              <ol className="mt-4 space-y-3 text-[13px] text-neutral-700">
                <Step
                  n={1}
                  text="Tu ouvres une conversation avec l'agent (gratuit)"
                />
                <Step
                  n={2}
                  text="Tu décris ton besoin, l'agent te propose 2-3 fournisseurs"
                />
                <Step
                  n={3}
                  text="Devis sous 48h avec vidéo qualité avant l'expédition"
                />
                <Step
                  n={4}
                  text="Tu valides, paiement escrow, livraison en 7-12j"
                />
              </ol>
              <p className="mt-4 rounded-xl bg-neutral-50 p-3 text-[11.5px] text-neutral-600">
                <strong className="text-neutral-900">Sans engagement.</strong>{" "}
                Tu peux contacter plusieurs agents en parallèle si tu veux
                comparer.
              </p>
            </div>
          </aside>
        </div>

        {/* Products sourced by this agent */}
        {products.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-neutral-900">
                Produits sourcés par {agent.fullName.split(" ")[0]}
              </h2>
              <span className="text-xs font-semibold text-neutral-500">
                {products.length} produit{products.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function BigStat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <Icon className={`mb-1.5 h-4 w-4 ${color ?? "text-neutral-400"}`} />
      <p className="font-display text-xl font-extrabold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-neutral-500">{label}</p>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
