export default function Loading() {
  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[300px_1fr]" aria-busy="true" aria-label="Cargando ofertas">
      <div className="h-[560px] animate-pulse rounded-[22px] bg-hover" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[380px] animate-pulse rounded-[22px] bg-hover" />
        ))}
      </div>
    </div>
  );
}
