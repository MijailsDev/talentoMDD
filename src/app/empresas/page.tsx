import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { getActiveOfferCounts, getCompanies } from "@/lib/data";
import { plural } from "@/lib/format";
import { CompanyLogo, Cover, EmptyState, PageHeader, Verified } from "@/components/ui";
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
        <nav aria-label="Filtrar por rubro" className="mb-8 flex flex-wrap gap-2">
          {["all", ...sectors].map((s) => (
            <Link key={s} href={s === "all" ? "/empresas" : `/empresas?sector=${encodeURIComponent(s)}`} scroll={false} aria-current={sector === s || undefined}
              className={`chip border px-3.5 py-1.5 text-sm transition ${sector === s ? "border-primary bg-primary text-white" : "border-line-strong bg-surface text-ink hover:border-primary"}`}>
              {s === "all" ? "Todos los rubros" : s}
            </Link>
          ))}
        </nav>
        {list.length === 0 ? (
          <EmptyState icon={<Building2 />} title="No hay empresas en este rubro todavía" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 80}>
                <Link href={`/empresas/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition hover:-translate-y-1.5 hover:shadow-[var(--shadow-card)]">
                  <div className="relative h-40 overflow-hidden"><Cover src={c.cover_url} className="transition duration-500 group-hover:scale-105" /></div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="relative -mt-12 mb-3"><CompanyLogo company={c} size={60} className="border-4 border-surface shadow" /></div>
                    <h2 className="flex items-center gap-1.5 font-sans text-lg font-bold">{c.short_name} <Verified /></h2>
                    <p className="text-sm text-ink-2">{c.sector}</p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-2">{c.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                      <span className="flex items-center gap-1 text-ink-2"><MapPin size={15} /> {c.district === "Tambopata" ? "Puerto Maldonado" : c.district}</span>
                      <span className="font-semibold text-primary">{plural(counts.byCompany[c.id] ?? 0, "oferta activa", "ofertas activas")}</span>
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
