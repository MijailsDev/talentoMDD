import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary"><Compass size={30} /></div>
        <h1 className="mt-5 font-display text-4xl font-extrabold">Página no encontrada</h1>
        <p className="mt-2 text-ink-2">La oferta o página que buscas ya no existe o cambió de dirección.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-outline">Ir al inicio</Link>
          <Link href="/ofertas" className="btn-primary">Ver ofertas</Link>
        </div>
      </div>
    </div>
  );
}
