"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ChipGroup — sélecteur de valeur(s) sous forme de pastilles cliquables.
 *
 * - mode "single" : remplace la valeur active (radio)
 * - mode "multi"  : toggle la valeur dans le set (checkboxes)
 *
 * État actif visuel : fond primary-50, border primary-300, texte primary-700,
 * icône check à droite. Transitions douces.
 */

type ChipGroupProps<T extends string> = {
  options: readonly T[];
  /** Si single → string | undefined. Si multi → string[]. */
  value: T | T[] | undefined;
  onChange: (next: T | T[]) => void;
  mode: "single" | "multi";
  /** Petit label en haut (label sémantique) */
  label?: string;
  /** Texte d'aide affiché en gris sous le label */
  hint?: string;
  /** Marquer comme requis (étoile rouge) */
  required?: boolean;
  /** Message d'erreur affiché sous le groupe */
  error?: string;
};

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  mode,
  label,
  hint,
  required,
  error,
}: ChipGroupProps<T>) {
  const isActive = (opt: T) => {
    if (mode === "single") return value === opt;
    return Array.isArray(value) && value.includes(opt);
  };

  const handleClick = (opt: T) => {
    if (mode === "single") {
      onChange(opt);
    } else {
      const current = (Array.isArray(value) ? value : []) as T[];
      const next = current.includes(opt)
        ? current.filter((v) => v !== opt)
        : [...current, opt];
      onChange(next);
    }
  };

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-baseline justify-between">
          <label className="block text-[13.5px] font-semibold text-neutral-800">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
          </label>
          {mode === "multi" && (
            <span className="text-[10.5px] uppercase tracking-wider text-neutral-400">
              Plusieurs choix
            </span>
          )}
        </div>
      )}

      {hint && (
        <p className="mb-2.5 text-[12px] leading-relaxed text-neutral-500">
          {hint}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isActive(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleClick(opt)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-150",
                "hover:-translate-y-px",
                active
                  ? "border-primary-300 bg-primary-50 text-primary-700 shadow-[0_2px_4px_-1px_rgba(37,99,235,0.15)]"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
              )}
              aria-pressed={active}
            >
              {active && (
                <Check className="h-3 w-3 text-primary-600" strokeWidth={3} />
              )}
              {opt}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-[12px] font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}
