import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, UserCheck, UserPlus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCatalog, getNews } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/constants";
import { cycleText, fmtDate, norm } from "@/lib/format";
import { toggleConnection } from "@/app/actions/student";
import type { Role } from "@/lib/types";
import { Avatar, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Comunidad" };

type Person = { id: string; role: Role; first_name: string; last_name: string; career_id: string | null; cycle: number | null; headline: string; avatar_url: string | null; skills: string[] };

const VIEWS = [
  { key: "", label: "Todos", icon: Users },
  { key: "conexiones", label: "Mis conexiones", icon: UserCheck },
  { key: "contigo", label: "Conectaron contigo", icon: UserPlus },
] as const;

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ car?: string; q?: string; vista?: string }> }) {
  const { car = "all", q = "", vista = "" } = await searchParams;
  const { uid, profile } = await requireRole(["estudiante", "egresado", "docente", "admin"], "/comunidad");
  const supabase = await createClient();
  const [{ data: people }, { data: conns }, { data: incoming }, catalog, news] = await Promise.all([
    supabase.rpc("community_directory"),
    supabase.from("connections").select("to_id").eq("from_id", uid),
    supabase.from("connections").select("from_id").eq("to_id", uid),
    getCatalog(),
    getNews(5),
  ]);
  const connected = new Set((conns ?? []).map((c: { to_id: string }) => c.to_id));
  const followers = new Set((incoming ?? []).map((c: { from_id: string }) => c.from_id));
  const all = ((people ?? []) as Person[]).filter((p) => p.id !== uid);
  const counts: Record<string, number> = { "": all.length, conexiones: all.filter((p) => connected.has(p.id)).length, contigo: all.filter((p) => followers.has(p.id)).length };
  const inView = (p: Person) => (vista === "conexiones" ? connected.has(p.id) : vista === "contigo" ? followers.has(p.id) : true);
  const list = all.filter((p) => inView(p) && (car === "all" || p.career_id === car) && (!q || norm(`${p.first_name} ${p.last_name} ${p.headline} ${p.skills.join(" ")}`).includes(norm(q))));
  const filtered = car !== "all" || !!q;
  const emptyTitle = filtered ? "No encontramos personas con esos filtros" : vista === "conexiones" ? "Aún no conectas con nadie" : vista === "contigo" ? "Aún nadie conectó contigo" : "No encontramos personas con esos filtros";
  const suggestions = all.filter((p) => p.career_id && p.career_id === profile.career_id && !connected.has(p.id)).slice(0, 4);

  return (
    <>
      <PageHeader eyebrow="Comunidad" title="Directorio de la comunidad universitaria">
        Conecta con estudiantes, egresados y docentes de tu carrera.
      </PageHeader>
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <section>
          <nav className="mb-5 inline-flex max-w-full flex-wrap gap-1 rounded-[22px] border border-line bg-surface p-1" aria-label="Vistas de la comunidad">
            {VIEWS.map((v) => {
              const on = vista === v.key || (!VIEWS.some((x) => x.key === vista) && v.key === "");
              return (
                <Link key={v.key} href={v.key ? `/comunidad?vista=${v.key}` : "/comunidad"} aria-current={on || undefined} className={`btn btn-sm ${on ? "bg-primary text-white" : "text-ink-2 hover:bg-hover"}`}>
                  <v.icon size={16} /> {v.label} ({counts[v.key]})
                </Link>
              );
            })}
          </nav>
          <form className="mb-6 flex flex-wrap gap-3" role="search">
            {vista && <input type="hidden" name="vista" value={vista} />}
            <label htmlFor="cq" className="sr-only">Buscar personas</label>
            <input id="cq" name="q" defaultValue={q} placeholder="Buscar por nombre o habilidad" className="field max-w-xs" />
            <label htmlFor="ccar" className="sr-only">Carrera</label>
            <select id="ccar" name="car" defaultValue={car} className="field max-w-xs">
              <option value="all">Todas las carreras</option>
              {catalog.careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn-primary">Filtrar</button>
          </form>
          {list.length === 0 ? (
            <EmptyState icon={<Users />} title={emptyTitle}>
              {filtered ? undefined : vista === "conexiones" ? "Pulsa «Conectar» en las personas que te interesen y aparecerán aquí." : vista === "contigo" ? "Completa tu perfil para que otros te encuentren en el directorio." : undefined}
            </EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {list.map((p) => {
                const name = `${p.first_name} ${p.last_name}`.trim() || "Miembro";
                const isConn = connected.has(p.id);
                return (
                  <li key={p.id} className="card flex gap-4 p-5">
                    <Avatar name={name} url={p.avatar_url} size={56} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/comunidad/${p.id}`} className="block truncate font-bold hover:text-primary">{name}</Link>
                      <p className="line-clamp-2 text-sm text-ink-2">{p.headline}</p>
                      <p className="mt-1 text-xs text-ink-2">{ROLES[p.role]}{p.career_id ? ` · ${catalog.careerName(p.career_id)}` : ""}{p.cycle ? ` · ${cycleText(p.cycle)}` : ""}</p>
                      {followers.has(p.id) && <span className="chip mt-2 bg-primary-soft text-primary">{isConn ? "Conexión mutua" : "Conectó contigo"}</span>}
                      <form action={toggleConnection} className="mt-3">
                        <input type="hidden" name="to" value={p.id} />
                        <button className={isConn ? "btn btn-sm bg-success-soft text-success" : "btn-outline btn-sm"}>
                          {isConn ? <><UserCheck size={16} /> Conectado</> : <><UserPlus size={16} /> Conectar</>}
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {suggestions.length > 0 && (
            <div className="card p-5">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-2">De tu carrera</p>
              <ul className="space-y-3">
                {suggestions.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Avatar name={`${p.first_name} ${p.last_name}`} url={p.avatar_url} size={40} />
                    <Link href={`/comunidad/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-primary">{p.first_name} {p.last_name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card p-5">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-2">Novedades de la universidad</p>
            {news.length === 0 ? <p className="text-sm text-ink-2">Sin novedades por ahora.</p> : (
              <ul className="space-y-4">
                {news.map((n) => (
                  <li key={n.id} className="flex gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-center text-xs font-bold leading-tight text-primary"><CalendarDays size={14} />{fmtDate(n.event_date)}</span>
                    <div><p className="text-sm font-bold">{n.title}</p><p className="text-sm text-ink-2">{n.body}</p></div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
