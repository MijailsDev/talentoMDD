import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Clock, Eye, EyeOff, FilePlus2, Pencil, Trash2, Users } from "lucide-react";
import { getMyCompany, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { COMPANY_STATUS, OFFER_TYPES, UNIVERSITY } from "@/lib/constants";
import { deadlineText } from "@/lib/format";
import { deleteOffer, toggleOfferActive } from "@/app/actions/company";
import type { Offer } from "@/lib/types";
import { CompanyForm } from "@/components/company-form";
import { Alert, CompanyLogo, EmptyState, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";

export const metadata: Metadata = { title: "Panel de empresa" };

const MSG: Record<string, string> = { publicada: "Oferta publicada.", actualizada: "Oferta actualizada." };

export default async function CompanyDashboard({ searchParams }: { searchParams: Promise<{ oferta?: string; registrada?: string }> }) {
  const { oferta, registrada } = await searchParams;
  await requireRole(["empresa"], "/empresa");
  const company = await getMyCompany();

  if (!company) {
    return (
      <>
        <PageHeader eyebrow="Registro de empresa" title="Registra tu empresa">
          Completa los datos. La Oficina de Empleabilidad de la {UNIVERSITY} revisará tu información (RUC, convenio y datos de contacto) en un máximo de 48 horas hábiles.
        </PageHeader>
        <div className="container-x max-w-4xl py-8"><CompanyForm company={null} /></div>
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("*, applications(status)").eq("company_id", company.id).order("created_at", { ascending: false });
  const offers = (data ?? []) as (Offer & { applications: { status: string }[] })[];
  const totalApps = offers.reduce((n, o) => n + o.applications.length, 0);
  const pendingApps = offers.reduce((n, o) => n + o.applications.filter((a) => a.status === "postulado").length, 0);
  const st = COMPANY_STATUS[company.status];
  const verified = company.status === "verificada";

  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <div className="container-x flex flex-wrap items-center gap-5 py-8">
          <CompanyLogo company={company} size={72} />
          <div className="min-w-0 flex-1 basis-56">
            <p className="eyebrow">Panel de empresa</p>
            <h1 className="break-words font-display text-3xl font-extrabold tracking-tight">{company.short_name}</h1>
            <span className={`chip mt-1 ${st.cls}`}>{st.label}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {verified && <Link href={`/empresas/${company.slug}`} className="btn-outline btn-sm"><Eye size={16} /> Ver ficha pública</Link>}
            <Link href="/empresa/perfil" className="btn-outline btn-sm"><Pencil size={16} /> Editar empresa</Link>
            {verified && <Link href="/empresa/ofertas/nueva" className="btn-primary btn-sm"><FilePlus2 size={16} /> Nueva oferta</Link>}
          </div>
        </div>
      </div>

      <div className="container-x space-y-6 py-8">
        {registrada && <Alert kind="success">¡Empresa registrada! Te avisaremos cuando la universidad la verifique.</Alert>}
        {oferta && MSG[oferta] && <Alert kind="success">{MSG[oferta]}</Alert>}
        {company.status === "pendiente" && (
          <Alert kind="warning">Tu empresa está en revisión. Mientras tanto, completa tu logo, portada y galería en «Editar empresa». Podrás publicar ofertas cuando la universidad la verifique.</Alert>
        )}
        {company.status === "rechazada" && (
          <Alert kind="error">La verificación fue rechazada{company.review_note ? `: ${company.review_note}` : "."} Corrige tus datos en «Editar empresa» o escribe a la Oficina de Empleabilidad.</Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Briefcase, "Ofertas activas", offers.filter((o) => o.is_active && !deadlineText(o.deadline).closed).length],
            [Users, "Postulaciones recibidas", totalApps],
            [Clock, "Por revisar", pendingApps],
          ].map(([Icon, l, n]) => {
            const I = Icon as typeof Briefcase;
            return (
              <div key={l as string} className="card flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><I size={22} /></span>
                <div><p className="font-display text-3xl font-extrabold">{n as number}</p><p className="text-sm text-ink-2">{l as string}</p></div>
              </div>
            );
          })}
        </div>

        <section>
          <h2 className="mb-4 font-display text-2xl font-extrabold">Mis ofertas</h2>
          {offers.length === 0 ? (
            <EmptyState icon={<Briefcase />} title="Aún no publicas ofertas">
              {verified ? <Link href="/empresa/ofertas/nueva" className="font-semibold text-primary underline">Publica tu primera oferta</Link> : "Podrás publicar cuando tu empresa esté verificada."}
            </EmptyState>
          ) : (
            <div className="card relative overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-ink-2">
                  <tr><th className="px-5 py-3">Oferta</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Postulantes</th><th className="px-3 py-3">Cierre</th><th className="px-5 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {offers.map((o) => {
                    const dl = deadlineText(o.deadline);
                    const newApps = o.applications.filter((a) => a.status === "postulado").length;
                    return (
                      <tr key={o.id} className="align-middle">
                        <td className="px-5 py-4">
                          <Link href={`/ofertas/${o.id}`} className="font-bold hover:text-primary">{o.title}</Link>
                          <p className="text-xs text-ink-2">{OFFER_TYPES[o.type].label} · {o.mode}{o.featured ? " · Destacada" : ""}</p>
                        </td>
                        <td className="px-3 py-4">
                          {!o.is_active ? <span className="chip bg-hover text-ink-2">Pausada</span> : dl.closed ? <span className="chip bg-error-soft text-error">Cerrada</span> : <span className="chip bg-success-soft text-success">Publicada</span>}
                        </td>
                        <td className="px-3 py-4">
                          <Link href={`/empresa/ofertas/${o.id}/postulantes`} className="font-semibold text-primary hover:underline">{o.applications.length} {newApps > 0 && <span className="chip ml-1 bg-primary text-white">{newApps} nuevas</span>}</Link>
                        </td>
                        <td className={`px-3 py-4 ${dl.soon ? "font-semibold text-warning" : "text-ink-2"}`}>{dl.text}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <Link href={`/empresa/ofertas/${o.id}/postulantes`} className="btn-ghost btn-sm" title="Postulantes"><Users size={16} /></Link>
                            <Link href={`/empresa/ofertas/${o.id}`} className="btn-ghost btn-sm" title="Editar"><Pencil size={16} /></Link>
                            <form action={toggleOfferActive}>
                              <input type="hidden" name="id" value={o.id} />
                              <input type="hidden" name="active" value={String(!o.is_active)} />
                              <button className="btn-ghost btn-sm" title={o.is_active ? "Pausar" : "Reactivar"}>{o.is_active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </form>
                            <ConfirmButton action={deleteOffer} fields={{ id: o.id }} message={`¿Eliminar «${o.title}»? También se borrarán sus ${o.applications.length} postulaciones.`} className="btn-ghost btn-sm text-error" title="Eliminar"><Trash2 size={16} /></ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
