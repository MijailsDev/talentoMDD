import { BadgeCheck, Briefcase, MapPin } from "lucide-react";
import { AUTH_PHOTO, BRAND, UNIVERSITY } from "@/lib/constants";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-x py-10 lg:py-14">
      <div className="grid overflow-hidden rounded-[26px] border border-line bg-surface shadow-[var(--shadow-card)] lg:grid-cols-2">
        <div className="relative min-h-[240px] bg-[radial-gradient(120%_100%_at_20%_10%,#c80036,#a1002c)] text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AUTH_PHOTO} alt="Campus universitario" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/10 to-dark/80" />
          <div className="absolute inset-x-[clamp(20px,4vw,40px)] bottom-[clamp(20px,4vw,40px)] flex flex-col gap-2.5">
            <span className="cinta h-2 w-24 rounded-sm" aria-hidden />
            <p className="font-display text-[clamp(24px,2.6vw,32px)] font-extrabold leading-tight">Tu primera experiencia profesional empieza aquí</p>
            <ul className="hidden space-y-2 text-sm text-[#FBE6DA] sm:block">
              <li className="flex gap-2.5"><BadgeCheck size={18} className="shrink-0" /> Empresas verificadas por la {UNIVERSITY}</li>
              <li className="flex gap-2.5"><Briefcase size={18} className="shrink-0" /> Prácticas, empleos y voluntariados</li>
              <li className="flex gap-2.5"><MapPin size={18} className="shrink-0" /> Ubicación, contacto y representante de cada empresa</li>
            </ul>
          </div>
        </div>
        <div className="p-[clamp(24px,4vw,48px)]">
          <p className="eyebrow">{BRAND} · {UNIVERSITY}</p>
          <h1 className="mt-2 font-display text-[clamp(26px,3vw,34px)] font-extrabold tracking-tight">{title}</h1>
          <p className="mb-7 mt-2 text-ink-2">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
