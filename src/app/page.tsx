import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Building2, ChevronDown, ClipboardCheck, Quote, Search, Send, UserRoundPlus, Users } from "lucide-react";
import { getCatalog, getActiveOfferCounts, getCompanies, getOffers, getSavedIds, getStats } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { FAQS, HERO_PHOTO, TESTIMONIALS, UNIVERSITY, WORK_MODES } from "@/lib/constants";
import { plural } from "@/lib/format";
import { OfferCard } from "@/components/offer-card";
import { Avatar, CompanyLogo, Cover, Verified } from "@/components/ui";
import { CountUp, Parallax, Reveal } from "@/components/motion";
import { CareerIcon } from "@/components/career-icon";

const TILE_COLORS = ["#A1002C", "#2F5E4C", "#7A4E2A", "#3E5A2E", "#5A3A2C", "#C80036", "#3E5563", "#2E4A3A"];

export default async function Home() {
  const [s, catalog, offers, companies, counts, stats] = await Promise.all([getSession(), getCatalog(), getOffers(), getCompanies(), getActiveOfferCounts(), getStats()]);
  const saved = await getSavedIds(s?.uid);
  const canSave = !s || s.profile.role === "estudiante" || s.profile.role === "egresado";
  const featured = [...offers.filter((o) => o.featured), ...offers.filter((o) => !o.featured)].slice(0, 6);
  const tiles = catalog.careers
    .map((c) => ({ ...c, n: counts.byCareer[c.id] ?? 0, fac: catalog.faculties.find((f) => f.id === c.faculty_id)?.name ?? "" }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <Reveal>
              <span className="chip bg-primary-soft px-3 py-1 text-[13px] text-primary"><BadgeCheck size={15} /> Empresas verificadas por la {UNIVERSITY}</span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Tu primera experiencia profesional <span className="font-serif font-normal italic text-primary">empieza aquí</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-lg text-ink-2">Prácticas pre-profesionales, empleos y voluntariados en empresas de Madre de Dios y de todo el Perú, pensados para estudiantes y egresados de la {UNIVERSITY}.</p>
            </Reveal>
            <Reveal delay={240}>
              <form action="/ofertas" className="mt-8 grid gap-2 rounded-[22px] border border-line bg-surface p-2 shadow-[var(--shadow-card)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="sr-only" htmlFor="hq">Cargo o palabra clave</label>
                <div className="relative sm:col-span-3">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
                  <input id="hq" name="q" placeholder="Cargo o palabra clave" className="field border-transparent pl-10" />
                </div>
                <label className="sr-only" htmlFor="hcar">Carrera</label>
                <select id="hcar" name="car" className="field border-transparent" defaultValue="all">
                  <option value="all">Todas las carreras</option>
                  {catalog.careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label className="sr-only" htmlFor="hmode">Modalidad</label>
                <select id="hmode" name="modo" className="field border-transparent" defaultValue="">
                  <option value="">Cualquier modalidad</option>
                  {WORK_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
                <button className="btn-primary h-11">Buscar</button>
              </form>
            </Reveal>
          </div>
          <Reveal delay={120} className="relative">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-[36px_36px_36px_8px] shadow-[var(--shadow-pop)]">
              <Parallax className="absolute -inset-y-10 inset-x-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HERO_PHOTO} alt="Estudiantes trabajando en equipo" className="h-full w-full object-cover" />
              </Parallax>
            </div>
            <div className="absolute -bottom-6 left-5 hidden rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-pop)] sm:block">
              <p className="text-xs font-semibold text-ink-2">Ofertas activas hoy</p>
              <p className="font-display text-3xl font-extrabold text-primary">{stats.offers}</p>
            </div>
          </Reveal>
        </div>
        <div className="band h-3" aria-hidden />
      </section>

      {/* Estadísticas */}
      <section className="bg-dark text-white">
        <div className="container-x grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            [stats.offers, "Ofertas activas", Briefcase],
            [stats.companies, "Empresas aliadas", Building2],
            [stats.members, "Estudiantes y egresados", Users],
            [stats.hired, "Prácticas concretadas", ClipboardCheck],
          ].map(([n, l, Icon], i) => {
            const I = Icon as typeof Briefcase;
            return (
              <Reveal key={l as string} delay={i * 80} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><I size={22} /></span>
                <div>
                  <p className="font-display text-3xl font-extrabold"><CountUp value={n as number} /></p>
                  <p className="text-sm text-white/70">{l as string}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Ofertas destacadas */}
      <section className="container-x py-16 lg:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ofertas destacadas</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Convocatorias abiertas ahora</h2>
          </div>
          <Link href="/ofertas" className="btn-outline">Ver todas las ofertas <ArrowRight size={18} /></Link>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((o, i) => (
            <Reveal key={o.id} delay={(i % 3) * 80}>
              <OfferCard offer={o} careerName={catalog.careerName} saved={saved.has(o.id)} canSave={canSave} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carreras */}
      <section className="bg-surface-2 py-16 lg:py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Explora por carrera</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Encuentra oportunidades para tu carrera</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((c, i) => {
              return (
                <Reveal key={c.id} delay={(i % 4) * 80}>
                  <Link href={`/ofertas?car=${c.id}`} className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-[22px] p-5 text-white transition hover:-translate-y-1.5" style={{ background: `radial-gradient(120% 90% at 20% 10%, ${TILE_COLORS[i % 8]}cc, ${TILE_COLORS[i % 8]})` }}>
                    <CareerIcon icon={c.icon} size={34} className="absolute right-5 top-5 opacity-80 transition group-hover:scale-110" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/75">{c.fac}</p>
                    <h3 className="mt-1 font-sans text-lg font-bold leading-snug">{c.name}</h3>
                    <p className="mt-1 text-sm text-white/85">{plural(c.n, "oferta", "ofertas")}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Empresas aliadas */}
      <section className="py-16 lg:py-24">
        <Reveal className="container-x flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Empresas aliadas</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Organizaciones que confían en nuestro talento</h2>
          </div>
          <Link href="/empresas" className="btn-outline">Ver empresas <ArrowRight size={18} /></Link>
        </Reveal>
        <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee flex w-max gap-5 px-4">
            {[...companies, ...companies].map((c, i) => (
              <Link key={`${c.id}-${i}`} href={`/empresas/${c.slug}`} aria-hidden={i >= companies.length || undefined} tabIndex={i >= companies.length ? -1 : undefined} className="group w-72 shrink-0 overflow-hidden rounded-[22px] border border-line bg-surface transition hover:shadow-[var(--shadow-card)]">
                <div className="h-32 overflow-hidden"><Cover src={c.cover_url} className="transition duration-500 group-hover:scale-105" /></div>
                <div className="flex items-center gap-3 p-4">
                  <CompanyLogo company={c} size={44} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate font-bold">{c.short_name} <Verified size={15} /></p>
                    <p className="truncate text-sm text-ink-2">{c.sector} · {plural(counts.byCompany[c.id] ?? 0, "oferta", "ofertas")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-24 bg-surface-2 py-16 lg:py-24">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">De tu perfil a tu primera práctica en 4 pasos</h2>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              [UserRoundPlus, "Crea tu perfil", "Regístrate con tu correo institucional, completa tu perfil y sube tu CV."],
              [Search, "Explora ofertas", "Filtra por carrera, modalidad y tipo. Revisa la ficha completa de cada empresa."],
              [Send, "Postula", "Envía tu postulación con un clic y un mensaje para la empresa."],
              [ClipboardCheck, "Haz seguimiento", "Mira en qué etapa está cada postulación: revisión, entrevista o aceptado."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof Search;
              return (
                <Reveal as="li" key={t as string} delay={i * 100} className="card relative p-6">
                  <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-primary/10">{i + 1}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white"><I size={22} /></span>
                  <h3 className="mt-5 font-sans text-lg font-bold">{t as string}</h3>
                  <p className="mt-2 text-sm text-ink-2">{d as string}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Testimonios */}
      <section className="container-x py-16 lg:py-24">
        <Reveal>
          <p className="eyebrow">Testimonios</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Egresados que empezaron aquí</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100} className="card flex flex-col p-7">
              <Quote size={28} className="text-primary" />
              <blockquote className="mt-4 flex-1 font-serif text-xl italic leading-relaxed">“{t.quote}”</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <Avatar name={t.name} size={46} />
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-ink-2">{t.role}</p>
                  <p className="text-xs text-ink-2">{t.meta}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Para empresas */}
      <section className="container-x">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-dark p-8 text-white sm:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-peach">Para empresas</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Publica tus ofertas y encuentra talento de la {UNIVERSITY}</h2>
              <p className="mt-3 max-w-xl text-white/75">Registra tu empresa, la Oficina de Empleabilidad la verifica en 48 horas hábiles y podrás publicar prácticas y empleos, y revisar a tus postulantes.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/registro?rol=empresa" className="btn-primary">Registrar mi empresa</Link>
              <Link href="/login" className="btn border-[1.5px] border-white/30 text-white hover:bg-white/10">Ya tengo cuenta</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="container-x scroll-mt-24 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">¿Tienes dudas?</h2>
            <p className="mt-3 text-ink-2">Si no encuentras tu respuesta, escribe a la Oficina de Empleabilidad.</p>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <Reveal key={q} delay={i * 60}>
                <details className="group card px-6 py-1 open:shadow-[var(--shadow-card)]" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown size={20} className="shrink-0 text-primary transition group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-ink-2">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
