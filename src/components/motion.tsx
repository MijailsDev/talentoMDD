"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/** Carrusel continuo con pausa visible: el movimiento automático debe poder detenerse (WCAG 2.2.2) */
export function Marquee({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="hidden md:block">
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee flex w-max gap-[18px] px-4 pb-4 pt-2" style={{ animationPlayState: paused ? "paused" : undefined }}>
          {children}
        </div>
      </div>
      {/* Con movimiento reducido el carrusel ya está quieto: no hace falta el botón */}
      <div className="container-x flex justify-end motion-reduce:hidden">
        <button type="button" onClick={() => setPaused((p) => !p)} className="btn-ghost">
          {paused ? <Play size={16} /> : <Pause size={16} />} {paused ? "Reanudar carrusel" : "Pausar carrusel"}
        </button>
      </div>
    </div>
  );
}

/** Aparición progresiva al entrar en pantalla */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return setVisible(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Contador que sube de 0 al valor final al entrar en pantalla; si ya está a la vista al cargar, se queda quieto para no parpadear */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let raf = 0;
    let first = true;
    const io = new IntersectionObserver(([e]) => {
      const visibleOnLoad = first && e.isIntersecting;
      first = false;
      if (visibleOnLoad) return io.disconnect();
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1000);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span ref={ref}>
      {n.toLocaleString("es-PE")}
      {suffix}
    </span>
  );
}

/** Parallax suave para la imagen principal */
export function Parallax({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => {
      // Tope de 40 px: es lo que sobra de la foto (-inset-y-10); más dejaría ver el fondo durazno
      if (ref.current) ref.current.style.transform = `translate3d(0, ${Math.min(window.scrollY * 0.12, 40)}px, 0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
