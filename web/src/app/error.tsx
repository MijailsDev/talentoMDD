"use client";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-error-soft text-error"><TriangleAlert size={30} /></div>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Algo salió mal</h1>
        <p className="mt-2 max-w-md text-ink-2">No pudimos cargar esta página. Revisa tu conexión e inténtalo de nuevo.</p>
        {error.digest && <p className="mt-1 text-xs text-ink-2">Código: {error.digest}</p>}
        <button onClick={reset} className="btn-primary mt-6"><RefreshCw size={18} /> Reintentar</button>
      </div>
    </div>
  );
}
