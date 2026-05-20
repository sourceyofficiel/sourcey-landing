import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  Star,
} from "lucide-react";
import { SERVICES, type ServiceType } from "@/lib/data/services";
import { ServiceOrderForm } from "@/components/services/ServiceOrderForm";

interface PageProps {
  params: { type: string };
}

export function generateMetadata({ params }: PageProps) {
  const service = SERVICES[params.type as ServiceType];
  if (!service) return { title: "Service · Sourcey" };
  return { title: `${service.name} · Sourcey` };
}

export default function ServiceDetailPage({ params }: PageProps) {
  const service = SERVICES[params.type as ServiceType];
  if (!service) notFound();

  const Icon = service.icon;

  return (
    <main className="mx-auto max-w-6xl px-5 py-6 md:py-10">
      <Link
        href="/app/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les services
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-start">
        {/* Left: visual + description */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-neutral-200">
            <Image
              src={service.examples[0]}
              alt={service.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {service.examples.slice(1).map((url, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: title + description + benefits */}
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
            <Icon className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-[clamp(28px,3.5vw,40px)] font-extrabold leading-tight tracking-tight text-neutral-900">
            {service.name}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-neutral-600">
            {service.tagline}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            {service.description}
          </p>

          <ul className="mt-6 space-y-2.5">
            {service.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-700" strokeWidth={3} />
                </span>
                <span className="text-neutral-700">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tiers comparison */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900">
          Choisis ton niveau
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {service.tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 transition-all hover:-translate-y-0.5 ${
                tier.popular
                  ? "border-primary-200 shadow-brand ring-1 ring-primary-100"
                  : "border-neutral-200 shadow-sm"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-brand">
                  <Star className="h-3 w-3 fill-current" />
                  Le plus choisi
                </span>
              )}
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
                Tier {tier.key}
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-neutral-900">
                {tier.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight text-neutral-900">
                  {tier.price}€
                </span>
                <span className="text-sm text-neutral-500">HT</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                <Clock className="h-3 w-3" />
                Livré en {tier.deliveryDays} jours
              </p>

              <ul className="mt-5 space-y-2 border-t border-neutral-100 pt-5">
                {tier.includes.map((inc) => (
                  <li
                    key={inc}
                    className="flex items-start gap-2 text-[13.5px] text-neutral-700"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary-100">
                      <Check
                        className="h-2.5 w-2.5 text-primary-700"
                        strokeWidth={3}
                      />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Order form */}
      <section id="order" className="mt-14">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900">
          Commander ce service
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Remplis le brief, on te recontacte sous 24h avec un devis précis.
        </p>
        <div className="mt-5">
          <ServiceOrderForm type={service.type} tiers={service.tiers} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900">
          Questions fréquentes
        </h2>
        <div className="mt-5 space-y-3">
          {service.faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl border border-neutral-200 bg-white p-4 transition-colors open:border-primary-200 open:bg-primary-50/30"
            >
              <summary className="cursor-pointer list-none text-sm font-bold text-neutral-900 marker:hidden">
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
