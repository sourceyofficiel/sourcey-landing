"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  TestTube,
  Sparkles,
  Camera,
  Box,
  Palette,
  MessageCircle,
  Eye,
  Clock,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format-time";

type Tab = "all" | "quote" | "sample" | "service";

interface ProductOrderItem {
  id: string;
  kind: "quote" | "sample";
  productTitle: string;
  productSlug: string;
  productImage: string | null;
  agentName: string;
  agentCity: string;
  agentAvatarUrl: string;
  agentSlug: string;
  quantity: number | null;
  status: string;
  statusLabel: { label: string; color: string };
  conversationId: string | null;
  createdAt: string;
}

interface ServiceOrderItem {
  id: string;
  kind: "service";
  serviceType: string;
  tier: string;
  brief: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  estimatedPrice: number;
  finalPrice: number | null;
  createdAt: string;
}

interface Props {
  initialTab: Tab;
  quotes: ProductOrderItem[];
  samples: ProductOrderItem[];
  services: ServiceOrderItem[];
}

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "Tout", icon: Inbox },
  { key: "quote", label: "Devis", icon: Package },
  { key: "sample", label: "Samples", icon: TestTube },
  { key: "service", label: "Services premium", icon: Sparkles },
];

export function OrdersTabs({ initialTab, quotes, samples, services }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);

  const counts = {
    all: quotes.length + samples.length + services.length,
    quote: quotes.length,
    sample: samples.length,
    service: services.length,
  };

  const items: (ProductOrderItem | ServiceOrderItem)[] =
    tab === "all"
      ? [...quotes, ...samples, ...services].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : tab === "quote"
        ? quotes
        : tab === "sample"
          ? samples
          : services;

  return (
    <div>
      {/* Tabs bar */}
      <div className="-mx-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <ul className="flex w-max items-center gap-1.5 px-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count = counts[t.key];
            return (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all",
                    active
                      ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                        active
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-100 text-neutral-700"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center"
            >
              <Inbox className="mx-auto h-6 w-6 text-neutral-300" />
              <p className="mt-3 text-sm font-bold text-neutral-900">
                Pas encore de commande dans cette catégorie
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Parcours le catalogue ou crée une demande de sourcing
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button asChild variant="primary" size="sm">
                  <Link href="/catalog">Voir le catalogue</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/app/services">Services premium</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {item.kind === "service" ? (
                  <ServiceOrderCard item={item} />
                ) : (
                  <ProductOrderCard item={item} />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProductOrderCard({ item }: { item: ProductOrderItem }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-4">
        {/* Product image */}
        <Link
          href={`/catalog/${item.productSlug}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
        >
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productTitle}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-neutral-400" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {/* Title + kind */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.kind === "sample"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-primary-50 text-primary-700"
              )}
            >
              {item.kind === "sample" ? (
                <>
                  <TestTube className="h-2.5 w-2.5" />
                  Sample
                </>
              ) : (
                <>
                  <Package className="h-2.5 w-2.5" />
                  Devis
                </>
              )}
            </span>
            {item.quantity && item.kind === "quote" && (
              <span className="text-[10.5px] text-neutral-500">
                Pour <strong>{item.quantity}</strong> unités
              </span>
            )}
          </div>
          <Link
            href={`/catalog/${item.productSlug}`}
            className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900 hover:underline"
          >
            {item.productTitle}
          </Link>
          {/* Agent + date */}
          <div className="mt-2 flex items-center gap-3 text-[11.5px] text-neutral-500">
            <Link
              href={`/app/agents/${item.agentSlug}`}
              className="inline-flex items-center gap-1.5 hover:text-neutral-900"
            >
              <Image
                src={item.agentAvatarUrl}
                alt={item.agentName}
                width={18}
                height={18}
                className="h-4 w-4 rounded-full object-cover"
              />
              <strong className="font-semibold text-neutral-700">
                {item.agentName}
              </strong>
              · {item.agentCity}
            </Link>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Status + CTAs */}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
            item.statusLabel.color
          )}
        >
          {item.statusLabel.label}
        </span>
        {item.conversationId && (
          <Link
            href="/app/inbox"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-primary-700 hover:underline"
          >
            <MessageCircle className="h-3 w-3" />
            Voir le chat
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  );
}

const SERVICE_ICONS = {
  photoshoot: Camera,
  packaging: Box,
  logo: Palette,
};

function ServiceOrderCard({ item }: { item: ServiceOrderItem }) {
  const Icon = SERVICE_ICONS[item.serviceType as keyof typeof SERVICE_ICONS] ?? Sparkles;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-enterprise-50 to-primary-50 text-enterprise-700">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-enterprise-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-enterprise-700">
              <Sparkles className="h-2.5 w-2.5" />
              Service Premium
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-bold text-neutral-900">
            {item.serviceType === "photoshoot"
              ? "Photoshoot produit"
              : item.serviceType === "packaging"
                ? "Design packaging"
                : "Logo / branding"}{" "}
            · Tier {item.tier}
          </p>
          <p className="mt-1 line-clamp-1 text-[12px] text-neutral-500">
            {item.brief}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11.5px] text-neutral-500">
            <span className="font-bold text-neutral-700">
              {item.finalPrice ?? item.estimatedPrice}€ HT
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
            item.statusColor
          )}
        >
          {item.statusLabel}
        </span>
        <Link
          href="/app/services/orders"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-primary-700 hover:underline"
        >
          <Eye className="h-3 w-3" />
          Détails
        </Link>
      </div>
    </article>
  );
}
