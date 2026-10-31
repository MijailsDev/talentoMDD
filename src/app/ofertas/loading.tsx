import { PageHeader } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <PageHeader compact eyebrow="Ofertas" title="Prácticas, empleos y voluntariados">
        Convocatorias vigentes de empresas verificadas por la universidad.
      </PageHeader>
      <div className="skeleton-in container-x grid gap-4 py-4 lg:grid-cols-[300px_1fr] lg:gap-8 lg:py-10" aria-busy="true" aria-label="Cargando ofertas">
        <div className="h-11 animate-pulse rounded-xl bg-hover lg:h-[560px] lg:rounded-[22px]" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[380px] animate-pulse rounded-[22px] bg-hover" />
          ))}
        </div>
      </div>
    </>
  );
}
