"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Package, Check } from "lucide-react";
import { cn, formatEuro } from "@/lib/utils";
import { b2cPlans } from "@/lib/data/pricing";

interface ExampleProduct {
  slug: string;
  name: string;
  image: string;
  agentName: string;
  agentCity: string;
  basePrice: number; // €/unit at MOQ
  moq: number;
  quantity: number; // quantity used for the breakdown
}

const PRODUCTS: ExampleProduct[] = [
  {
    slug: "bougie",
    name: "Bougie parfumée cire de soja",
    image:
      "https://images.unsplash.com/photo-1602874801006-94d8d3c97f8a?w=600&q=80&auto=format&fit=crop",
    agentName: "Li Wei",
    agentCity: "Yiwu",
    basePrice: 2.85,
    moq: 100,
    quantity: 500,
  },
  {
    slug: "hoodie",
    name: "Hoodie streetwear oversize 350g",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80&auto=format&fit=crop",
    agentName: "Chen Mei",
    agentCity: "Guangzhou",
    basePrice: 11.2,
    moq: 50,
    quantity: 200,
  },
  {
    slug: "usbc",
    name: "Chargeur USB-C 65W GaN",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop",
    agentName: "Wang Jun",
    agentCity: "Shenzhen",
    basePrice: 6.5,
    moq: 100,
    quantity: 500,
  },
  {
    slug: "collier",
    name: "Collier acier inox plaqué or",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343c?w=600&q=80&auto=format&fit=crop",
    agentName: "Huang Yan",
    agentCity: "Shenzhen",
    basePrice: 3.1,
    moq: 100,
    quantity: 500,
  },
];

export function ConcreteExample() {
  const [activeSlug, setActiveSlug] = useState(PRODUCTS[0].slug);
  const product = PRODUCTS.find((p) => p.slug === activeSlug) ?? PRODUCTS[0];

  const baseTotal = product.basePrice * product.quantity;

  const rows = b2cPlans.map((plan) => {
    const unitPrice = product.basePrice * (1 - plan.unitDiscount);
    const total = unitPrice * product.quantity;
    const savings = baseTotal - total;
    const net = savings - plan.priceMonthly;
    return { plan, unitPrice, total, savings, net };
  });

  const bestIdx = rows.reduce(
    (best, r, i) => (r.net > rows[best].net ? i : best),
    0
  );
  const bestRow = rows[bestIdx];

  return (
    <section className="mx-auto mt-6 max-w-4xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Exemple concret
            </p>
            <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-neutral-900">
              Voici comment ton plan négocie un produit réel
            </h3>
          </div>
          {/* Product chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRODUCTS.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-colors",
                  p.slug === activeSlug
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                {p.name.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] md:items-start">
          {/* Product card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-neutral-100 bg-neutral-50/40 p-3"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <h4 className="mt-3 text-[13px] font-bold leading-tight text-neutral-900">
                {product.name}
              </h4>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                <MapPin className="h-2.5 w-2.5" />
                {product.agentName} · {product.agentCity}
              </p>
              <div className="mt-3 space-y-1 border-t border-neutral-200/60 pt-2 text-[11px] text-neutral-500">
                <Row label="Prix usine">
                  <strong className="text-neutral-900 tabular-nums">
                    {product.basePrice.toFixed(2)} €/u
                  </strong>
                </Row>
                <Row label="MOQ">
                  <span className="tabular-nums">{product.moq}</span>
                </Row>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Negotiation table */}
          <div>
            <p className="text-[11.5px] text-neutral-500">
              Pour une commande de{" "}
              <strong className="text-neutral-900 tabular-nums">
                {product.quantity.toLocaleString("fr-FR")} unités
              </strong>{" "}
              ({formatEuro(baseTotal)} prix usine) :
            </p>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr className="border-b border-neutral-100">
                    <th className="px-3 py-2.5 text-left font-bold">Plan</th>
                    <th className="px-3 py-2.5 text-right font-bold">Prix / u</th>
                    <th className="px-3 py-2.5 text-right font-bold">Total commande</th>
                    <th className="px-3 py-2.5 text-right font-bold">Net sur 1 mois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rows.map((r, i) => {
                    const isBest = i === bestIdx;
                    return (
                      <motion.tr
                        key={r.plan.id}
                        layout
                        className={cn(isBest ? "bg-primary-50/40" : "")}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-neutral-900">
                              {r.plan.name}
                            </span>
                            {r.plan.unitDiscount > 0 && (
                              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700">
                                −{Math.round(r.plan.unitDiscount * 100)} %
                              </span>
                            )}
                            {isBest && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                Idéal
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right text-[12.5px] tabular-nums text-neutral-700">
                          {r.unitPrice.toFixed(2)} €
                        </td>
                        <td className="px-3 py-2.5 text-right text-[12.5px] tabular-nums">
                          <span
                            className={cn(
                              "font-semibold",
                              r.plan.unitDiscount > 0
                                ? "text-neutral-900"
                                : "text-neutral-700"
                            )}
                          >
                            {formatEuro(r.total)}
                          </span>
                          {r.plan.unitDiscount > 0 && (
                            <div className="text-[10px] text-neutral-500">
                              soit {formatEuro(r.savings)} d'économie
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-display text-[14px] font-extrabold tabular-nums">
                          <span
                            className={cn(
                              r.net > 0
                                ? "text-primary-700"
                                : "text-neutral-500"
                            )}
                          >
                            {r.net > 0 ? "+" : ""}
                            {formatEuro(r.net)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[12.5px] leading-relaxed text-neutral-600">
              Avec{" "}
              <strong className="text-neutral-900">{bestRow.plan.name}</strong>{" "}
              tu payes{" "}
              <strong className="text-primary-700 tabular-nums">
                {formatEuro(bestRow.total)}
              </strong>{" "}
              au lieu de{" "}
              <strong className="tabular-nums text-neutral-900">
                {formatEuro(baseTotal)}
              </strong>{" "}
              — soit{" "}
              <strong className="text-primary-700 tabular-nums">
                {formatEuro(bestRow.savings)}
              </strong>{" "}
              d'économie sur cette seule commande
              {bestRow.plan.priceMonthly > 0 && (
                <>
                  {" "}(et{" "}
                  <strong className="tabular-nums text-primary-700">
                    {formatEuro(bestRow.net)}
                  </strong>{" "}
                  net après ton abonnement de {bestRow.plan.priceMonthly} €)
                </>
              )}
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{children}</span>
    </div>
  );
}
