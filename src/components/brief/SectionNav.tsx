"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_LABELS } from "@/types/brief";

/**
 * SectionNav — 6 pills horizontales pour naviguer entre sections,
 * avec indicateur "complete" (vert check) quand la section est remplie.
 */

type SectionNavProps = {
  /** Section actuellement affichée (1-6) */
  current: number;
  /** Set des sections complétées (tous les champs required remplis) */
  completed: Set<number>;
  onJump: (section: number) => void;
};

export function SectionNav({ current, completed, onJump }: SectionNavProps) {
  const sections = Object.keys(SECTION_LABELS).map(Number);

  return (
    <nav
      aria-label="Sections du brief"
      className="-mx-5 overflow-x-auto px-5 py-3 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="mx-auto flex max-w-[760px] items-center gap-2 whitespace-nowrap">
        {sections.map((n) => {
          const isCurrent = n === current;
          const isDone = completed.has(n);
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onJump(n)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-150",
                  isCurrent
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : isDone
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    isCurrent
                      ? "bg-primary-600 text-white"
                      : isDone
                        ? "bg-green-600 text-white"
                        : "bg-neutral-200 text-neutral-600"
                  )}
                >
                  {isDone && !isCurrent ? (
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  ) : (
                    n
                  )}
                </span>
                {SECTION_LABELS[n]}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
