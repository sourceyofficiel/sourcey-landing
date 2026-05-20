"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Paperclip,
  Loader2,
  Sparkles,
  X,
  Pin,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageAnnotator } from "./ImageAnnotator";
import type { Attachment, AttachmentAnnotation } from "@/lib/attachments";

interface Props {
  onSend: (content: string, attachments?: Attachment[]) => Promise<void> | void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  suggestions?: string[];
  suggestionsLoading?: boolean;
  onUseSuggestion?: () => void;
}

export function Composer({
  onSend,
  disabled,
  sending,
  placeholder = "Tape ton message…",
  suggestions = [],
  suggestionsLoading,
  onUseSuggestion,
}: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 6 * 24 + 16);
    ta.style.height = `${next}px`;
  }, [value]);

  async function handleSubmit() {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || disabled || sending) return;
    const att = attachments.slice();
    setValue("");
    setAttachments([]);
    await onSend(trimmed, att.length > 0 ? att : undefined);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = ""; // reset so re-selecting same file fires change
    setError(null);
    setUploadingCount((c) => c + files.length);
    try {
      const uploaded = await Promise.all(
        files.map(async (f): Promise<Attachment | null> => {
          const fd = new FormData();
          fd.append("file", f);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Upload failed");
          return {
            url: data.url,
            name: data.name,
            mime: data.mime,
          };
        })
      );
      setAttachments((prev) => [
        ...prev,
        ...uploaded.filter((a): a is Attachment => !!a),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploadingCount(0);
    }
  }

  function removeAttachment(i: number) {
    setAttachments((a) => a.filter((_, idx) => idx !== i));
  }

  function applySuggestion(s: string) {
    setValue(s);
    onUseSuggestion?.();
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function saveAnnotations(idx: number, anns: AttachmentAnnotation[]) {
    setAttachments((arr) =>
      arr.map((a, i) => (i === idx ? { ...a, annotations: anns } : a))
    );
    setAnnotatingIndex(null);
  }

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    !disabled &&
    !sending &&
    uploadingCount === 0;

  return (
    <div className="border-t border-neutral-100 bg-white">
      {/* Smart suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 pt-2"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-700">
                <Sparkles className="h-2.5 w-2.5" />
                Suggéré
              </span>
              <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {suggestionsLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 w-32 shrink-0 animate-pulse rounded-full bg-neutral-100"
                      />
                    ))
                  : suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12.5px] font-medium text-neutral-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                      >
                        {s}
                      </button>
                    ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment previews */}
      <AnimatePresence>
        {(attachments.length > 0 || uploadingCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-neutral-100 px-3 py-2"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div
                  key={`${att.url}-${i}`}
                  className="relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.name ?? ""}
                    className="h-full w-full object-cover"
                  />
                  {att.annotations && att.annotations.length > 0 && (
                    <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      <Pin className="h-2 w-2" />
                      {att.annotations.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setAnnotatingIndex(i)}
                    aria-label="Annoter"
                    className="absolute inset-0 grid place-items-center bg-neutral-900/0 text-white opacity-0 transition-all hover:bg-neutral-900/60 hover:opacity-100"
                  >
                    <span className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-neutral-900">
                      ✏️ Annoter
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    aria-label="Retirer"
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-neutral-900/70 text-white hover:bg-neutral-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {uploadingCount > 0 &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div
                    key={`up-${i}`}
                    className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  </div>
                ))}
            </div>
            {error && (
              <p className="mt-1.5 text-[11px] text-amber-700">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer row */}
      <div className="p-3 md:p-4">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-2 transition-all",
            "focus-within:border-primary-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-100/60"
          )}
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Joindre une image"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-700"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Message"
            className={cn(
              "min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[14.5px] leading-snug text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            aria-label="Envoyer"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all",
              canSend
                ? "bg-primary-600 text-white shadow-brand hover:bg-primary-700"
                : "bg-neutral-200 text-neutral-400"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 px-1 text-[10.5px] text-neutral-400">
          <ImageIcon className="inline h-2.5 w-2.5" /> Joindre une image · ✏️ Click pour annoter · Entrée pour envoyer
        </p>
      </div>

      {/* Annotation modal */}
      <AnimatePresence>
        {annotatingIndex !== null && attachments[annotatingIndex] && (
          <ImageAnnotator
            imageUrl={attachments[annotatingIndex].url}
            initialAnnotations={attachments[annotatingIndex].annotations}
            onSave={(anns) => saveAnnotations(annotatingIndex, anns)}
            onClose={() => setAnnotatingIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
