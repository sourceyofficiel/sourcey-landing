"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Users, ShieldCheck, Clock } from "lucide-react";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Footer } from "@/components/v2/V2Footer";
import { Container } from "@/components/ui/Container";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AuroraText } from "@/components/ui/aurora-text";
import { MatchForm } from "@/components/match/MatchForm";
import { MatchLoading } from "@/components/match/MatchLoading";
import { MatchResults } from "@/components/match/MatchResults";
import { cn } from "@/lib/utils";
import type { AgentMatch, BriefAnalysis } from "@/lib/agent-matching";

type Stage = "form" | "loading" | "results";

interface MatchResponse {
  analysis: BriefAnalysis;
  matches: AgentMatch[];
  totalCandidates: number;
}

export default function MatchPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);

  async function handleSubmit(description: string, quantity?: number) {
    setError(null);
    setStage("loading");

    // Show the multi-step loader for ~3 seconds even if the API is fast
    const minLoaderTime = new Promise<void>((r) => setTimeout(r, 3200));

    try {
      const [res] = await Promise.all([
        fetch("/api/match-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, targetQuantity: quantity }),
        }),
        minLoaderTime,
      ]);
      const data = (await res.json()) as MatchResponse | { error: string };
      if (!res.ok) throw new Error((data as { error: string }).error);
      setResult(data as MatchResponse);
      setStage("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setStage("form");
    }
  }

  function reset() {
    setResult(null);
    setStage("form");
  }

  return (
    <main className="min-h-screen bg-white">
      <V2Nav />

      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/30 via-white to-white pt-10 md:pt-16">
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.1}
          duration={4}
          className={cn(
            "[mask-image:radial-gradient(560px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12 text-primary-500/40"
          )}
        />
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary-200/30 blur-[120px]" />

        <Container size="default">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Sourcey IA · Gratuit
            </span>
            <h1 className="mt-5 font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
              Trouve l'agent idéal pour ton projet en{" "}
              <AuroraText
                colors={["#3B82F6", "#2563EB", "#9333EA", "#60A5FA"]}
              >
                5 secondes
              </AuroraText>
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-neutral-600">
              Décris ce que tu veux sourcer en quelques mots. Notre IA compare
              nos 14 agents sur 8 critères (spécialité, ville, expérience,
              disponibilité…) et te ramène le top 3.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500">
              <TrustItem icon={Clock} text="< 5s d'analyse" />
              <TrustItem icon={Users} text="14 agents vérifiés" />
              <TrustItem icon={ShieldCheck} text="Sans inscription" />
            </div>
          </motion.div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnimatePresence mode="wait">
              {stage === "form" && (
                <motion.div key="form">
                  <MatchForm
                    onSubmit={handleSubmit}
                    loading={false}
                    error={error}
                  />
                </motion.div>
              )}
              {stage === "loading" && (
                <motion.div key="loading">
                  <MatchLoading />
                </motion.div>
              )}
              {stage === "results" && result && (
                <motion.div key="results" className="max-w-none">
                  <div className="mx-auto max-w-6xl">
                    <MatchResults
                      analysis={result.analysis}
                      matches={result.matches}
                      totalCandidates={result.totalCandidates}
                      onReset={reset}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      <V2Footer />
    </main>
  );
}

function TrustItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-primary-600" />
      {text}
    </span>
  );
}
