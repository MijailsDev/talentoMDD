import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, MapPin } from "lucide-react";
import { getActiveOfferCounts, getCompanies } from "@/lib/data";
import { plural } from "@/lib/format";
import { CompanyLogo, Cover, EmptyState, PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = { title: "Empresas aliadas" };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ sector?: string }> }) {
  const { sector = "all" } = await searchParams;
  const [companies, counts] = await Promise.all([getCompanies(), getActiveOfferCounts()]);
  const sectors = [...new Set(companies.map((c) => c.sector))].sort();
  const list = sector === "all" ? companies : companies.filter((c) => c.sector === sector);

  return (
    <>
      <PageHeader eyebrow="Empresas" title="Empresas y organizaciones aliadas">
        Todas pasaron la verificación de la Oficina de Empleabilidad: RUC activo, convenio firmado y visita a sus instalaciones.
      </PageHeader>
      <div className="container-x py-10">
        <nav aria-label="Filtrar por rubro" className="snap-row -mx-4 mb-8 gap-2 px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {["all", ...sectors].map((s) => (
            <Link key={s} href={s === "all" ? "/empresas" : `/empresas?sector=${encodeURIComponent(s)}`} scroll={false} aria-current={sector === s || undefined}
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition ${sector === s ? "border-primary bg-primary text-white" : "border-line-strong bg-surface text-ink hover:border-primary"}`}>
              {s === "all" ? "Todos los rubros" : s}
            </Link>
          ))}
        </nav>
        {list.length === 0 ? (
          <EmptyState icon={<Building2 />} title="No hay empresas en este rubro todavía" />
        ) : (
          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 80}>
                <Link href={`/empresas/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-pop)]">
                  <div className="relative h-[170px] overflow-hidden"><Cover src={c.cover_url} className="transition duration-500 group-hover:scale-105" /></div>
                  <div className="flex flex-1 flex-col gap-2 px-[18px] pb-[18px]">
                    <div className="relative -mt-[30px]"><CompanyLogo company={c} size={60} className="border-[3px] border-surface" /></div>
                    <h2 className="mt-1 font-sans text-lg font-extrabold leading-snug">{c.short_name}</h2>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="chip bg-primary-soft text-primary">{c.sector}</span>
                      {c.status === "verificada" && <span className="chip bg-success-soft text-success"><BadgeCheck size={14} /> Verificada{c.since_year ? ` · aliada desde ${c.since_year}` : ""}</span>}
                    </div>
                    <p className="line-clamp-3 flex-1 text-sm leading-normal text-ink-2">{c.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-3 text-[13px]">
                      <span className="flex items-center gap-1 text-ink-2"><MapPin size={15} /> {c.district === "Tambopata" ? "Puerto Maldonado" : c.district}</span>
                      <span className="font-bold text-primary">{plural(counts.byCompany[c.id] ?? 0, "oferta activa", "ofertas activas")}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
