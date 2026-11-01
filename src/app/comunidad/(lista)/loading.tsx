import { PageHeader } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <PageHeader eyebrow="Comunidad" title="Directorio de la comunidad universitaria">
        Conecta con estudiantes, egresados y docentes de tu carrera.
      </PageHeader>
      <div className="skeleton-in container-x grid gap-8 py-8 lg:grid-cols-[1fr_320px]" aria-busy="true" aria-label="Cargando comunidad">
        <div>
          <div className="mb-5 h-11 w-full max-w-lg animate-pulse rounded-[22px] bg-hover" />
          <div className="mb-6 h-11 w-full max-w-xl animate-pulse rounded-xl bg-hover" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-hover" />
            ))}
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-hover" />
      </div>
    </>
  );
}
