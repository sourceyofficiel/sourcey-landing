import Link from "next/link";
import Image from "next/image";
import { ArrowRight, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SERVICE_LIST } from "@/lib/data/services";

export const metadata = {
  title: "Services premium · Sourcey",
};

const ACCENT_BG: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700",
  primary: "bg-primary-50 text-primary-700",
  enterprise: "bg-enterprise-50 text-enterprise-700",
};

export default function ServicesCatalogPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700">
            <Sparkles className="h-3 w-3" />
            Services Premium · facturé à la prestation
          </span>
          <h1 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-neutral-900">
            Pousse ta marque <span className="text-primary-600">au niveau pro</span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-neutral-600">
            Photoshoot studio, design packaging, identité visuelle — bookable en
            quelques clics directement depuis ton dashboard, exécuté par nos
            partenaires triés sur le volet.
          </p>
        </div>
        <Button asChild variant="secondary" size="md">
          <Link href="/app/services/orders">
            <History className="h-4 w-4" />
            Mes commandes
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_LIST.map((service) => {
          const Icon = service.icon;
          const minPrice = Math.min(...service.tiers.map((t) => t.price));
          const maxPrice = Math.max(...service.tiers.map((t) => t.price));
          return (
            <article
              key={service.type}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <Image
                  src={service.examples[0]}
                  alt={service.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
                <span
                  className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    ACCENT_BG[service.accent]
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {service.type === "photoshoot"
                    ? "Photo"
                    : service.type === "packaging"
                      ? "Packaging"
                      : "Branding"}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-extrabold leading-tight text-neutral-900">
                  {service.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {service.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-2 border-t border-neutral-100 pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    À partir de
                  </span>
                  <span className="font-display text-2xl font-extrabold text-neutral-900">
                    {minPrice}€
                  </span>
                  <span className="text-xs text-neutral-500">– {maxPrice}€</span>
                </div>

                <Button
                  asChild
                  variant="primary"
                  size="md"
                  className="mt-5 w-full"
                >
                  <Link href={`/app/services/${service.type}`}>
                    Voir les détails
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white/50 p-6 text-center">
        <p className="text-sm text-neutral-600">
          Besoin d'autre chose ? Vidéo unboxing, branding magasin, app design…{" "}
          <Link
            href="/app/inbox"
            className="font-semibold text-primary-700 underline-offset-4 hover:underline"
          >
            Écris au Support
          </Link>{" "}
          on monte un devis custom.
        </p>
      </div>
    </main>
  );
}
