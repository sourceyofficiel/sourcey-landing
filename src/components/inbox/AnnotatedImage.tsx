"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/lib/attachments";

/**
 * Rendered inside a message bubble. Shows the image with numbered pins
 * overlaid. Click → opens fullscreen lightbox with pin comments visible.
 */
export function AnnotatedImage({ attachment }: { attachment: Attachment }) {
  const [open, setOpen] = useState(false);
  const annotations = attachment.annotations ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block overflow-hidden rounded-xl border border-neutral-200 transition-transform hover:scale-[1.01]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name ?? ""}
          className="h-40 max-w-[260px] object-cover"
          loading="lazy"
        />
        {annotations.map((pin, i) => (
          <span
            key={pin.id}
            className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
          >
            {i + 1}
          </span>
        ))}
        {annotations.length > 0 && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <MessageCircle className="h-3 w-3" />
            {annotations.length}
          </span>
        )}
      </button>

      {annotations.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {annotations.map((pin, i) => (
            <li
              key={pin.id}
              className="flex items-start gap-1.5 text-[12px] text-neutral-600"
            >
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary-100 text-[9px] font-bold text-primary-700">
                {i + 1}
              </span>
              <span>{pin.comment}</span>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {open && (
          <Lightbox attachment={attachment} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function Lightbox({
  attachment,
  onClose,
}: {
  attachment: Attachment;
  onClose: () => void;
}) {
  const annotations = attachment.annotations ?? [];
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-neutral-900/90 backdrop-blur"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name ?? ""}
          className="max-h-[85vh] max-w-[90vw] rounded-2xl"
        />
        {annotations.map((pin, i) => (
          <PinWithComment key={pin.id} pin={pin} index={i + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function PinWithComment({
  pin,
  index,
}: {
  pin: { id: string; x: number; y: number; comment: string };
  index: number;
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
    >
      <span className="absolute -left-4 -top-4 grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-lg ring-2 ring-white">
        {index}
      </span>
      <div className="absolute left-6 top-6 w-64 rounded-2xl border border-white/20 bg-white p-3 shadow-2xl">
        <p className="text-[13px] leading-relaxed text-neutral-700">
          {pin.comment}
        </p>
      </div>
    </div>
  );
}
