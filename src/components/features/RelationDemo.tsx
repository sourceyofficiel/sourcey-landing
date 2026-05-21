"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  TrendingUp,
  MessagesSquare,
  Calendar,
  ArrowRight,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Product = {
  id: string;
  name: string;
  variant: string;
  lastOrderQty: number;
  lastOrderDate: string;
  unitPrice: number;
  status: "stock-low" | "in-stock" | "trending";
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Chouchous velours côtelé",
    variant: "Rose pâle · pack de 3",
    lastOrderQty: 500,
    lastOrderDate: "12 mars",
    unitPrice: 4.2,
    status: "stock-low",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Sac à dos toile recyclée",
    variant: "Beige · 12L",
    lastOrderQty: 200,
    lastOrderDate: "28 février",
    unitPrice: 8.9,
    status: "in-stock",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Tote bag personnalisé",
    variant: "Logo brodé · noir",
    lastOrderQty: 300,
    lastOrderDate: "5 janvier",
    unitPrice: 3.1,
    status: "trending",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80&auto=format&fit=crop",
  },
];

export function RelationDemo() {
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [reorderedIds, setReorderedIds] = useState<Set<string>>(new Set());

  function handleReorder(id: string) {
    if (reorderingId || reorderedIds.has(id)) return;
    setReorderingId(id);
    setTimeout(() => {
      setReorderedIds((prev) => new Set(prev).add(id));
      setReorderingId(null);
    }, 1400);
  }

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Account manager</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Un humain dédié, pour la durée.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Pas de ticket support qui change de main. Ton account manager
          connaît tes produits, tes habitudes, tes contraintes — et anticipe
          les réassorts.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1100px] items-start gap-6 md:grid-cols-[360px_1fr]">
        {/* AM Card */}
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
          {/* Hero strip */}
          <div className="relative h-24 bg-gradient-to-br from-primary-500 to-primary-700">
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(255,255,255,.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.3) 0%, transparent 40%)",
              }}
            />
          </div>

          <div className="-mt-10 px-6 pb-6">
            {/* Avatar */}
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&face=true"
                alt="Sophie L., account manager Sourcey"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-neutral-900">
                  Sophie L.
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  en ligne
                </span>
              </div>
              <div className="mt-0.5 text-[12.5px] text-neutral-500">
                Account Manager · Paris
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-y border-neutral-100 py-3 text-center">
              <div>
                <div className="font-display text-[16px] font-extrabold text-neutral-900">
                  4
                </div>
                <div className="text-[10.5px] text-neutral-500">ans expé</div>
              </div>
              <div>
                <div className="font-display text-[16px] font-extrabold text-neutral-900">
                  87
                </div>
                <div className="text-[10.5px] text-neutral-500">clients suivis</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-0.5 font-display text-[16px] font-extrabold text-neutral-900">
                  4.9
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-[10.5px] text-neutral-500">note moy.</div>
              </div>
            </div>

            {/* Expertise */}
            <div className="mt-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                Spécialités
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Textile", "Accessoires", "Maison/déco", "Mandarin"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <MessagesSquare className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Calendar className="h-3.5 w-3.5" />
                Call 15 min
              </button>
            </div>
          </div>

          {/* Testimonial */}
          <div className="border-t border-neutral-100 bg-neutral-50/60 px-6 py-4">
            <div className="flex items-start gap-2 text-[12.5px] italic leading-relaxed text-neutral-600">
              <span className="font-serif text-[24px] leading-none text-primary-500">
                "
              </span>
              <span>
                Sophie connaît mes produits mieux que moi. Quand je lance une
                nouvelle gamme, elle anticipe la moitié des questions.
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-neutral-500">
              — Marie D., e-commerçante (4 produits actifs)
            </div>
          </div>
        </div>

        {/* Reorder dashboard */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                <RotateCcw className="h-3 w-3" />
                Mes réassorts
              </div>
              <h3 className="mt-3 font-display text-[20px] font-extrabold leading-tight text-neutral-900">
                Tes produits Sourcey
              </h3>
              <p className="mt-1 text-[12.5px] text-neutral-500">
                Réassort en 1 clic. Sophie prépare le devis sous 24h.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {PRODUCTS.map((p) => {
              const isReordering = reorderingId === p.id;
              const isDone = reorderedIds.has(p.id);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  </div>

                  {/* Infos */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-[13.5px] font-semibold text-neutral-900">
                        {p.name}
                      </div>
                      {p.status === "stock-low" && (
                        <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-rose-700">
                          Stock bas
                        </span>
                      )}
                      {p.status === "trending" && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-700">
                          <TrendingUp className="h-2.5 w-2.5" />
                          Tendance
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-neutral-500">
                      {p.variant} · {p.lastOrderQty} unités · {p.unitPrice.toFixed(2)}€
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-neutral-400">
                      Dernière commande : {p.lastOrderDate}
                    </div>
                  </div>

                  {/* Reorder button */}
                  <button
                    type="button"
                    onClick={() => handleReorder(p.id)}
                    disabled={isReordering || isDone}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
                      isDone
                        ? "bg-green-100 text-green-700"
                        : isReordering
                          ? "bg-neutral-100 text-neutral-400"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isDone ? (
                        <motion.span
                          key="done"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                          Envoyé
                        </motion.span>
                      ) : isReordering ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-flex items-center gap-1"
                        >
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="block h-3 w-3 rounded-full border-2 border-neutral-300 border-t-neutral-500"
                          />
                          Envoi…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-flex items-center gap-1"
                        >
                          Réassort
                          <ArrowRight className="h-3 w-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Sophie's note */}
          <AnimatePresence>
            {reorderedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50/50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="text-[12.5px] leading-relaxed text-neutral-700">
                  <strong className="text-neutral-900">Sophie te répondra dans la matinée.</strong>{" "}
                  Elle a vu que c'est ton 3e réassort du même produit — elle va
                  proposer un MOQ plus élevé pour baisser encore le prix unitaire.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
