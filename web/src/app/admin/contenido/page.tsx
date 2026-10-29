import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { getCatalog, getNews } from "@/lib/data";
import { fmtDateLong, todayISO } from "@/lib/format";
import { createCareer, createFaculty, createNews, deleteCareer, deleteNews } from "@/app/actions/admin";
import { CAREER_ICON_KEYS, CareerIcon } from "@/components/career-icon";
import { ConfirmButton } from "@/components/confirm-button";

export const metadata: Metadata = { title: "Contenido · Administración" };

export default async function AdminContent() {
  const [news, catalog] = await Promise.all([getNews(50), getCatalog()]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">Novedades de la universidad</h2>
        <form action={createNews} className="card space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <div><label htmlFor="ntitle" className="label">Título</label><input id="ntitle" name="title" required className="field" placeholder="Feria de prácticas 2027-I" /></div>
            <div><label htmlFor="ndate" className="label">Fecha</label><input id="ndate" name="event_date" type="date" defaultValue={todayISO()} className="field" /></div>
          </div>
          <div><label htmlFor="nbody" className="label">Detalle</label><textarea id="nbody" name="body" rows={2} className="field" /></div>
          <button className="btn-primary btn-sm">Publicar novedad</button>
        </form>
        <ul className="space-y-2">
          {news.map((n) => (
            <li key={n.id} className="card flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1"><p className="font-semibold">{n.title}</p><p className="text-sm text-ink-2">{fmtDateLong(n.event_date)} · {n.body}</p></div>
              <ConfirmButton action={deleteNews} fields={{ id: String(n.id) }} message="¿Eliminar esta novedad?" className="btn-ghost btn-sm text-error" title="Eliminar"><Trash2 size={15} /></ConfirmButton>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">Facultades y carreras</h2>
        <form action={createFaculty} className="card flex flex-wrap items-end gap-3 p-5">
          <div className="flex-1"><label htmlFor="fname" className="label">Nueva facultad</label><input id="fname" name="name" required className="field" placeholder="Facultad de Educación" /></div>
          <button className="btn-outline btn-sm">Agregar</button>
        </form>
        <form action={createCareer} className="card grid gap-3 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="cname" className="label">Nueva carrera</label><input id="cname" name="name" required className="field" placeholder="Ecoturismo" /></div>
          <div>
            <label htmlFor="cfac" className="label">Facultad</label>
            <select id="cfac" name="faculty_id" required className="field">{catalog.faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
          </div>
          <div>
            <label htmlFor="cicon" className="label">Ícono</label>
            <select id="cicon" name="icon" className="field">{CAREER_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
          </div>
          <button className="btn-primary btn-sm sm:col-span-2 sm:justify-self-start">Agregar carrera</button>
        </form>
        {catalog.faculties.map((f) => (
          <div key={f.id} className="card p-5">
            <p className="font-bold">{f.name}</p>
            <ul className="mt-3 space-y-2">
              {catalog.careers.filter((c) => c.faculty_id === f.id).map((c) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <CareerIcon icon={c.icon} size={18} className="text-primary" />
                  <span className="flex-1">{c.name}</span>
                  <ConfirmButton action={deleteCareer} fields={{ id: c.id }} message={`¿Eliminar la carrera «${c.name}»? Los perfiles que la usan quedarán sin carrera.`} className="btn-ghost btn-sm text-error" title="Eliminar"><Trash2 size={15} /></ConfirmButton>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
