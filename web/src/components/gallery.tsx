"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/types";

export function Gallery({ items, company }: { items: GalleryItem[]; company: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (idx !== null && !dialog.current?.open) dialog.current?.showModal();
    if (idx === null) dialog.current?.close();
  }, [idx]);

  useEffect(() => {
    if (idx === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [idx, items.length]);

  if (!items.length) return null;
  const cur = idx !== null ? items[idx] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((g, i) => (
          <button key={g.url + i} type="button" onClick={() => setIdx(i)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl" aria-label={`Ampliar foto: ${g.label}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={`${company}: ${g.label}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-semibold capitalize text-white">{g.label}</span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} onClose={() => setIdx(null)} className="m-auto max-h-[92vh] w-[min(1000px,calc(100vw-24px))] overflow-hidden rounded-[22px] bg-dark p-0 backdrop:bg-dark/80">
        {cur && (
          <figure className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.url} alt={`${company}: ${cur.label}`} className="max-h-[82vh] w-full object-contain" />
            <figcaption className="px-5 py-3 text-sm capitalize text-white/85">{cur.label} · {idx! + 1} de {items.length}</figcaption>
            <button type="button" onClick={() => setIdx(null)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink" aria-label="Cerrar"><X /></button>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => setIdx((idx! - 1 + items.length) % items.length)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink" aria-label="Anterior"><ChevronLeft /></button>
                <button type="button" onClick={() => setIdx((idx! + 1) % items.length)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink" aria-label="Siguiente"><ChevronRight /></button>
              </>
            )}
          </figure>
        )}
      </dialog>
    </>
  );
}
