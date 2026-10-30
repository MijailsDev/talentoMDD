import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Banknote, CalendarClock, CalendarDays, Check, ChevronRight, Clock, FileText, GraduationCap, Languages, MapPin, Timer, Users } from "lucide-react";
import { getCatalog, getOffer, getOffers, getSavedIds } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OFFER_TYPES } from "@/lib/constants";
import { cycleText, deadlineText, fmtDateLong, plural } from "@/lib/format";
import { CompanyContact, VerifiedBanner } from "@/components/company-details";
import { offerPlace } from "@/components/offer-card";
import { ApplyButton } from "@/components/apply-button";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { CompanyLogo, Cover } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getOffer((await params).id);
  return o ? { title: `${o.title} · ${o.company.short_name}`, description: o.description.slice(0, 160) } : { title: "Oferta no encontrada" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-7">
      <h2 className="mb-4 font-sans text-[21px] font-extrabold">{title}</h2>
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
      <section className="relative isolate overflow-hidden bg-dark text-white">
        <Cover src={c.cover_url} alt="" className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-dark/15 to-dark/85" />
        <div className="container-x flex min-h-[340px] flex-col justify-between gap-7 pb-9 pt-6">
          <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/" className="rounded-full bg-black/25 px-2.5 py-1 hover:bg-black/40">Inicio</Link>
            <ChevronRight size={15} aria-hidden />
            <Link href="/ofertas" className="rounded-full bg-black/25 px-2.5 py-1 hover:bg-black/40">Ofertas</Link>
            <ChevronRight size={15} aria-hidden />
            <span className="rounded-full bg-black/25 px-2.5 py-1">{c.short_name}</span>
          </nav>
          <div className="flex flex-wrap items-end gap-5">
            <CompanyLogo company={c} size={84} className="rounded-[20px] border-4 border-white shadow-[var(--shadow-pop)]" />
            <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <span className={`chip px-3 py-1 text-[13px] font-extrabold ${t.cls}`}>{t.label}</span>
                <span className="chip bg-white/90 px-3 py-1 text-[13px] font-bold text-ink">{o.mode}</span>
                {dl.soon && <span className="chip bg-warning-soft px-3 py-1 text-[13px] font-extrabold text-warning">{dl.text}</span>}
                {!o.is_active && <span className="chip bg-error-soft px-3 py-1 text-[13px] font-extrabold text-error">Oferta inactiva</span>}
              </div>
              <h1 className="font-display text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em]">{o.title}</h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[17px] font-semibold">
                <Link href={`/empresas/${c.slug}`} className="flex items-center gap-1.5 hover:underline">{c.short_name} {c.status === "verificada" && <BadgeCheck size={20} className="text-[#9FE0B5]" aria-label="Empresa verificada" />}</Link>
                <span className="flex items-center gap-1.5 text-[15px] font-medium text-white/85"><MapPin size={16} /> {offerPlace(o)}</span>
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2.5 sm:w-auto">
              <div className="min-w-48 flex-1 [&_.btn-primary]:h-[50px] [&_.btn-primary]:px-6">
                <ApplyButton offerId={o.id} title={o.title} company={c.short_name} state={applyState} cvName={s?.profile.cv_name ?? null} needsCv={o.type !== "vol"} />
              </div>
              {isStudent && <div className="[&>button]:h-[50px]"><SaveButton offerId={o.id} saved={saved.has(o.id)} variant="full" /></div>}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-7 pb-16 pt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">

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

          <section className="card p-6 sm:p-7">
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
            <div className="card p-[22px]">
              <h2 className="mb-3 font-sans text-[17px] font-extrabold">Ofertas similares</h2>
              <ul className="-mx-2.5 flex flex-col gap-1">
                {similar.map((x) => (
                  <li key={x.id}>
                    <Link href={`/ofertas/${x.id}`} className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-hover">
                      <CompanyLogo company={x.company} size={40} />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold leading-snug">{x.title}</span>
                        <span className="block text-[13px] text-ink-2">{x.company.short_name} · {x.mode}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
