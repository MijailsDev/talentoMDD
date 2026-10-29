"use client";
import { saveCompany } from "@/app/actions/company";
import { SECTORS } from "@/lib/constants";
import type { Company } from "@/lib/types";
import { Field, FieldError, FormMessage, SubmitButton, useFormAction } from "./form-ui";
import { LocationPicker } from "./location-picker";

export function CompanyForm({ company }: { company: Company | null }) {
  const { state, pending, onSubmit } = useFormAction(saveCompany);
  const c = company;
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Datos de la empresa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field state={state} name="name" label="Nombre comercial" def={c?.name} required />
          <Field state={state} name="short_name" label="Nombre corto" def={c?.short_name} hint="Se muestra en las tarjetas. Si lo dejas vacío, usamos el nombre comercial." />
          <Field state={state} name="legal_name" label="Razón social" def={c?.legal_name} required />
          <Field state={state} name="ruc" label="RUC" def={c?.ruc} placeholder="20xxxxxxxxx" required />
          <div>
            <label htmlFor="sector" className="label">Rubro<span className="text-primary"> *</span></label>
            <select id="sector" name="sector" defaultValue={c?.sector ?? ""} className="field">
              <option value="">Selecciona el rubro</option>
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
              {c?.sector && !SECTORS.includes(c.sector) && <option>{c.sector}</option>}
            </select>
            <FieldError state={state} name="sector" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field state={state} name="logo_text" label="Iniciales del logo" def={c?.logo_text} hint="Si no subes un logo." />
            <div>
              <label htmlFor="color" className="label">Color</label>
              <input id="color" name="color" type="color" defaultValue={c?.color ?? "#A1002C"} className="h-11 w-14 cursor-pointer rounded-xl border-[1.5px] border-line-strong bg-surface p-1" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">Descripción<span className="text-primary"> *</span></label>
            <textarea id="description" name="description" rows={5} defaultValue={c?.description} className="field" placeholder="¿Qué hace tu empresa? ¿Cuántas personas trabajan? ¿Qué aprenderá un practicante?" />
            <FieldError state={state} name="description" />
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Ubicación y contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field state={state} name="address" label="Dirección" def={c?.address} placeholder="Av. León Velarde 1020, Puerto Maldonado" required /></div>
          <Field state={state} name="reference" label="Referencia" def={c?.reference} placeholder="Frente a…" />
          <Field state={state} name="district" label="Distrito" def={c?.district ?? "Tambopata"} hint="Escribe «Remoto» si no tienes oficina presencial." />
          <div className="sm:col-span-2"><LocationPicker lat={c?.lat ?? null} lng={c?.lng ?? null} /><FieldError state={state} name="lat" /></div>
          <Field state={state} name="phone" label="Teléfono" def={c?.phone} type="tel" required />
          <Field state={state} name="email" label="Correo de contacto" def={c?.email} type="email" required />
          <Field state={state} name="website" label="Sitio web" def={c?.website} placeholder="tuempresa.pe" />
          <Field state={state} name="social" label="Red social" def={c?.social} placeholder="facebook.com/tuempresa" />
          <div className="sm:col-span-2"><Field state={state} name="hours" label="Horario de atención" def={c?.hours} placeholder="Lunes a viernes, 8:00 a. m. – 5:00 p. m." /></div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Representante</h2>
        <p className="text-sm text-ink-2">Persona de contacto para los estudiantes y la universidad. Se muestra en la ficha pública de la empresa.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field state={state} name="rep_name" label="Nombre completo" def={c?.rep_name} required />
          <Field state={state} name="rep_role" label="Cargo" def={c?.rep_role} placeholder="Jefa de Recursos Humanos" />
          <Field state={state} name="rep_email" label="Correo directo" def={c?.rep_email} type="email" />
          <Field state={state} name="rep_phone" label="Teléfono directo" def={c?.rep_phone} type="tel" />
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-[var(--shadow-pop)] backdrop-blur">
        <div className="mr-auto"><FormMessage state={state} /></div>
        <SubmitButton busy={pending}>{c ? "Guardar cambios" : "Enviar para verificación"}</SubmitButton>
      </div>
    </form>
  );
}
