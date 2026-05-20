"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { comparisonRows } from "@/lib/data/comparison";
import { Logo } from "@/components/ui/Logo";
import { fadeUp, viewportOnce } from "@/lib/motion";

const COMPETITORS = [
  { key: "sourcey", name: "Sourcey", featured: true },
  { key: "cj", name: "CJ Dropshipping" },
  { key: "spocket", name: "Spocket" },
  { key: "alibaba", name: "Alibaba" },
  { key: "freelance", name: "Agent freelance" },
];

export function Comparison() {
  return (
    <Section id="comparison" className="bg-neutral-50">
      <Container>
        <SectionHeading
          eyebrow="Comparaison"
          title={
            <>
              Pourquoi <span className="text-primary-600">Sourcey</span> et pas
              les autres ?
            </>
          }
          description="On a fait l'exercice pour toi. Sourcey est le seul à cocher chaque case importante pour un e-commerçant francophone."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7 }}
          className="mt-12 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/60">
                  <th className="sticky left-0 z-10 bg-neutral-50/60 px-5 py-5 text-left text-sm font-semibold text-neutral-700">
                    Critère
                  </th>
                  {COMPETITORS.map((c) => (
                    <th
                      key={c.key}
                      className={`px-3 py-5 text-center text-sm font-bold ${
                        c.featured
                          ? "bg-primary-50/60 text-primary-700"
                          : "text-neutral-700"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        {c.featured ? (
                          <Logo variant="mark" height={28} />
                        ) : (
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-200 text-[10px] font-bold text-neutral-500">
                            {c.name[0]}
                          </span>
                        )}
                        <span className="text-xs">{c.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <motion.tr
                    key={row.label}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    custom={i * 0.5}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="sticky left-0 z-10 bg-white px-5 py-4 text-left text-sm font-medium text-neutral-700">
                      {row.label}
                    </td>
                    {COMPETITORS.map((c) => (
                      <td
                        key={c.key}
                        className={`px-3 py-4 text-center ${
                          c.featured ? "bg-primary-50/30" : ""
                        }`}
                      >
                        <Cell value={row[c.key as keyof typeof row] as boolean | string} featured={c.featured} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

function Cell({ value, featured }: { value: boolean | string; featured?: boolean }) {
  if (value === true) {
    return (
      <span
        className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${
          featured ? "bg-primary-600 text-white" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-neutral-400">
        <X className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
      {value}
    </span>
  );
}
