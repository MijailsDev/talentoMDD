"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Loader2, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { Career, Faculty } from "@/lib/types";
import { OFFER_TYPES, WORK_MODES } from "@/lib/constants";
import { plural } from "@/lib/format";

type Props = {
  faculties: Faculty[];
  careers: Career[];
  values: { q: string; fac: string; car: string; tipo: string[]; modo: string[]; pago: string; orden: string; vista: string };
  total: number;
};

export function OfferFilters({ faculties, careers, values, total }: Props) {
  const router = useRouter();
  const path = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = values.tipo.length + values.modo.length + [values.fac, values.car, values.pago].filter((v) => v !== "all").length;

  // En escritorio los filtros son barra lateral, no un diálogo: se cierra la hoja y se anuncia como grupo
  useEffect(() => {
    const desktop = window.matchMedia("(width >= 64rem)");
    const sync = () => {
      if (desktop.matches) {
        sheet.current?.close();
        sheet.current?.setAttribute("role", "group");
      } else {
        sheet.current?.removeAttribute("role");
      }
    };
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  const submit = (delay = 0) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!form.current) return;
      const fd = new FormData(form.current);
      const sp = new URLSearchParams();
      for (const [k, v] of fd.entries()) if (v && v !== "all") sp.append(k, String(v));
      start(() => router.replace(`${path}?${sp.toString()}`, { scroll: false }));
    }, delay);
  };

  // Los controles no están ligados a la URL: hay que vaciarlos o seguirían marcados
  const clear = () => {
    clearTimeout(timer.current);
    for (const el of Array.from(form.current?.elements ?? [])) {
      if (el instanceof HTMLSelectElement) el.value = el.options[0].value;
      if (el instanceof HTMLInputElement) {
        if (el.type === "checkbox") el.checked = false;
        else if (el.type !== "hidden") el.value = "";
      }
    }
    start(() => router.replace(path, { scroll: false }));
  };

  const facCareers = values.fac !== "all" ? careers.filter((c) => c.faculty_id === values.fac) : careers;

  return (
    <form ref={form} onSubmit={(e) => { e.preventDefault(); submit(); }} onChange={(e) => {
        const name = (e.target as HTMLElement).getAttribute("name");
        if (name === "fac" && form.current) (form.current.elements.namedItem("car") as HTMLSelectElement).value = "all";
        submit(name === "q" ? 400 : 0);
      }} className="lg:space-y-5 lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-5" aria-label="Filtros de ofertas">
      <input type="hidden" name="vista" value={values.vista} />
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="q" className="sr-only">Buscar</label>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
          <input id="q" name="q" defaultValue={values.q} placeholder="Cargo, empresa o habilidad" className="field pl-10" />
        </div>
        <button type="button" onClick={() => sheet.current?.showModal()} aria-haspopup="dialog" aria-label={active ? `Filtros, ${active} activos` : "Filtros"} className="filtros-abrir btn-outline shrink-0 px-4 lg:hidden">
          {pending ? <Loader2 size={18} className="animate-spin text-primary" /> : <SlidersHorizontal size={18} />} Filtros
          {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-white">{active}</span>}
        </button>
      </div>
      <dialog
        ref={sheet}
        aria-label="Filtros de ofertas"
        onPointerDown={(e) => { pressedBackdrop.current = e.target === e.currentTarget; }}
        onClick={(e) => { if (pressedBackdrop.current && e.target === e.currentTarget) sheet.current?.close(); }}
        className="filtros-hoja fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none flex-col rounded-t-[22px] border-0 bg-surface p-0 text-ink shadow-[var(--shadow-pop)] backdrop:bg-dark/50 open:flex lg:static lg:block lg:max-h-none lg:space-y-5 lg:rounded-none lg:bg-transparent lg:shadow-none"
      >
        <div className="filtros-cabecera flex items-center justify-between border-b border-line py-1.5 pl-5 pr-2 lg:hidden">
          <p className="font-display text-lg font-extrabold">Filtros</p>
          <button type="button" onClick={() => sheet.current?.close()} aria-label="Cerrar filtros" className="btn-ghost w-11 px-0"><X size={20} /></button>
        </div>
        <div data-cuerpo className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 lg:overflow-visible lg:p-0">
          <div>
            <label htmlFor="fac" className="label">Facultad</label>
            <select id="fac" name="fac" defaultValue={values.fac} className="field">
              <option value="all">Todas las facultades</option>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="car" className="label">Carrera</label>
            <select id="car" name="car" defaultValue={values.car} key={values.fac} className="field">
              <option value="all">Todas las carreras</option>
              {facCareers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="label">Tipo</legend>
            <div className="lg:space-y-1.5">
              {Object.entries(OFFER_TYPES).map(([k, t]) => (
                <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm lg:min-h-0">
                  <input type="checkbox" name="tipo" value={k} defaultChecked={values.tipo.includes(k)} className="h-4 w-4 accent-primary" /> {t.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">Modalidad</legend>
            <div className="flex flex-wrap gap-2">
              {WORK_MODES.map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="checkbox" name="modo" value={m} defaultChecked={values.modo.includes(m)} className="peer sr-only" />
                  <span className="chip min-h-11 border border-line-strong bg-surface px-3 py-1.5 text-sm peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 lg:min-h-0">{m}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="pago" className="label">Remuneración</label>
            <select id="pago" name="pago" defaultValue={values.pago} className="field">
              <option value="all">Con o sin pago</option>
              <option value="si">Remuneradas</option>
              <option value="no">No remuneradas</option>
            </select>
          </div>
          <div>
            <label htmlFor="orden" className="label">Ordenar por</label>
            <select id="orden" name="orden" defaultValue={values.orden} className="field">
              <option value="recientes">Más recientes</option>
              <option value="cierre">Fecha límite más próxima</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:border-0 lg:p-0">
          <button type="button" onClick={clear} className="filtros-limpiar btn-ghost btn-sm h-11 shrink-0 px-3 lg:-ml-2 lg:h-9 lg:px-4">
            <RotateCcw size={16} /> <span>Limpiar<span className="hidden lg:inline"> filtros</span></span>
          </button>
          {pending && <Loader2 size={18} className="hidden animate-spin text-primary lg:block" aria-label="Cargando" />}
          <button type="button" onClick={() => sheet.current?.close()} className="filtros-ver btn-primary min-w-0 flex-1 lg:hidden">
            {pending ? "Actualizando…" : `Ver ${plural(total, "oferta", "ofertas")}`}
          </button>
        </div>
        <noscript><button className="btn-primary w-full">Aplicar</button></noscript>
      </dialog>
    </form>
  );
}
