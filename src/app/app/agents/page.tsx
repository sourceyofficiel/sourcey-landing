import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  BadgeCheck,
  Languages,
  Briefcase,
  Sparkles,
  Search,
} from "lucide-react";
import { agents } from "@/lib/data/agents";

export const metadata = {
  title: "Annuaire agents · Sourcey",
};

const ALL_CITIES = Array.from(new Set(agents.map((a) => a.city))).sort();

export default function AgentsListPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
            Annuaire agents
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            <strong className="text-neutral-900">{agents.length}</strong> agents
            humains, francophones, vérifiés en personne dans{" "}
            <strong>{ALL_CITIES.length} villes</strong> en Chine.
          </p>
        </div>
        <Link
          href="/match"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-brand transition-colors hover:bg-primary-700"
        >
          <Sparkles className="h-4 w-4" />
          Match IA
        </Link>
      </div>

      {/* City pills */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {["Tous", ...ALL_CITIES].map((city) => (
          <span
            key={city}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] font-semibold text-neutral-700"
          >
            <MapPin className="h-3 w-3 text-neutral-400" />
            {city}
            <span className="ml-1 text-[10px] text-neutral-400">
              {city === "Tous"
                ? agents.length
                : agents.filter((a) => a.city === city).length}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.slug}
            href={`/app/agents/${agent.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              <Image
                src={agent.avatar}
                alt={agent.fullName}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {agent.verified && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-primary-700 backdrop-blur">
                  <BadgeCheck className="h-3 w-3" />
                  Vérifié
                </span>
              )}
              <div className="absolute inset-x-4 bottom-3 text-white">
                <p className="flex items-center gap-1 text-[11px] font-medium opacity-90">
                  <MapPin className="h-3 w-3" />
                  {agent.city}
                </p>
                <h3 className="mt-0.5 text-lg font-extrabold leading-tight">
                  {agent.fullName}
                </h3>
                {agent.tagline && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] opacity-85">
                    {agent.tagline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="flex flex-wrap gap-1.5">
                {agent.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center">
                <Stat
                  icon={Star}
                  value={agent.rating.toFixed(1)}
                  label="Note"
                  color="text-amber-500"
                />
                <Stat
                  icon={Briefcase}
                  value={agent.missions.toString()}
                  label="Missions"
                />
                <Stat
                  icon={Languages}
                  value={agent.languages.join("/").toUpperCase()}
                  label="Parle"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({
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
    <div>
      <Icon className={`mx-auto h-3 w-3 ${color ?? "text-neutral-400"}`} />
      <p className="mt-0.5 text-xs font-bold text-neutral-900">{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-neutral-500">
        {label}
      </p>
    </div>
  );
}
