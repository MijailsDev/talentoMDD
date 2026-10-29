"use client";
import Link from "next/link";
import { saveOffer } from "@/app/actions/company";
import { OFFER_TYPES, WORK_MODES } from "@/lib/constants";
import type { Career, Faculty, Offer } from "@/lib/types";
import { Field, FieldError, FormMessage, SubmitButton, useFormAction } from "./form-ui";

const DEFAULTS: Record<string, { stages: string; documents: string }> = {
  pre: { stages: "Revisión de CV\nEntrevista con el área\nEvaluación práctica\nFirma del convenio de prácticas", documents: "CV actualizado en PDF\nConstancia de matrícula vigente\nCopia de DNI" },
};

function Lines({ name, label, def, placeholder, hint }: { name: string; label: string; def?: string[]; placeholder?: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label} <span className="font-normal text-ink-2">(uno por línea)</span></label>
      <textarea id={name} name={name} rows={4} defaultValue={def?.join("\n") ?? ""} placeholder={placeholder} className="field" />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function OfferForm({ offer, faculties, careers, minDate }: { offer: Offer | null; faculties: Faculty[]; careers: Career[]; minDate?: string }) {
  const { state, pending, onSubmit } = useFormAction(saveOffer);
  const o = offer;

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-6" noValidate>
      {o && <input type="hidden" name="id" value={o.id} />}
      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">La oferta</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field state={state} name="title" label="Nombre del puesto" def={o?.title} placeholder="Practicante de Desarrollo Backend" required /></div>
          <div>
            <label htmlFor="type" className="label">Tipo<span className="text-primary"> *</span></label>
            <select id="type" name="type" defaultValue={o?.type ?? "pre"} className="field">
              {Object.entries(OFFER_TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mode" className="label">Modalidad<span className="text-primary"> *</span></label>
            <select id="mode" name="mode" defaultValue={o?.mode ?? "Presencial"} className="field">
              {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Field state={state} name="place" label="Lugar de trabajo" def={o?.place} hint="Opcional. Por defecto se usa la dirección de tu empresa." />
          <Field state={state} name="vacancies" label="Vacantes" type="number" min={1} max={500} def={o?.vacancies ?? 1} required />
          <Field state={state} name="deadline" label="Fecha límite de postulación" type="date" min={minDate} def={o?.deadline} required />
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">Descripción del puesto<span className="text-primary"> *</span></label>
            <textarea id="description" name="description" rows={4} defaultValue={o?.description} className="field" />
            <FieldError state={state} name="description" />
          </div>
          <div className="sm:col-span-2"><Lines name="functions" label="Funciones principales" def={o?.functions} /></div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Requisitos</h2>
        <fieldset>
          <legend className="label">Carreras<span className="text-primary"> *</span></legend>
          <div className="space-y-3">
            {faculties.map((f) => (
              <div key={f.id}>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-2">{f.name}</p>
                <div className="flex flex-wrap gap-2">
                  {careers.filter((c) => c.faculty_id === f.id).map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" name="career_ids" value={c.id} defaultChecked={o?.career_ids.includes(c.id)} className="peer sr-only" />
                      <span className="chip border border-line-strong bg-surface px-3 py-1.5 text-sm peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <FieldError state={state} name="career_ids" />
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="min_cycle" className="label">Ciclo mínimo</label>
            <select id="min_cycle" name="min_cycle" defaultValue={o?.min_cycle ?? ""} className="field">
              <option value="">Sin mínimo</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}.º ciclo</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2.5 self-end pb-3 text-sm font-semibold">
            <input type="checkbox" name="graduates_only" defaultChecked={o?.graduates_only} className="h-4 w-4 accent-primary" /> Solo para egresados / bachilleres
          </label>
          <Lines name="skills" label="Habilidades" def={o?.skills} />
          <Lines name="languages" label="Idiomas" def={o?.languages} placeholder="Inglés intermedio (deseable)" />
          <div className="sm:col-span-2"><Lines name="documents" label="Documentos solicitados" def={o?.documents ?? DEFAULTS.pre.documents.split("\n")} /></div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Condiciones</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field state={state} name="pay" label="Remuneración o subvención" def={o?.pay} placeholder="Subvención de S/ 1 130 mensuales" />
          <label className="flex items-center gap-2.5 self-end pb-3 text-sm font-semibold">
            <input type="checkbox" name="paid" defaultChecked={o ? o.paid : true} className="h-4 w-4 accent-primary" /> Es remunerada
          </label>
          <Field state={state} name="schedule" label="Horario" def={o?.schedule} placeholder="Lunes a viernes, 8:00 a. m. – 2:00 p. m." />
          <Field state={state} name="duration" label="Duración" def={o?.duration} placeholder="6 meses, renovable" />
          <Field state={state} name="start_text" label="Fecha de inicio" def={o?.start_text} placeholder="Diciembre de 2026" />
          <div className="sm:col-span-2"><Lines name="benefits" label="Beneficios" def={o?.benefits} /></div>
          <div className="sm:col-span-2"><Lines name="stages" label="Etapas del proceso de selección" def={o?.stages ?? DEFAULTS.pre.stages.split("\n")} /></div>
        </div>
        <p className="text-xs text-ink-2">Recuerda: según la Ley N.º 28518, las prácticas con jornada completa reciben una subvención no menor a una remuneración mínima vital.</p>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-[var(--shadow-pop)] backdrop-blur">
        <div className="mr-auto"><FormMessage state={state} /></div>
        <Link href="/empresa" className="btn-ghost">Cancelar</Link>
        <SubmitButton busy={pending}>{o ? "Guardar cambios" : "Publicar oferta"}</SubmitButton>
      </div>
    </form>
  );
}
