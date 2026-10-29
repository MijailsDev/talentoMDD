import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, GraduationCap, Mail, Phone, Users } from "lucide-react";
import { getMyCompany, requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { APP_STATUS } from "@/lib/constants";
import { cycleText, fmtDateLong } from "@/lib/format";
import { setApplicationStatus } from "@/app/actions/company";
import type { Application, ApplicationEvent, AppStatus, Offer, Profile } from "@/lib/types";
import { CvLink } from "@/components/uploaders";
import { Avatar, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Postulantes" };

type Row = Application & { student: Profile | null; events: ApplicationEvent[] };

export default async function ApplicantsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { id } = await params;
  const { estado = "todos" } = await searchParams;
  await requireRole(["empresa"], `/empresa/ofertas/${id}/postulantes`);
  const c = await getMyCompany();
  if (!c) redirect("/empresa");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: offer } = await supabase.from("offers").select("*").eq("id", id).eq("company_id", c.id).maybeSingle<Offer>();
  if (!offer) notFound();
  const [{ data }, catalog] = await Promise.all([
    supabase.from("applications").select("*, student:profiles(*), events:application_events(*)").eq("offer_id", id).order("created_at", { ascending: false }),
    getCatalog(),
  ]);
  const all = (data ?? []) as Row[];
  const rows = estado === "todos" ? all : all.filter((a) => a.status === estado);

  return (
    <div className="container-x space-y-6 py-8">
      <Link href="/empresa" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Panel de empresa</Link>
      <div>
        <p className="eyebrow">Postulantes</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{offer.title}</h1>
        <p className="text-ink-2">{all.length} {all.length === 1 ? "postulación" : "postulaciones"} · cierra el {fmtDateLong(offer.deadline)}</p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
        {["todos", ...Object.keys(APP_STATUS)].map((k) => {
          const n = k === "todos" ? all.length : all.filter((a) => a.status === k).length;
          return (
            <Link key={k} href={`?estado=${k}`} scroll={false} aria-current={estado === k || undefined}
              className={`chip border px-3 py-1.5 text-sm ${estado === k ? "border-primary bg-primary text-white" : "border-line-strong bg-surface"}`}>
              {k === "todos" ? "Todos" : APP_STATUS[k as AppStatus].label} ({n})
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <EmptyState icon={<Users />} title={all.length ? "No hay postulantes en este estado" : "Aún no recibes postulaciones"}>
          Comparte la oferta con la comunidad: los estudiantes la verán en el portal mientras esté activa.
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {rows.map((a) => {
            const p = a.student;
            const name = p ? `${p.first_name} ${p.last_name}`.trim() : "Postulante";
            return (
              <li key={a.id} className="card p-6">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={name} url={p?.avatar_url} size={60} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold">{name}</p>
                    <p className="text-sm text-ink-2">{p?.headline}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
                      <span className="flex items-center gap-1"><GraduationCap size={15} /> {[p?.career_id ? catalog.careerName(p.career_id) : "", p?.role === "egresado" ? `Egresado ${p.grad_year ?? ""}` : cycleText(p?.cycle ?? null)].filter(Boolean).join(" · ")}</span>
                      {p?.email && <a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:text-primary"><Mail size={15} /> {p.email}</a>}
                      {p?.phone && <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-primary"><Phone size={15} /> {p.phone}</a>}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(a.cv_path || p?.cv_path) && <CvLink path={(a.cv_path || p?.cv_path)!} />}
                    <form action={setApplicationStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="offer_id" value={offer.id} />
                      <label htmlFor={`st-${a.id}`} className="sr-only">Estado</label>
                      <select id={`st-${a.id}`} name="status" defaultValue={a.status} className="field h-9 w-auto text-sm">
                        {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button className="btn-primary btn-sm">Actualizar</button>
                    </form>
                  </div>
                </div>
                {a.message && <blockquote className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm italic text-ink-2">“{a.message}”</blockquote>}
                {p && p.skills.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{p.skills.slice(0, 10).map((s) => <span key={s} className="chip bg-hover text-ink">{s}</span>)}</div>}
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-primary">Historial y perfil completo</summary>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <ol className="space-y-1.5 border-l-2 border-peach pl-4">
                      {[...a.events].sort((x, y) => x.id - y.id).map((e) => (
                        <li key={e.id}><span className={`chip ${APP_STATUS[e.status].cls}`}>{APP_STATUS[e.status].label}</span> <span className="text-ink-2">{fmtDateLong(e.created_at)}</span></li>
                      ))}
                    </ol>
                    <div className="space-y-2 text-ink-2">
                      {p?.about && <p className="whitespace-pre-line">{p.about}</p>}
                      {p?.experience.map((x, i) => <p key={i}><strong className="text-ink">{x.title}</strong> · {x.org} {x.period && `(${x.period})`}</p>)}
                      {p?.projects.map((x, i) => <p key={i}><strong className="text-ink">Proyecto:</strong> {x.name}</p>)}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
