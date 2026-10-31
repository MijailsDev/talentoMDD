import { PageHeader } from "@/components/ui";

export default function Loading() {
  return (
    <>
      <PageHeader eyebrow="Empresas" title="Empresas y organizaciones aliadas">
        Todas pasaron la verificación de la Oficina de Empleabilidad: RUC activo, convenio firmado y visita a sus instalaciones.
      </PageHeader>
      <div className="skeleton-in container-x py-10" aria-busy="true" aria-label="Cargando empresas">
        <div className="mb-8 h-9 w-full max-w-md animate-pulse rounded-full bg-hover" />
        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[380px] animate-pulse rounded-2xl bg-hover" />
          ))}
        </div>
      </div>
    </>
  );
}
