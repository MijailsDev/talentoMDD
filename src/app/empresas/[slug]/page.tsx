import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Briefcase } from "lucide-react";
import { getCatalog, getCompanyBySlug, getOffers, getSavedIds } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { COMPANY_STATUS } from "@/lib/constants";
import { CompanyContact, VerifiedBanner } from "@/components/company-details";
import { OfferCard } from "@/components/offer-card";
import { CompanyLogo, Cover, EmptyState } from "@/components/ui";

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
      <section className="relative h-[clamp(220px,30vw,340px)] overflow-hidden bg-dark">
        <Cover src={c.cover_url} alt={c.short_name} className="absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-dark/0 to-dark/50" />
        <div className="container-x relative pt-5">
          <Link href="/empresas" className="btn btn-sm bg-white/90 text-ink hover:bg-white"><ArrowLeft size={16} /> Empresas</Link>
        </div>
      </section>
      <div className="container-x space-y-7 pb-16">
        <header className="relative flex flex-wrap items-end gap-5 pt-4">
          <CompanyLogo company={c} size={112} className="relative -mt-[68px] rounded-[26px] border-[5px] border-surface shadow-[var(--shadow-card)]" />
          <div className="min-w-0 flex-[1_1_320px] break-words pb-1">
            <h1 className="font-display text-[clamp(26px,3.4vw,38px)] font-extrabold leading-[1.15] tracking-[-0.02em]">{c.short_name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip bg-primary-soft px-3 py-1 text-[13px] font-bold text-primary">{c.sector}</span>
              {c.status === "verificada" ? (
                <span className="chip bg-success-soft px-3 py-1 text-[13px] font-bold text-success"><BadgeCheck size={16} /> Empresa verificada por la universidad</span>
              ) : (
                <span className={`chip px-3 py-1 text-[13px] ${COMPANY_STATUS[c.status].cls}`}>{COMPANY_STATUS[c.status].label}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 pb-1">
            {offers.length > 0 && <a href="#ofertas" className="btn-primary h-[46px]">Ver ofertas activas</a>}
            {isOwner && <Link href="/empresa/perfil" className="btn-line h-[46px]">Editar perfil</Link>}
          </div>
        </header>

        <dl className="grid gap-3.5 sm:grid-cols-3">
          {[
            [String(c.interns_count), "practicantes de la universidad recibidos"],
            [String(c.since_year), `año de alianza · ${Math.max(new Date().getFullYear() - c.since_year, 0)} años de convenio`],
            [String(offers.length), "ofertas activas ahora"],
          ].map(([v, k]) => (
            <div key={k} className="card p-[18px]">
              <dd className="font-display text-[32px] font-extrabold text-primary">{v}</dd>
              <dt className="text-sm text-ink-2">{k}</dt>
            </div>
          ))}
        </dl>

        <section className="card p-6 sm:p-7">
          <h2 className="mb-2.5 font-sans text-[21px] font-extrabold">Acerca de la empresa</h2>
          <p className="leading-relaxed">{c.description}</p>
          <p className="mt-3 text-sm text-ink-2">Razón social: {c.legal_name} · RUC {c.ruc}</p>
          <div className="mt-6"><VerifiedBanner company={c} /></div>
        </section>

        <section className="card p-6 sm:p-7">
          <CompanyContact company={c} />
        </section>

        <section id="ofertas" className="scroll-mt-24">
          <h2 className="mb-5 font-sans text-[21px] font-extrabold">Ofertas activas de {c.short_name}</h2>
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
