import type { Metadata } from "next";
import Link from "next/link";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { getCatalog, getOffers, getSavedIds } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { plural } from "@/lib/format";
import { OfferCard } from "@/components/offer-card";
import { OfferFilters } from "@/components/offer-filters";
import { OfferMap } from "@/components/map";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Ofertas de prácticas y empleo" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined, d = "") => (Array.isArray(v) ? v[0] : v) ?? d;
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export default async function OffersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const values = {
    q: one(sp.q), fac: one(sp.fac, "all"), car: one(sp.car, "all"), tipo: many(sp.tipo), modo: many(sp.modo),
    pago: one(sp.pago, "all"), orden: one(sp.orden, "recientes"), vista: one(sp.vista, "lista"),
  };
  const [s, catalog, offers] = await Promise.all([getSession(), getCatalog(), getOffers({ ...values })]);
  const saved = await getSavedIds(s?.uid);
  const canSave = !s || s.profile.role === "estudiante" || s.profile.role === "egresado";
  const isMap = values.vista === "mapa";

  const qs = (vista: string) => {
    const p = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => many(v).forEach((x) => k !== "vista" && p.append(k, x)));
    if (vista !== "lista") p.set("vista", vista);
    return `/ofertas${p.size ? `?${p}` : ""}`;
  };

  const points = Object.values(
    offers.reduce<Record<string, { lat: number; lng: number; title: string; subtitle: string; href: string }>>((acc, o) => {
      const c = o.company;
      if (c.lat == null || c.lng == null || o.mode === "Remoto") return acc;
      const prev = acc[c.id];
      acc[c.id] = prev
        ? { ...prev, subtitle: plural(Number(prev.subtitle.split(" ")[0]) + 1, "oferta", "ofertas"), href: `/empresas/${c.slug}` }
        : { lat: c.lat, lng: c.lng, title: c.short_name, subtitle: "1 oferta", href: `/ofertas/${o.id}` };
      return acc;
    }, {}),
  );

  return (
    <>
      <PageHeader eyebrow="Ofertas" title="Prácticas, empleos y voluntariados">
        Convocatorias vigentes de empresas verificadas por la universidad.
      </PageHeader>
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OfferFilters faculties={catalog.faculties} careers={catalog.careers} values={values} />
        </aside>
        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold"><span className="text-primary">{offers.length}</span> {offers.length === 1 ? "oferta encontrada" : "ofertas encontradas"}</p>
            <div className="inline-flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Vista">
              <Link href={qs("lista")} scroll={false} aria-current={!isMap || undefined} className={`btn btn-sm ${!isMap ? "bg-primary text-white" : "text-ink-2 hover:bg-hover"}`}><List size={16} /> Lista</Link>
              <Link href={qs("mapa")} scroll={false} aria-current={isMap || undefined} className={`btn btn-sm ${isMap ? "bg-primary text-white" : "text-ink-2 hover:bg-hover"}`}><MapIcon size={16} /> Mapa</Link>
            </div>
          </div>
          {offers.length === 0 ? (
            <EmptyState icon={<SearchX />} title="No encontramos ofertas con esos filtros">
              Prueba con otra carrera, quita algún filtro o <Link href="/ofertas" className="font-semibold text-primary underline">mira todas las ofertas</Link>.
            </EmptyState>
          ) : isMap ? (
            <div className="space-y-4">
              <OfferMap points={points} height={560} />
              <p className="text-sm text-ink-2">Las ofertas remotas no aparecen en el mapa.</p>
            </div>
          ) : (
            <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {offers.map((o) => (
                <OfferCard key={o.id} offer={o} careerName={catalog.careerName} saved={saved.has(o.id)} canSave={canSave} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
