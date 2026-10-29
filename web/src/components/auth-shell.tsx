import { BadgeCheck, Briefcase, MapPin } from "lucide-react";
import { AUTH_PHOTO, BRAND, UNIVERSITY } from "@/lib/constants";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_1.05fr] lg:py-16">
      <div className="relative hidden overflow-hidden rounded-[28px] bg-dark lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUTH_PHOTO} alt="Campus universitario" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <p className="font-serif text-4xl italic leading-tight">Tu primera experiencia profesional empieza aquí.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li className="flex gap-2.5"><BadgeCheck size={18} /> Empresas verificadas por la {UNIVERSITY}</li>
            <li className="flex gap-2.5"><Briefcase size={18} /> Prácticas, empleos y voluntariados</li>
            <li className="flex gap-2.5"><MapPin size={18} /> Ubicación, contacto y representante de cada empresa</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg">
        <p className="eyebrow">{BRAND} · {UNIVERSITY}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mb-7 mt-2 text-ink-2">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
