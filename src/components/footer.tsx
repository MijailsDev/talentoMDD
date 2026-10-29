import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BRAND, DOMAIN, UNIVERSITY, UNIVERSITY_FULL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 bg-dark text-white/80">
      <div className="band h-3" aria-hidden />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isotipo.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <span className="font-display text-xl font-extrabold text-white">{BRAND}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Portal de empleabilidad de la {UNIVERSITY_FULL}. Conecta a estudiantes y egresados con empresas verificadas de Madre de Dios y del Perú.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white">Explora</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/ofertas" className="hover:text-white">Ofertas</Link></li>
            <li><Link href="/empresas" className="hover:text-white">Empresas aliadas</Link></li>
            <li><Link href="/comunidad" className="hover:text-white">Comunidad</Link></li>
            <li><Link href="/#preguntas" className="hover:text-white">Preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white">Cuentas</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/registro" className="hover:text-white">Crear cuenta</Link></li>
            <li><Link href="/registro?rol=empresa" className="hover:text-white">Registrar mi empresa</Link></li>
            <li><Link href="/login" className="hover:text-white">Iniciar sesión</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white">Oficina de Empleabilidad</h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2"><MapPin size={17} className="mt-0.5 shrink-0" /> Av. Jorge Chávez 1160, Puerto Maldonado, Tambopata</li>
            <li className="flex gap-2"><Phone size={17} className="mt-0.5 shrink-0" /> (082) 57 1199</li>
            <li className="flex gap-2"><Mail size={17} className="mt-0.5 shrink-0" /> empleabilidad@{DOMAIN}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap justify-between gap-2 py-5 text-xs">
          <span>© {new Date().getFullYear()} {BRAND} · {UNIVERSITY}</span>
          <span>Tus datos personales se tratan conforme a la Ley N.º 29733.</span>
        </div>
      </div>
    </footer>
  );
}
