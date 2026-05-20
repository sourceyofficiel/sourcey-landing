"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Trash2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttachmentAnnotation } from "@/lib/attachments";

function uid() {
  return `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  imageUrl: string;
  initialAnnotations?: AttachmentAnnotation[];
  onSave: (annotations: AttachmentAnnotation[]) => void;
  onClose: () => void;
}

export function ImageAnnotator({
  imageUrl,
  initialAnnotations,
  onSave,
  onClose,
}: Props) {
  const [annotations, setAnnotations] = useState<AttachmentAnnotation[]>(
    initialAnnotations ?? []
  );
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePinId) setActivePinId(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePinId, onClose]);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return;
    if (activePinId) return; // ignore if editing
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const newPin: AttachmentAnnotation = {
      id: uid(),
      x,
      y,
      comment: "",
    };
    setAnnotations((a) => [...a, newPin]);
    setActivePinId(newPin.id);
  }

  function updatePinComment(id: string, comment: string) {
    setAnnotations((a) =>
      a.map((p) => (p.id === id ? { ...p, comment } : p))
    );
  }

  function deletePin(id: string) {
    setAnnotations((a) => a.filter((p) => p.id !== id));
    setActivePinId(null);
  }

  function handleSave() {
    // Remove any pin without a comment
    const cleaned = annotations.filter((a) => a.comment.trim().length > 0);
    onSave(cleaned);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col bg-neutral-900/95 backdrop-blur"
      role="dialog"
      aria-modal
      aria-label="Annoter l'image"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <Pin className="h-4 w-4 text-primary-300" />
          <h3 className="text-sm font-bold text-white">Annoter l'image</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80">
            {annotations.length} point{annotations.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-bold text-white shadow-brand transition-colors hover:bg-primary-700"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Valider {annotations.length > 0 && `(${annotations.length})`}
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-5">
        <div
          ref={imgRef}
          className="relative max-h-full max-w-full cursor-crosshair"
          onClick={handleImageClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="À annoter"
            className="max-h-[78vh] max-w-full select-none rounded-2xl shadow-2xl"
            draggable={false}
          />

          {annotations.map((pin, i) => (
            <Pin3D
              key={pin.id}
              pin={pin}
              index={i + 1}
              active={activePinId === pin.id}
              onActivate={() => setActivePinId(pin.id)}
              onClose={() => setActivePinId(null)}
              onUpdate={(c) => updatePinComment(pin.id, c)}
              onDelete={() => deletePin(pin.id)}
            />
          ))}
        </div>
      </div>

      <footer className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/60">
        💡 Clique n'importe où sur l'image pour ajouter un point ·{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
          Esc
        </kbd>{" "}
        pour fermer
      </footer>
    </motion.div>
  );
}

function Pin3D({
  pin,
  index,
  active,
  onActivate,
  onClose,
  onUpdate,
  onDelete,
}: {
  pin: AttachmentAnnotation;
  index: number;
  active: boolean;
  onActivate: () => void;
  onClose: () => void;
  onUpdate: (comment: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "absolute -left-3.5 -top-3.5 grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white shadow-lg transition-transform",
          active
            ? "bg-primary-600 ring-4 ring-primary-400/40 scale-110"
            : "bg-primary-500 hover:scale-110"
        )}
      >
        {index}
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 top-4 w-64 rounded-2xl border border-white/20 bg-white p-3 shadow-2xl"
          >
            <textarea
              autoFocus
              value={pin.comment}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder="Ton commentaire (ex: change de couleur, broderie ici…)"
              rows={3}
              className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50/50 p-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-primary-700"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
