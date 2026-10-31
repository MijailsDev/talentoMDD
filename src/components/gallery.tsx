"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/types";

export function Gallery({ items, company }: { items: GalleryItem[]; company: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const openedAt = useRef(0);
  // Foto a la que ya se está yendo: así dos pulsaciones seguidas avanzan dos fotos
  const heading = useRef<number | null>(null);
  const pressedBackdrop = useRef(false);
  const open = idx !== null;

  // Antes de pintar: abre ya en la foto pulsada, sin que se vea el recorrido
  useLayoutEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    if (!dialog.current?.open) dialog.current?.showModal();
    const t = track.current;
    t?.scrollTo({ left: t.clientWidth * openedAt.current, behavior: "instant" });
  }, [open]);

  const move = useCallback((delta: number) => {
    const t = track.current;
    if (!t) return;
    const from = heading.current ?? Math.round(t.scrollLeft / t.clientWidth);
    const to = (from + delta + items.length) % items.length;
    heading.current = to;
    t.scrollTo({ left: t.clientWidth * to });
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      move(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, move]);

  if (!items.length) return null;

  const show = (i: number) => {
    openedAt.current = i;
    heading.current = null;
    setIdx(i);
  };
  // El dedo, las flechas y el teclado mueven la fila; el contador solo la lee
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    setIdx(i);
    if (i === heading.current) heading.current = null;
  };
  // Cierra solo si el toque empezó y terminó fuera: arrastrar desde la foto no lo cierra
  const onClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (pressedBackdrop.current && e.target === e.currentTarget) setIdx(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((g, i) => (
          <button key={g.url + i} type="button" onClick={() => show(i)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl" aria-label={`Ampliar foto: ${g.label}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={`${company}: ${g.label}`} loading="lazy" className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-110" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-semibold capitalize text-white">{g.label}</span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} onClose={() => setIdx(null)} onPointerDown={(e) => { pressedBackdrop.current = e.target === e.currentTarget; }} onClick={onClick} className="m-auto max-h-[92vh] w-[min(1000px,calc(100vw-24px))] overflow-hidden rounded-[22px] bg-dark p-0 backdrop:bg-dark/80">
        {open && (
          <figure className="relative">
            {/* Primero en el DOM para recibir el foco al abrir; se ve arriba a la derecha */}
            <button type="button" onClick={() => setIdx(null)} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink" aria-label="Cerrar"><X /></button>
            <div
              ref={track}
              data-track
              tabIndex={-1}
              onScroll={onScroll}
              onPointerDown={() => { heading.current = null; }}
              className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((g, i) => (
                <div key={g.url + i} className="aspect-[4/3] max-h-[82vh] w-full shrink-0 snap-center snap-always">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={`${company}: ${g.label}`} className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
            <figcaption className="px-5 py-3 text-sm capitalize text-white/85">{items[idx].label} · {idx + 1} de {items.length}</figcaption>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink" aria-label="Anterior"><ChevronLeft /></button>
                <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink" aria-label="Siguiente"><ChevronRight /></button>
              </>
            )}
          </figure>
        )}
      </dialog>
    </>
  );
}
