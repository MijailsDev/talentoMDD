import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Building2, CheckCircle2, ChevronDown, ClipboardCheck, GraduationCap, Search } from "lucide-react";
import { getCatalog, getActiveOfferCounts, getCompanies, getOffers, getSavedIds, getStats } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { CAREER_PHOTOS, FAQS, FALLBACK_COVER, HERO_PHOTO, OFFER_TYPES, TEAM_PHOTO, UNIVERSITY, WORK_MODES } from "@/lib/constants";
import { plural } from "@/lib/format";
import { OfferCard } from "@/components/offer-card";
import { CompanyLogo, Cover, Verified } from "@/components/ui";
import { CountUp, Marquee, Parallax, Reveal } from "@/components/motion";
import { CareerIcon } from "@/components/career-icon";

const TILE_COLORS = ["#A1002C", "#2F5E4C", "#7A4E2A", "#3E5A2E", "#5A3A2C", "#C80036", "#3E5563", "#2E4A3A"];
// Por debajo de este número, la cifra de miembros resta credibilidad: no se muestra
const MIN_MEMBERS = 20;

function SectionHead({ title, center, children }: { title: string; center?: boolean; children?: React.ReactNode }) {
  return (
    <Reveal className={`mb-7 flex flex-wrap items-end justify-between gap-4 ${center ? "justify-center text-center" : ""}`}>
      <div className={center ? "mx-auto max-w-2xl" : ""}>
        <h2 className="section-title mt-0">{title}</h2>
      </div>
      {children}
    </Reveal>
  );
}

export default async function Home() {
  const [s, catalog, offers, companies, counts, stats] = await Promise.all([getSession(), getCatalog(), getOffers(), getCompanies(), getActiveOfferCounts(), getStats()]);
  const saved = await getSavedIds(s?.uid);
  const canSave = !s || s.profile.role === "estudiante" || s.profile.role === "egresado";
  const featured = [...offers.filter((o) => o.featured), ...offers.filter((o) => !o.featured)].slice(0, 6);
  const spotlight = featured[0];
  const showMembers = stats.members >= MIN_MEMBERS;
  const tiles = catalog.careers
    .map((c) => ({ ...c, n: counts.byCareer[c.id] ?? 0 }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  const popular = [
    ...tiles.slice(0, 3).map((c) => ({ href: `/ofertas?car=${c.id}`, label: c.name.replace(/ e Informática| y Medio Ambiente/, "") })),
    { href: "/ofertas?modo=Remoto", label: "Trabajo remoto" },
    { href: "/ofertas?tipo=vol", label: "Voluntariados" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-hero relative isolate overflow-hidden text-white">
        <div aria-hidden className="textil-greca absolute inset-x-0 bottom-0 z-[1] h-[clamp(48px,4.2vw,60px)]" />
        <div className="container-x grid items-center gap-x-[clamp(32px,5vw,64px)] gap-y-8 pb-[clamp(88px,8vw,116px)] pt-[clamp(32px,4vw,56px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <span className="animate-rise inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 py-1.5 pl-2.5 pr-3.5 text-[13px] font-semibold text-peach backdrop-blur">
              <BadgeCheck size={17} /> Bolsa oficial de prácticas y empleo de la {UNIVERSITY}
            </span>
            <h1 className="animate-rise font-display text-[clamp(34px,9vw,84px)] font-extrabold leading-[0.95] tracking-[-0.045em] [animation-delay:80ms]">
              Tu primera práctica empieza aquí
            </h1>
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <p className="animate-rise max-w-[540px] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-white [animation-delay:160ms]">
              Prácticas pre-profesionales, prácticas profesionales y empleos en empresas verificadas por la universidad, con toda la información para postular con confianza.
            </p>
            <form action="/ofertas" role="search" className="animate-rise grid gap-1 rounded-[22px] border border-white/40 bg-surface p-2 text-ink shadow-[0_24px_60px_rgba(0,0,0,.35),0_0_0_6px_rgba(255,255,255,.08)] [animation-delay:240ms] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="flex min-w-0 items-center gap-2 px-3 sm:col-span-3 lg:col-span-2 xl:col-span-3">
                <Search size={20} className="shrink-0 text-ink-2" />
                <span className="sr-only">Cargo o palabra clave</span>
                <input name="q" placeholder="Cargo o palabra clave…" autoComplete="off" className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-2" />
              </label>
              <label className="sr-only" htmlFor="hcar">Carrera</label>
              <select id="hcar" name="car" defaultValue="all" className="field h-[52px] border-transparent bg-surface-2">
                <option value="all">Todas las carreras</option>
                {catalog.careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="sr-only" htmlFor="hmode">Modalidad</label>
              <select id="hmode" name="modo" defaultValue="" className="field h-[52px] border-transparent bg-surface-2">
                <option value="">Cualquier modalidad</option>
                {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button className="btn-primary h-[52px] rounded-2xl px-6 text-base lg:col-span-2 xl:col-span-1"><Search size={19} /> Buscar ofertas</button>
            </form>
            <div className="animate-rise flex flex-wrap items-center gap-x-2 gap-y-3 [animation-delay:320ms]">
              <span className="text-sm text-white">Populares:</span>
              {popular.map((p) => (
                <Link key={p.href} href={p.href} className="tap-44 relative inline-flex h-8 items-center whitespace-nowrap rounded-full border border-white/30 bg-white/5 px-3.5 text-[13px] font-semibold text-white transition-[background-color,color,scale] duration-150 ease-out hover:bg-white hover:text-primary active:scale-[0.97]">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="animate-rise relative mx-auto w-full min-w-0 max-w-[520px] [animation-delay:200ms] lg:max-w-none">
            <div className="relative aspect-[4/4.4] overflow-hidden lg:aspect-[4/3] rounded-[200px_200px_32px_32px] bg-peach shadow-[0_40px_80px_rgba(0,0,0,.4)] outline outline-1 outline-offset-[10px] outline-white/25">
              <Parallax className="absolute -inset-y-10 inset-x-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HERO_PHOTO} alt="Estudiantes trabajando en equipo" width={1600} height={1067} fetchPriority="high" className="h-full w-full object-cover" />
              </Parallax>
            </div>
            {spotlight && (
              <Link href={`/ofertas/${spotlight.id}`} className="absolute bottom-7 left-2 flex max-w-[290px] items-center gap-3 rounded-2xl border border-line bg-surface py-3 pl-3 pr-4 text-ink shadow-[var(--shadow-pop)] transition-[translate,scale] duration-200 ease-out motion-safe:hover:-translate-y-1 active:scale-[0.98] sm:-left-5">
                <CompanyLogo company={spotlight.company} size={44} />
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-primary">Nueva · {OFFER_TYPES[spotlight.type].label}</span>
                  <span className="block text-sm font-bold leading-snug">{spotlight.title}</span>
                  <span className="block text-xs text-ink-2">{spotlight.company.short_name}</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Cifras */}
      <section aria-label="Cifras" className="bg-textil textil-cuadrado relative mx-auto mt-[clamp(24px,3vw,40px)] w-[calc(100%-2rem)] max-w-[1180px] overflow-hidden rounded-[26px] text-white shadow-[0_30px_60px_rgba(200,0,54,.28)] sm:w-[calc(100%-3rem)]">
        <div className={`grid gap-6 px-[clamp(20px,4vw,40px)] py-10 ${showMembers ? "grid-cols-2 md:grid-cols-4" : "sm:grid-cols-3"}`}>
          {[
            [stats.offers, "Ofertas activas", Briefcase],
            [stats.companies, "Empresas aliadas", Building2],
            ...(showMembers ? [[stats.members, "Estudiantes y egresados", GraduationCap]] : []),
            [stats.hired, "Prácticas concretadas", ClipboardCheck],
          ].map(([n, l, Icon], i) => {
            const I = Icon as typeof Briefcase;
            return (
              <Reveal key={l as string} delay={i * 80} className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-peach"><I size={27} /></span>
                <div>
                  <p className="font-display text-[clamp(34px,3.8vw,48px)] font-extrabold leading-none tracking-[-0.04em] tabular-nums"><CountUp value={n as number} /></p>
                  <p className="mt-1 text-sm text-white">{l as string}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Ofertas destacadas */}
      <section className="container-x pt-[clamp(56px,7vw,96px)]">
        <SectionHead title="Oportunidades abiertas esta semana">
          <Link href="/ofertas" className="btn-line">Ver todas las ofertas <ArrowRight size={18} /></Link>
        </SectionHead>
        <div className="snap-row -mx-4 gap-4 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {featured.map((o, i) => (
            <Reveal key={o.id} delay={(i % 3) * 80} className="w-[82%] sm:w-auto">
              <OfferCard offer={o} careerName={catalog.careerName} saved={saved.has(o.id)} canSave={canSave} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carreras */}
      <section className="container-x pt-[clamp(56px,7vw,96px)]">
        <SectionHead title="Encuentra ofertas para tu carrera" />
        <div className="snap-row -mx-4 gap-4 px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(max(180px,calc(25%-15px)),1fr))] sm:gap-5 sm:overflow-visible sm:px-0">
          {tiles.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 80} className="w-[78%] sm:w-auto">
              <Link
                href={`/ofertas?car=${c.id}`}
                className="group relative block h-[190px] overflow-hidden rounded-2xl text-white transition-[translate,scale,box-shadow] duration-200 ease-out hover:shadow-[var(--shadow-pop)] motion-safe:hover:-translate-y-1 active:scale-[0.98]"
                style={{ background: `radial-gradient(120% 100% at 20% 10%, ${TILE_COLORS[i % 8]}cc, ${TILE_COLORS[i % 8]})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CAREER_PHOTOS[c.id] ?? FALLBACK_COVER} alt="" width={1000} height={750} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_60%] transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-gradient-to-b from-dark/5 to-dark/80" />
                <span className="absolute left-4 top-4 grid h-[42px] w-[42px] place-items-center rounded-xl bg-white/95 text-primary"><CareerIcon icon={c.icon} size={23} /></span>
                <span className="absolute inset-x-4 bottom-3.5">
                  <span className="block text-base font-extrabold leading-tight">{c.name}</span>
                  <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[13px] font-semibold">{plural(c.n, "oferta activa", "ofertas activas")}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Empresas aliadas */}
      <section className="pt-[clamp(56px,7vw,96px)]">
        <div className="container-x">
          <SectionHead title={`Empresas aliadas de la ${UNIVERSITY}`}>
            <Link href="/empresas" className="btn-line">Ver todas las empresas <ArrowRight size={18} /></Link>
          </SectionHead>
        </div>
        {/* Escritorio: carrusel continuo · Celular: fila deslizable con scroll snap */}
        <Marquee>
          {[...companies, ...companies].map((c, i) => <CompanyChip key={`${c.id}-${i}`} c={c} n={counts.byCompany[c.id] ?? 0} hidden={i >= companies.length} />)}
        </Marquee>
        <div className="snap-row gap-4 px-4 pb-4 pt-2 md:hidden">
          {companies.map((c) => <CompanyChip key={c.id} c={c} n={counts.byCompany[c.id] ?? 0} />)}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mt-[clamp(56px,7vw,96px)] bg-dark py-[clamp(56px,7vw,96px)] text-white">
        <Reveal className="container-x">
          <h2 className="section-title mt-0">De tu perfil a tu primera práctica en cuatro pasos</h2>
        </Reveal>
        <div aria-hidden className="textil-greca mt-[clamp(32px,4vw,48px)] h-[clamp(48px,4.2vw,60px)]" />
        <ol className="container-x mt-[clamp(32px,4vw,48px)] grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Crea tu perfil", "Regístrate con tu correo institucional, completa tu perfil y sube tu CV."],
            ["Explora ofertas", "Filtra por carrera, modalidad y tipo. Revisa la ficha completa de cada empresa."],
            ["Postula", "Envía tu postulación con un clic y un mensaje para la empresa."],
            ["Haz seguimiento", "Mira en qué etapa está cada postulación: revisión, entrevista o aceptado."],
          ].map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 60} className="flex flex-col gap-3">
              <h3 className="text-[clamp(24px,2.2vw,30px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-peach">{t}</h3>
              <p className="text-base leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Para empresas */}
      <section className="container-x pt-[clamp(56px,7vw,96px)]">
        <Reveal className="grid overflow-hidden rounded-[26px] bg-dark text-white md:grid-cols-2">
          <div className="bg-textil-dark flex flex-col gap-[18px] p-[clamp(28px,5vw,56px)]">
            <span className="self-start rounded-full bg-[rgba(232,181,168,.18)] px-3 py-1.5 text-[13px] font-bold text-peach">Para empresas</span>
            <h2 className="section-title mt-0">Encuentra talento de la {UNIVERSITY}</h2>
            <ul className="flex flex-col gap-2.5 text-base text-white">
              {["Publicación gratuita para empresas con convenio", "Perfiles académicos verificados por la universidad", "Gestión de postulantes y convenios de prácticas en un solo lugar"].map((b) => (
                <li key={b} className="flex gap-2.5"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-peach" /> {b}</li>
              ))}
            </ul>
            <div className="mt-1.5 flex flex-wrap gap-3">
              <Link href="/registro?rol=empresa" className="btn h-12 bg-peach px-[22px] text-base font-extrabold text-dark hover:bg-white">Registrar mi empresa</Link>
              <Link href="/empresas" className="btn h-12 border-[1.5px] border-white/50 px-[22px] text-base font-bold text-white hover:bg-white/10">Ver empresas aliadas</Link>
            </div>
          </div>
          <div className="relative min-h-[300px] bg-[radial-gradient(120%_100%_at_30%_20%,#c80036,#a1002c)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TEAM_PHOTO} alt="Equipo de trabajo en una oficina" width={1400} height={933} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="mx-auto max-w-[880px] px-4 py-[clamp(56px,7vw,96px)] sm:px-6">
        <SectionHead center title="Resolvemos tus dudas" />
        <Reveal className="flex flex-col gap-2.5">
          {FAQS.map(([q, a], i) => (
            <details key={q} className="group overflow-hidden rounded-2xl border border-line bg-surface open:bg-surface-2" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-[18px] text-base font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><ChevronDown size={19} className="transition-[rotate] duration-200 ease-out group-open:rotate-180" /></span>
              </summary>
              <p className="max-w-[65ch] px-5 pb-5 text-base leading-relaxed text-ink-2">{a}</p>
            </details>
          ))}
        </Reveal>
      </section>
    </>
  );
}

type HomeCompany = Awaited<ReturnType<typeof getCompanies>>[number];

function CompanyChip({ c, n, hidden }: { c: HomeCompany; n: number; hidden?: boolean }) {
  return (
    <Link
      href={`/empresas/${c.slug}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[translate,scale,box-shadow] duration-200 ease-out hover:shadow-[var(--shadow-card)] motion-safe:hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="h-[120px] overflow-hidden"><Cover src={c.cover_url} className="transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.03]" /></div>
      <div className="flex items-center gap-3 p-3.5">
        <CompanyLogo company={c} size={48} className="relative -mt-10 border-[3px] border-surface" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-[15px] font-bold">{c.short_name} <Verified size={15} /></p>
          <p className="truncate text-[13px] text-ink-2">{c.sector} · {plural(n, "oferta", "ofertas")}</p>
        </div>
      </div>
    </Link>
  );
}
