"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, CheckCheck, Phone, Video, MoreVertical, TrendingDown } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Msg = {
  from: "us" | "supplier" | "system";
  text: string;
  /** Optional time label */
  time?: string;
  /** Optional system pill style ("typing", "lang"...) */
  variant?: "typing" | "lang" | "milestone";
};

const SCRIPT: Msg[] = [
  { from: "system", text: "Sourcey ↔ Yiwu Textile Group", variant: "lang", time: "Aujourd'hui · 09:14" },
  {
    from: "us",
    text: "你好 Wang. 我们想下 500 件订单。能给到 3.80€ 一件吗？",
    time: "09:14",
  },
  {
    from: "supplier",
    text: "您好！3.80€ 太低了。最低 5.10€。",
    time: "09:15",
  },
  {
    from: "us",
    text: "其他工厂报 4.20€。如果是长期合作，4€ 可以吗？",
    time: "09:16",
  },
  { from: "system", text: "Wang est en train d'écrire…", variant: "typing" },
  {
    from: "supplier",
    text: "可以 4.20€。但 MOQ 必须 500。",
    time: "09:18",
  },
  {
    from: "us",
    text: "4.20€ pour MOQ 500 ✅. Échantillons gratuits + paiement 30/70. Deal ?",
    time: "09:19",
  },
  {
    from: "supplier",
    text: "成交！我马上发合同。",
    time: "09:20",
  },
  {
    from: "system",
    text: "Devis final envoyé au client · 4,20€ × 500 = 2 100€",
    variant: "milestone",
    time: "09:22",
  },
];

const TIMINGS: Record<number, number> = {
  // ms before each message renders
  0: 200,
  1: 600,
  2: 1300,
  3: 2200,
  4: 3000,
  5: 4200,
  6: 5200,
  7: 6300,
  8: 7400,
};

export function NegociationDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play once scrolled into view
  useEffect(() => {
    setVisibleCount(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    SCRIPT.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setVisibleCount(i + 1);
        }, TIMINGS[i] ?? i * 900)
      );
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [restartKey]);

  // Auto-scroll within the chat area
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Une négo en direct</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          On parle mandarin pour toi.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Voici une vraie négociation, rejouée. Prix initial 5,10€, prix final
          obtenu 4,20€. Le fournisseur n'aurait pas accepté avec un client
          européen qui parle anglais.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1100px] items-start gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        {/* WhatsApp phone mockup */}
        <div className="relative mx-auto w-full max-w-[420px]">
          {/* Phone frame */}
          <div className="relative overflow-hidden rounded-[44px] border-[8px] border-neutral-900 bg-neutral-900 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)]">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />

            {/* WhatsApp header */}
            <div className="relative flex items-center gap-3 bg-[#075E54] px-4 pb-3 pt-9 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[14px] font-bold">
                王
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-semibold">
                  Wang · Yiwu Textile
                </div>
                <div className="text-[11px] opacity-80">en ligne</div>
              </div>
              <Video className="h-4 w-4 opacity-90" />
              <Phone className="h-4 w-4 opacity-90" />
              <MoreVertical className="h-4 w-4 opacity-90" />
            </div>

            {/* Chat body */}
            <div
              ref={containerRef}
              className="relative h-[480px] overflow-y-auto bg-[#ECE5DD] px-3 py-4"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' /%3E%3CfeColorMatrix values='0 0 0 0 0.92 0 0 0 0 0.89 0 0 0 0 0.82 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
              }}
            >
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {SCRIPT.slice(0, visibleCount).map((m, i) => {
                    if (m.from === "system") {
                      if (m.variant === "typing") {
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-start"
                          >
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
                              <TypingDots />
                            </div>
                          </motion.div>
                        );
                      }
                      if (m.variant === "milestone") {
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="my-3 flex justify-center"
                          >
                            <div className="rounded-full bg-green-100 px-3 py-1 text-center text-[11px] font-semibold text-green-800">
                              {m.text}
                            </div>
                          </motion.div>
                        );
                      }
                      // default lang pill
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="my-2 flex justify-center"
                        >
                          <div className="rounded-full bg-white/80 px-3 py-1 text-[10.5px] font-semibold text-neutral-600">
                            {m.text}
                          </div>
                        </motion.div>
                      );
                    }

                    const isUs = m.from === "us";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className={`flex ${isUs ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13px] shadow-sm ${
                            isUs
                              ? "rounded-br-sm bg-[#DCF8C6] text-neutral-900"
                              : "rounded-bl-sm bg-white text-neutral-900"
                          }`}
                        >
                          <div className="break-words leading-snug">{m.text}</div>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-neutral-500">
                            {m.time}
                            {isUs && (
                              <CheckCheck className="h-3 w-3 text-[#4FC3F7]" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer (fake input) */}
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2">
              <div className="flex-1 rounded-full bg-white px-3 py-2 text-[11.5px] text-neutral-400">
                Message
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#075E54] text-white">
                <Check className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Restart button */}
          <button
            type="button"
            onClick={() => setRestartKey((k) => k + 1)}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 shadow-md hover:bg-neutral-50"
          >
            ↻ Rejouer
          </button>
        </div>

        {/* Right side: explanation */}
        <div className="max-w-[420px]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-7">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-inset ring-green-200">
              <TrendingDown className="h-3 w-3" />
              -17,6% obtenu
            </div>
            <h3 className="mt-4 font-display text-[22px] font-extrabold leading-tight text-neutral-900">
              5,10€ → 4,20€ par pièce
            </h3>
            <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-600">
              Sur une commande de 500 pièces, c'est 450€ d'économie en{" "}
              <strong>6 minutes de négo</strong>.
            </p>

            <div className="mt-6 space-y-4 border-t border-neutral-100 pt-5">
              <Lever
                title="Mandarin natif"
                description="Wang a baissé son prix dès le 1er message, parce qu'il a compris qu'on était sérieux."
              />
              <Lever
                title="Concurrence"
                description="On mentionne un autre fournisseur à 4,20€ — Wang s'aligne pour ne pas perdre la commande."
              />
              <Lever
                title="Long terme évoqué"
                description={`« Si c'est une coopération longue » — c'est LE levier qui débloque tout.`}
              />
            </div>
          </div>

          <p className="mt-4 text-center text-[11.5px] text-neutral-400">
            Conversation rejouée à partir d'un échange réel de mars 2026.
          </p>
        </div>
      </div>
    </section>
  );
}

function Lever({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
        ✓
      </span>
      <div>
        <div className="text-[13px] font-semibold text-neutral-900">{title}</div>
        <div className="mt-0.5 text-[12.5px] leading-snug text-neutral-500">
          {description}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="block h-1.5 w-1.5 rounded-full bg-neutral-400"
        />
      ))}
    </div>
  );
}
