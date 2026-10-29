"use client";
import Link from "next/link";
import { updateProfile } from "@/app/actions/student";
import type { Career, Faculty, Profile } from "@/lib/types";
import { FieldError, FormMessage, SubmitButton, useFormAction } from "./form-ui";
import { ListEditor } from "./list-editor";

export function ProfileForm({ p, faculties, careers }: { p: Profile; faculties: Faculty[]; careers: Career[] }) {
  const { state, pending, onSubmit } = useFormAction(updateProfile);
  const isStudent = p.role === "estudiante";
  const isGrad = p.role === "egresado";

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Datos básicos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="label">Nombres</label>
            <input id="first_name" name="first_name" defaultValue={p.first_name} className="field" required />
            <FieldError state={state} name="first_name" />
          </div>
          <div>
            <label htmlFor="last_name" className="label">Apellidos</label>
            <input id="last_name" name="last_name" defaultValue={p.last_name} className="field" required />
            <FieldError state={state} name="last_name" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="headline" className="label">Titular profesional</label>
            <input id="headline" name="headline" defaultValue={p.headline} maxLength={160} placeholder="Ej.: Estudiante de Sistemas · desarrollo web y bases de datos" className="field" />
          </div>
          <div>
            <label htmlFor="phone" className="label">Teléfono</label>
            <input id="phone" name="phone" type="tel" defaultValue={p.phone ?? ""} placeholder="+51 9xx xxx xxx" className="field" />
            <FieldError state={state} name="phone" />
          </div>
          <div>
            <label htmlFor="location" className="label">Ubicación</label>
            <input id="location" name="location" defaultValue={p.location} className="field" />
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Información académica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="career_id" className="label">Carrera</label>
            <select id="career_id" name="career_id" defaultValue={p.career_id ?? ""} className="field">
              <option value="">Selecciona tu carrera</option>
              {faculties.map((f) => (
                <optgroup key={f.id} label={f.name}>
                  {careers.filter((c) => c.faculty_id === f.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          {isStudent && (
            <div>
              <label htmlFor="cycle" className="label">Ciclo actual</label>
              <select id="cycle" name="cycle" defaultValue={p.cycle ?? ""} className="field">
                <option value="">—</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}.º ciclo</option>)}
              </select>
            </div>
          )}
          {isGrad && (
            <div>
              <label htmlFor="grad_year" className="label">Año de egreso</label>
              <input id="grad_year" name="grad_year" type="number" min={1995} max={2100} defaultValue={p.grad_year ?? ""} className="field" />
            </div>
          )}
          <div>
            <p className="label">Correo institucional</p>
            <p className="field flex items-center bg-surface-2 text-ink-2">{p.email}</p>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Acerca de ti</h2>
        <div>
          <label htmlFor="about" className="label">Resumen</label>
          <textarea id="about" name="about" rows={5} maxLength={2000} defaultValue={p.about} className="field" placeholder="Cuéntales a las empresas qué te apasiona, en qué eres bueno y qué buscas." />
        </div>
        <div>
          <label htmlFor="skills" className="label">Habilidades <span className="font-normal text-ink-2">(una por línea)</span></label>
          <textarea id="skills" name="skills" rows={4} defaultValue={p.skills.join("\n")} className="field" placeholder={"Java\nSQL\nTrabajo en equipo"} />
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Experiencia y prácticas</h2>
        <ListEditor name="experience" addLabel="Agregar experiencia" initial={p.experience}
          fields={[{ key: "title", label: "Cargo", placeholder: "Practicante de soporte TI" }, { key: "org", label: "Empresa u organización" }, { key: "period", label: "Periodo", placeholder: "mar. 2025 – ago. 2025" }, { key: "description", label: "Descripción", textarea: true }]} />
      </section>

      <section className="card space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Proyectos</h2>
        <ListEditor name="projects" addLabel="Agregar proyecto" initial={p.projects}
          fields={[{ key: "name", label: "Nombre del proyecto" }, { key: "url", label: "Enlace", placeholder: "github.com/usuario/proyecto" }, { key: "description", label: "Descripción", textarea: true }]} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Certificaciones</h2>
          <ListEditor name="certifications" addLabel="Agregar certificación" initial={p.certifications}
            fields={[{ key: "name", label: "Nombre", wide: true }, { key: "issuer", label: "Institución" }, { key: "year", label: "Año" }]} />
        </section>
        <section className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Idiomas</h2>
          <ListEditor name="languages" addLabel="Agregar idioma" initial={p.languages} max={8}
            fields={[{ key: "name", label: "Idioma" }, { key: "level", label: "Nivel", placeholder: "Básico, intermedio, avanzado…" }]} />
        </section>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-[var(--shadow-pop)] backdrop-blur">
        <div className="mr-auto"><FormMessage state={state} /></div>
        <Link href="/perfil" className="btn-ghost">Cancelar</Link>
        <SubmitButton busy={pending}>Guardar cambios</SubmitButton>
      </div>
    </form>
  );
}
