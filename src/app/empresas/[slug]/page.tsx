import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CalendarCheck, GraduationCap } from "lucide-react";
import { getCatalog, getCompanyBySlug, getOffers, getSavedIds } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { COMPANY_STATUS } from "@/lib/constants";
import { CompanyContact, VerifiedBanner } from "@/components/company-details";
import { OfferCard } from "@/components/offer-card";
import { CompanyLogo, Cover, EmptyState, Verified } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCompanyBySlug((await params).slug);
  return c ? { title: c.short_name, description: c.description.slice(0, 160) } : { title: "Empresa no encontrada" };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const [c, s, catalog] = await Promise.all([getCompanyBySlug(slug), getSession(), getCatalog()]);
  if (!c) notFound();
  const offers = (await getOffers({})).filter((o) => o.company_id === c.id);
  const saved = await getSavedIds(s?.uid);
  const canSave = !s || s.profile.role === "estudiante" || s.profile.role === "egresado";
  const isOwner = s?.uid === c.owner_id;

  return (
    <>
      <div className="relative h-64 overflow-hidden sm:h-80">
        <Cover src={c.cover_url} alt={c.short_name} />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/10 to-dark/70" />
        <div className="container-x relative pt-6">
          <Link href="/empresas" className="btn btn-sm bg-white/90 text-ink hover:bg-white"><ArrowLeft size={16} /> Empresas</Link>
        </div>
      </div>
      <div className="container-x -mt-24 space-y-6 pb-10">
        <header className="card relative p-6 sm:p-8">
          <div className="flex flex-wrap items-end gap-5">
            <CompanyLogo company={c} size={96} className="-mt-20 border-4 border-surface shadow-lg" />
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{c.short_name} {c.status === "verificada" && <Verified size={26} />}</h1>
              <p className="text-ink-2">{c.legal_name} · RUC {c.ruc} · {c.sector}</p>
            </div>
            {c.status !== "verificada" && <span className={`chip ${COMPANY_STATUS[c.status].cls}`}>{COMPANY_STATUS[c.status].label}</span>}
            {isOwner && <Link href="/empresa/perfil" className="btn-outline btn-sm">Editar perfil</Link>}
          </div>
          <p className="mt-5 max-w-3xl leading-relaxed text-ink-2">{c.description}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              [Briefcase, "Ofertas activas", String(offers.length)],
              [GraduationCap, "Practicantes recibidos", String(c.interns_count)],
              [CalendarCheck, "Aliada desde", String(c.since_year)],
            ].map(([Icon, k, v]) => {
              const I = Icon as typeof Briefcase;
              return (
                <div key={k as string} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><I size={20} /></span>
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-2">{k as string}</dt><dd className="font-display text-2xl font-extrabold">{v as string}</dd></div>
                </div>
              );
            })}
          </dl>
          <div className="mt-6"><VerifiedBanner company={c} /></div>
        </header>

        <section className="card p-6 sm:p-8">
          <CompanyContact company={c} />
        </section>

        <section>
          <h2 className="mb-5 font-display text-2xl font-extrabold">Ofertas activas</h2>
          {offers.length === 0 ? (
            <EmptyState icon={<Briefcase />} title="Esta empresa no tiene ofertas abiertas ahora">Vuelve pronto o explora otras empresas.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((o) => <OfferCard key={o.id} offer={o} careerName={catalog.careerName} saved={saved.has(o.id)} canSave={canSave} />)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
