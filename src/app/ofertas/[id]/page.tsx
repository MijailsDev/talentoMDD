import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarClock, CalendarDays, Check, Clock, FileText, GraduationCap, Languages, MapPin, Timer, Users } from "lucide-react";
import { getCatalog, getOffer, getOffers, getSavedIds } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OFFER_TYPES } from "@/lib/constants";
import { cycleText, deadlineText, fmtDateLong, plural } from "@/lib/format";
import { CompanyContact, VerifiedBanner } from "@/components/company-details";
import { OfferCard, offerPlace } from "@/components/offer-card";
import { ApplyButton } from "@/components/apply-button";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { CompanyLogo, Cover, Verified } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getOffer((await params).id);
  return o ? { title: `${o.title} · ${o.company.short_name}`, description: o.description.slice(0, 160) } : { title: "Oferta no encontrada" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="mb-4 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-primary" /> {x}</li>
      ))}
    </ul>
  );
}

export default async function OfferPage({ params }: Props) {
  const { id } = await params;
  const [o, s, catalog] = await Promise.all([getOffer(id), getSession(), getCatalog()]);
  if (!o) notFound();

  const c = o.company;
  const t = OFFER_TYPES[o.type];
  const dl = deadlineText(o.deadline);
  const isStudent = s?.profile.role === "estudiante" || s?.profile.role === "egresado";
  const saved = await getSavedIds(s?.uid);

  let applied = false;
  if (s && isStudent) {
    const supabase = await createClient();
    const { data } = await supabase.from("applications").select("id").eq("offer_id", o.id).eq("student_id", s.uid).maybeSingle();
    applied = !!data;
  }
  const applyState = !s ? "guest" : applied ? "applied" : dl.closed || !o.is_active ? "closed" : !isStudent ? "not-allowed" : "can-apply";

  const similar = (await getOffers({}))
    .filter((x) => x.id !== o.id && x.career_ids.some((k) => o.career_ids.includes(k)))
    .slice(0, 3);

  const reqs = [
    `Carrera: ${o.career_ids.map(catalog.careerName).join(", ")}`,
    o.graduates_only ? "Egresados o bachilleres" : o.min_cycle ? `Desde el ${cycleText(o.min_cycle)}` : "",
  ].filter(Boolean);

  const facts: [typeof Clock, string, string][] = [
    [Banknote, "Remuneración", o.pay || (o.paid ? "Remunerada" : "No remunerada")],
    [Clock, "Horario", o.schedule],
    [Timer, "Duración", o.duration],
    [CalendarDays, "Inicio", o.start_text],
    [Users, "Vacantes", plural(o.vacancies, "vacante", "vacantes")],
    [CalendarClock, "Fecha límite", fmtDateLong(o.deadline)],
  ];

  return (
    <>
      <div className="relative h-56 overflow-hidden sm:h-72">
        <Cover src={c.cover_url} alt={`${c.short_name}`} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/20 to-dark/70" />
        <div className="container-x relative pt-6">
          <Link href="/ofertas" className="btn btn-sm bg-white/90 text-ink hover:bg-white"><ArrowLeft size={16} /> Volver a ofertas</Link>
        </div>
      </div>

      <div className="container-x -mt-20 grid gap-8 pb-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <header className="card relative p-6 sm:p-8">
            <CompanyLogo company={c} size={76} className="-mt-16 mb-4 border-4 border-surface shadow-lg" />
            <div className="flex flex-wrap gap-2">
              <span className={`chip ${t.cls}`}>{t.label}</span>
              <span className="chip bg-hover text-ink-2">{o.mode}</span>
              {dl.soon && <span className="chip bg-warning-soft text-warning">{dl.text}</span>}
              {!o.is_active && <span className="chip bg-error-soft text-error">Oferta inactiva</span>}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{o.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
              <Link href={`/empresas/${c.slug}`} className="flex items-center gap-1.5 font-semibold text-ink hover:text-primary">{c.short_name} {c.status === "verificada" && <Verified />}</Link>
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {offerPlace(o)}</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3 lg:hidden">
              <div className="min-w-48 flex-1">
                <ApplyButton offerId={o.id} title={o.title} company={c.short_name} state={applyState} cvName={s?.profile.cv_name ?? null} needsCv={o.type !== "vol"} />
              </div>
              {isStudent && <SaveButton offerId={o.id} saved={saved.has(o.id)} variant="full" />}
            </div>
          </header>

          <Section title="Descripción del puesto">
            <p className="leading-relaxed text-ink-2">{o.description}</p>
            {o.functions.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 font-sans text-base font-bold">Funciones principales</h3>
                <Bullets items={o.functions} />
              </>
            )}
          </Section>

          <Section title="Requisitos">
            <Bullets items={reqs} />
            {o.skills.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 flex items-center gap-2 font-sans text-base font-bold"><GraduationCap size={18} /> Habilidades</h3>
                <div className="flex flex-wrap gap-2">{o.skills.map((x) => <span key={x} className="chip bg-hover px-3 py-1 text-sm text-ink">{x}</span>)}</div>
              </>
            )}
            {o.languages.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 flex items-center gap-2 font-sans text-base font-bold"><Languages size={18} /> Idiomas</h3>
                <Bullets items={o.languages} />
              </>
            )}
            {o.documents.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 flex items-center gap-2 font-sans text-base font-bold"><FileText size={18} /> Documentos</h3>
                <Bullets items={o.documents} />
              </>
            )}
          </Section>

          <Section title="Condiciones y beneficios">
            <dl className="grid gap-4 sm:grid-cols-2">
              {facts.filter(([, , v]) => v).map(([Icon, k, v]) => (
                <div key={k} className="flex gap-3 rounded-2xl bg-surface-2 p-4">
                  <Icon size={20} className="mt-0.5 shrink-0 text-primary" />
                  <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-2">{k}</dt><dd className="font-semibold">{v}</dd></div>
                </div>
              ))}
            </dl>
            {o.benefits.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 font-sans text-base font-bold">Beneficios</h3>
                <Bullets items={o.benefits} />
              </>
            )}
          </Section>

          {o.stages.length > 0 && (
            <Section title="Proceso de selección">
              <ol className="relative space-y-5 border-l-2 border-peach pl-6">
                {o.stages.map((st, i) => (
                  <li key={st} className="relative">
                    <span className="absolute -left-[37px] grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
                    <p className="font-semibold">{st}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <section className="card p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <CompanyLogo company={c} size={56} />
              <div className="flex-1">
                <h2 className="text-xl font-extrabold">{c.short_name}</h2>
                <p className="text-sm text-ink-2">{c.legal_name} · RUC {c.ruc} · {c.sector}</p>
              </div>
              <Link href={`/empresas/${c.slug}`} className="btn-outline btn-sm">Ver perfil de la empresa</Link>
            </div>
            <p className="mb-5 leading-relaxed text-ink-2">{c.description}</p>
            <div className="mb-6"><VerifiedBanner company={c} /></div>
            <CompanyContact company={c} />
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Resumen</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between gap-3"><span className="text-ink-2">Tipo</span><strong className="text-right">{t.label}</strong></li>
              <li className="flex justify-between gap-3"><span className="text-ink-2">Modalidad</span><strong>{o.mode}</strong></li>
              <li className="flex justify-between gap-3"><span className="text-ink-2">Vacantes</span><strong>{o.vacancies}</strong></li>
              <li className="flex justify-between gap-3"><span className="text-ink-2">Pago</span><strong className="text-right">{o.paid ? "Remunerada" : "No remunerada"}</strong></li>
              <li className="flex justify-between gap-3"><span className="text-ink-2">Cierra</span><strong className={dl.soon ? "text-warning" : ""}>{fmtDateLong(o.deadline)}</strong></li>
            </ul>
            <div className="hidden space-y-2 lg:block">
              <ApplyButton offerId={o.id} title={o.title} company={c.short_name} state={applyState} cvName={s?.profile.cv_name ?? null} needsCv={o.type !== "vol"} />
              {isStudent && <div className="[&>button]:w-full"><SaveButton offerId={o.id} saved={saved.has(o.id)} variant="full" /></div>}
            </div>
            <ShareButton title={o.title} />
          </div>
          {similar.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Ofertas similares</p>
              {similar.map((x) => (
                <OfferCard key={x.id} offer={x} careerName={catalog.careerName} saved={saved.has(x.id)} canSave={!s || isStudent} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
