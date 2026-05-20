import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Star,
  BadgeCheck,
  Clock,
  Package,
  MapPin,
  Sparkles,
  Check,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { toProductDetail, toProductSummary } from "@/lib/products";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { PriceTable } from "@/components/catalog/PriceTable";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { RequestQuoteCTA } from "@/components/catalog/RequestQuoteCTA";
import { ProductCard } from "@/components/catalog/ProductCard";
import { categoryFor } from "@/lib/data/categories";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { title: true, shortPitch: true },
  });
  if (!product) return { title: "Produit · Sourcey" };
  return {
    title: `${product.title} · Sourcey`,
    description: product.shortPitch,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const productRow = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  if (!productRow) notFound();

  const product = toProductDetail(productRow);

  const relatedRows = await prisma.product.findMany({
    where: { category: product.category, slug: { not: product.slug } },
    orderBy: { sourcedTimes: "desc" },
    take: 3,
  });
  const related = relatedRows.map(toProductSummary);

  const category = categoryFor(product.category);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <Container className="pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12.5px] text-neutral-500">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3 w-3" />
            Catalogue
          </Link>
          <span>/</span>
          <Link
            href={`/catalog?category=${category.key}`}
            className="hover:text-neutral-900"
          >
            {category.label}
          </Link>
          <span>/</span>
          <span className="truncate text-neutral-700">{product.title}</span>
        </nav>

        {/* Hero: gallery + key info */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <ProductGallery images={product.images} title={product.title} />

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
                <BadgeCheck className="h-3 w-3" />
                Sourcey Vetted
              </span>
              {product.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  <Sparkles className="h-3 w-3" />
                  Best-seller
                </span>
              )}
              {product.isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  Nouveau
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-[clamp(24px,3vw,36px)] font-extrabold leading-tight tracking-tight text-neutral-900">
              {product.title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
              {product.shortPitch}
            </p>

            {/* Stats strip */}
            <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/40 p-3">
              <Stat
                label="À partir de"
                value={`${product.fromPrice.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}`}
                sub="/ unité"
              />
              <Stat
                label="MOQ"
                value={product.moq.toString()}
                sub="unités"
              />
              <Stat
                label="Prod"
                value={`${product.leadTimeDays}j`}
                sub="lead time"
              />
            </div>

            {/* Trust strip */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-neutral-500">
              {product.rating && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <strong className="text-neutral-900">
                    {product.rating.toFixed(1)}
                  </strong>
                  <span>({product.reviewCount} avis)</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <strong className="text-neutral-700">
                  {product.sourcedTimes}
                </strong>{" "}
                sourcés
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {product.origin}, Chine
              </span>
            </div>

            {/* Agent card */}
            <AgentCard product={product} />

            {/* CTAs */}
            <RequestQuoteCTA product={product} />

            {/* Customization */}
            {product.customizable && product.customOptions.length > 0 && (
              <div className="mt-5 rounded-2xl border border-primary-100 bg-primary-50/30 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-700">
                  <Sparkles className="h-3 w-3" />
                  Personnalisable
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.customOptions.map((opt) => (
                    <span
                      key={opt}
                      className="rounded-full bg-white border border-primary-200 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description + Price table + Specs */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-xl font-extrabold text-neutral-900">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-neutral-700">
              {product.description}
            </p>

            {product.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Certifications
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-neutral-700"
                    >
                      <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <SpecsTable product={product} />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <PriceTable
              tiers={product.priceTiers}
              samplePrice={product.samplePrice}
            />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-neutral-100 pt-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
              Autres produits dans {category.label}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>

      <Footer />
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-extrabold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="text-[10.5px] text-neutral-500">{sub}</p>
    </div>
  );
}

function AgentCard({
  product,
}: {
  product: { agentName: string; agentCity: string; agentAvatarUrl: string; agentSlug: string };
}) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
      <Image
        src={product.agentAvatarUrl}
        alt={product.agentName}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          <BadgeCheck className="h-3 w-3 text-primary-600" />
          Sourcé & géré par
        </p>
        <p className="truncate text-sm font-bold text-neutral-900">
          {product.agentName}
          <span className="text-xs font-normal text-neutral-500"> · {product.agentCity}, Chine</span>
        </p>
      </div>
    </div>
  );
}

function SpecsTable({
  product,
}: {
  product: { material: string | null; origin: string; moq: number; leadTimeDays: number };
}) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
        Spécifications
      </h3>
      <dl className="mt-3 overflow-hidden rounded-2xl border border-neutral-200">
        <Spec label="Origine" value={`${product.origin}, Chine`} icon={MapPin} />
        {product.material && (
          <Spec label="Matériau" value={product.material} icon={Package} />
        )}
        <Spec
          label="MOQ"
          value={`${product.moq} unités`}
          icon={Package}
        />
        <Spec
          label="Lead time"
          value={`${product.leadTimeDays} jours de production`}
          icon={Clock}
        />
      </dl>
    </div>
  );
}

function Spec({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-0">
      <dt className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-neutral-500">
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd className="text-[13.5px] text-neutral-800">{value}</dd>
    </div>
  );
}
