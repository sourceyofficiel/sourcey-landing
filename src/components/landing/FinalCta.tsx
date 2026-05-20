"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { fadeUp, viewportOnce } from "@/lib/motion";

type Status = "idle" | "loading" | "success" | "error";

export function FinalCta() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "final-cta" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setStatus("success");
      setEmail("");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <Section className="pb-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-10 text-white shadow-brand md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-400/40 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-300/40 blur-3xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur"
              >
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-300" />
                Beta privée · Places limitées
              </motion.div>

              <h2 className="mt-5 font-display text-[clamp(30px,4vw,48px)] font-extrabold leading-[1.05] tracking-tight">
                Prêt à laisser tomber Alibaba ?
              </h2>
              <p className="mt-4 max-w-md text-lg text-white/85">
                Rejoins la waitlist. On t'envoie ton accès dès qu'on ouvre une
                place, et un guide PDF du sourcing en Chine en bonus.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
                {[
                  "Sans carte bancaire",
                  "Annulation en 1 clic",
                  "Support 100% FR",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <motion.form
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={1}
              onSubmit={onSubmit}
              className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="ton@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="h-12 flex-1 rounded-xl border-0 bg-white/95 px-4 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button
                  type="submit"
                  variant="dark"
                  size="lg"
                  className="h-12 shrink-0"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inscription…
                    </>
                  ) : status === "success" ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} />
                      Inscrit !
                    </>
                  ) : (
                    <>
                      Rejoindre
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div
                className={cn(
                  "mt-3 flex items-center gap-2 px-1 text-xs",
                  status === "error" ? "text-amber-200" : "text-white/70"
                )}
              >
                {status === "error" ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </>
                ) : status === "success" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    Bienvenue ! Vérifie ta boîte mail dans 2 min.
                  </>
                ) : (
                  <>247 inscrits · Tu rejoins une communauté triée sur le volet.</>
                )}
              </div>
            </motion.form>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
