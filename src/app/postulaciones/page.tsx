import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Briefcase, Check, X } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCatalog, getSavedIds } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { APP_STATUS, OFFER_TYPES } from "@/lib/constants";
import { fmtDateLong } from "@/lib/format";
import { withdrawApplication } from "@/app/actions/student";
import type { Application, ApplicationEvent, OfferWithCompany } from "@/lib/types";
import { OfferCard } from "@/components/offer-card";
import { CompanyLogo, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Mis postulaciones" };

type Row = Application & { offer: OfferWithCompany | null; events: ApplicationEvent[] };
const FLOW = ["postulado", "revision", "entrevista", "aceptado"] as const;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const { uid } = await requireRole(["estudiante", "egresado"], "/postulaciones");
  const supabase = await createClient();
  const isSaved = tab === "guardadas";

  const [{ data: apps }, { data: savedRows }, catalog, savedIds] = await Promise.all([
    supabase.from("applications").select("*, offer:offers(*, company:companies(*)), events:application_events(*)").eq("student_id", uid).order("created_at", { ascending: false }),
    supabase.from("saved_offers").select("offer:offers(*, company:companies(*))").eq("student_id", uid).order("created_at", { ascending: false }),
    getCatalog(),
    getSavedIds(uid),
  ]);
  const rows = (apps ?? []) as Row[];
  const saved = ((savedRows ?? []) as unknown as { offer: OfferWithCompany | null }[]).map((r) => r.offer).filter((o): o is OfferWithCompany => !!o?.company);

  return (
    <>
      <PageHeader eyebrow="Mi seguimiento" title={isSaved ? "Ofertas guardadas" : "Mis postulaciones"}>
        Revisa en qué etapa está cada proceso y las ofertas que guardaste para después.
      </PageHeader>
      <div className="container-x py-8">
        <nav className="mb-6 inline-flex rounded-full border border-line bg-surface p-1" aria-label="Secciones">
          <Link href="/postulaciones" aria-current={!isSaved || undefined} className={`btn btn-sm ${!isSaved ? "bg-primary text-white" : "text-ink-2 hover:bg-hover"}`}><Briefcase size={16} /> Postulaciones ({rows.length})</Link>
          <Link href="/postulaciones?tab=guardadas" aria-current={isSaved || undefined} className={`btn btn-sm ${isSaved ? "bg-primary text-white" : "text-ink-2 hover:bg-hover"}`}><Bookmark size={16} /> Guardadas ({saved.length})</Link>
        </nav>

        {isSaved ? (
          saved.length === 0 ? (
            <EmptyState icon={<Bookmark />} title="Aún no guardas ofertas">Usa el ícono de marcador en cualquier oferta para revisarla después. <Link href="/ofertas" className="font-semibold text-primary underline">Explorar ofertas</Link></EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((o) => <OfferCard key={o.id} offer={o} careerName={catalog.careerName} saved={savedIds.has(o.id)} canSave />)}
            </div>
          )
        ) : rows.length === 0 ? (
          <EmptyState icon={<Briefcase />} title="Todavía no postulas a ninguna oferta">Encuentra una práctica o empleo para tu carrera. <Link href="/ofertas" className="font-semibold text-primary underline">Ver ofertas</Link></EmptyState>
        ) : (
          <ul className="space-y-5">
            {rows.map((a) => {
              const o = a.offer;
              const st = APP_STATUS[a.status];
              const events = [...a.events].sort((x, y) => x.id - y.id);
              const when = (s: string) => events.find((e) => e.status === s)?.created_at;
              const current = st.step;
              // Última etapa alcanzada antes de un posible rechazo
              const reached = Math.max(0, ...events.filter((e) => e.status !== "rechazado").map((e) => APP_STATUS[e.status].step));
              return (
                <li key={a.id} className="card p-6">
                  <div className="flex flex-wrap items-start gap-4">
                    {o && <CompanyLogo company={o.company} size={52} />}
                    <div className="min-w-0 flex-1 basis-56 break-words">
                      {o ? <Link href={`/ofertas/${o.id}`} className="text-lg font-bold hover:text-primary">{o.title}</Link> : <p className="text-lg font-bold">Oferta no disponible</p>}
                      <p className="text-sm text-ink-2">{o?.company.short_name} · {o ? OFFER_TYPES[o.type].label : ""} · Postulaste el {fmtDateLong(a.created_at)}</p>
                    </div>
                    <span className={`chip px-3 py-1 text-sm ${st.cls}`}>{st.label}</span>
                  </div>
                  <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Línea de tiempo del proceso">
                    {FLOW.map((s, i) => {
                      const rejected = a.status === "rechazado" && i === 3;
                      const done = a.status === "rechazado" ? i < 3 && i <= reached : i <= current;
                      const label = rejected ? "No seleccionado" : APP_STATUS[s].label;
                      const date = rejected ? when("rechazado") : when(s);
                      return (
                        <li key={s} className="relative">
                          <div className={`h-1.5 rounded-full ${rejected ? "bg-error" : done ? "bg-primary" : "bg-hover"}`} />
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                            {rejected ? <X size={15} className="text-error" /> : done ? <Check size={15} className="text-primary" /> : null}
                            <span className={rejected ? "text-error" : done ? "" : "text-ink-2"}>{label}</span>
                          </div>
                          {date && <p className="text-xs text-ink-2">{fmtDateLong(date)}</p>}
                        </li>
                      );
                    })}
                  </ol>
                  {a.status === "postulado" && (
                    <form action={withdrawApplication} className="mt-4 text-right">
                      <input type="hidden" name="id" value={a.id} />
                      <button className="btn-ghost btn-sm text-error">Retirar postulación</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
