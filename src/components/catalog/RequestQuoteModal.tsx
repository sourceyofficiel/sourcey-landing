"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  Package,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/lib/types/products";

interface Props {
  product: ProductDetail;
  open: boolean;
  onClose: () => void;
  initialType?: "quote" | "sample";
}

export function RequestQuoteModal({
  product,
  open,
  onClose,
  initialType = "quote",
}: Props) {
  const router = useRouter();
  const [type, setType] = useState<"quote" | "sample">(initialType);
  const [quantity, setQuantity] = useState<string>(String(product.moq));
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/products/${product.slug}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          quantity: type === "quote" && quantity ? Number(quantity) : undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      // Push to the new chat thread
      router.push("/app/inbox");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] grid place-items-end bg-neutral-900/60 backdrop-blur-sm sm:place-items-center"
          onClick={onClose}
          role="dialog"
          aria-modal
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Product summary */}
            <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/40 p-5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src={product.mainImage}
                  alt={product.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neutral-900">
                  {product.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  Avec{" "}
                  <strong className="font-semibold text-neutral-700">
                    {product.agentName}
                  </strong>{" "}
                  · {product.agentCity}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                1. Type de demande
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <TypeButton
                  active={type === "quote"}
                  onClick={() => setType("quote")}
                  label="Devis volume"
                  sub={`MOQ ${product.moq}`}
                />
                <TypeButton
                  active={type === "sample"}
                  onClick={() => setType("sample")}
                  label="Échantillon"
                  sub={
                    product.samplePrice
                      ? `~${product.samplePrice}€`
                      : "Tarif sur demande"
                  }
                />
              </div>

              {type === "quote" && (
                <label className="mt-5 block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    2. Quantité visée
                  </span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Package className="h-4 w-4 text-neutral-400" />
                    <input
                      type="number"
                      min={product.moq}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-[14px] text-neutral-900 focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100/60"
                    />
                    <span className="text-xs text-neutral-500">unités</span>
                  </div>
                </label>
              )}

              <label className="mt-5 block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {type === "quote" ? "3. " : "2. "}Message à{" "}
                  {product.agentName.split(" ")[0]} (optionnel)
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    type === "sample"
                      ? "Précise tes attentes (variante de couleur, finition spécifique, packaging…) — optionnel"
                      : "Personnalisations souhaitées, contraintes, deadlines…"
                  }
                  className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100/60"
                />
              </label>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center">
                <div className="text-xs text-neutral-500">
                  Un thread est créé direct avec{" "}
                  <strong className="text-neutral-700">
                    {product.agentName.split(" ")[0]}
                  </strong>{" "}
                  dans ta messagerie.
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} />
                      Envoyer la demande
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypeButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-all",
        active
          ? "border-primary-300 bg-primary-50/60 ring-2 ring-primary-100"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      )}
    >
      <span className="text-sm font-bold text-neutral-900">{label}</span>
      <span className="text-xs text-neutral-500">{sub}</span>
    </button>
  );
}
