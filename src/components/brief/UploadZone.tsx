"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@/types/brief";

/**
 * UploadZone — drag&drop + click-to-upload, conversion en base64 inline.
 *
 * Les images sont converties en base64 et stockées tel quel dans le state
 * du formulaire parent (pas de Cloudinary / Vercel Blob pour ce MVP).
 * Limite de taille hardcodée pour éviter de gonfler la DB.
 */

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type UploadZoneProps = {
  files: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  /** Types MIME acceptés (ex: "image/*,application/pdf") */
  accept?: string;
  /** Label */
  label?: string;
  /** Hint sous le label */
  hint?: string;
  /** "image" → preview thumbnail, "doc" → badge fichier */
  variant?: "image" | "doc";
  /** Limit de fichiers (ex: 5) */
  maxFiles?: number;
};

export function UploadZone({
  files,
  onChange,
  accept = "image/*",
  label,
  hint,
  variant = "image",
  maxFiles = 8,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const incoming: FileAttachment[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_SIZE_BYTES) {
        setError(`${file.name} dépasse ${MAX_SIZE_MB} Mo.`);
        continue;
      }
      try {
        const dataUrl = await readAsDataUrl(file);
        incoming.push({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        });
      } catch {
        setError(`Impossible de lire ${file.name}.`);
      }
    }

    const merged = [...files, ...incoming].slice(0, maxFiles);
    onChange(merged);
  }

  function removeAt(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {label && (
        <label className="mb-2 block text-[13.5px] font-semibold text-neutral-800">
          {label}
        </label>
      )}
      {hint && (
        <p className="mb-2.5 text-[12px] leading-relaxed text-neutral-500">
          {hint}
        </p>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-primary-400 bg-primary-50/60"
            : "border-neutral-200 bg-neutral-50/40 hover:border-neutral-300 hover:bg-neutral-50"
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            dragOver
              ? "bg-primary-100 text-primary-600"
              : "bg-neutral-100 text-neutral-500"
          )}
        >
          <Upload className="h-5 w-5" />
        </span>
        <p className="text-[13px] font-semibold text-neutral-700">
          Clique ou glisse-dépose tes fichiers
        </p>
        <p className="text-[11.5px] text-neutral-500">
          Jusqu&apos;à {maxFiles} fichiers · {MAX_SIZE_MB} Mo max chacun
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-[12px] font-medium text-rose-600">{error}</p>
      )}

      {/* Previews */}
      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {files.map((f, i) => (
              <motion.li
                key={`${f.name}-${i}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                {variant === "image" && f.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.dataUrl}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-50 text-neutral-500">
                    {f.type === "application/pdf" ? (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                        PDF
                      </span>
                    ) : f.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="px-0.5 text-center text-[8px] leading-tight">
                      {f.name.slice(0, 8)}…
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  aria-label={`Supprimer ${f.name}`}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
