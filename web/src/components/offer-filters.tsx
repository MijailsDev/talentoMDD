"use client";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { Loader2, RotateCcw, Search } from "lucide-react";
import type { Career, Faculty } from "@/lib/types";
import { OFFER_TYPES, WORK_MODES } from "@/lib/constants";

type Props = {
  faculties: Faculty[];
  careers: Career[];
  values: { q: string; fac: string; car: string; tipo: string[]; modo: string[]; pago: string; orden: string; vista: string };
};

export function OfferFilters({ faculties, careers, values }: Props) {
  const router = useRouter();
  const path = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const facCareers = values.fac !== "all" ? careers.filter((c) => c.faculty_id === values.fac) : careers;

  return (
    <form ref={form} onSubmit={(e) => { e.preventDefault(); submit(); }} onChange={(e) => {
        const name = (e.target as HTMLElement).getAttribute("name");
        if (name === "fac" && form.current) (form.current.elements.namedItem("car") as HTMLSelectElement).value = "all";
        submit(name === "q" ? 400 : 0);
      }} className="card space-y-5 p-5" aria-label="Filtros de ofertas">
      <input type="hidden" name="vista" value={values.vista} />
      <div className="relative">
        <label htmlFor="q" className="sr-only">Buscar</label>
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
        <input id="q" name="q" defaultValue={values.q} placeholder="Cargo, empresa o habilidad" className="field pl-10" />
      </div>
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
        <div className="space-y-1.5">
          {Object.entries(OFFER_TYPES).map(([k, t]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2.5 text-sm">
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
              <span className="chip border border-line-strong bg-surface px-3 py-1.5 text-sm peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20">{m}</span>
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
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => start(() => router.replace(path, { scroll: false }))} className="btn-ghost btn-sm -ml-2">
          <RotateCcw size={16} /> Limpiar filtros
        </button>
        {pending && <Loader2 size={18} className="animate-spin text-primary" aria-label="Cargando" />}
      </div>
      <noscript><button className="btn-primary w-full">Aplicar</button></noscript>
    </form>
  );
}
