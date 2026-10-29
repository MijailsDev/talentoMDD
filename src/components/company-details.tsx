import { BadgeCheck, Clock, Globe, Mail, MapPin, Navigation, Phone, Share2 } from "lucide-react";
import type { Company } from "@/lib/types";
import { UNIVERSITY } from "@/lib/constants";
import { Avatar } from "./ui";
import { Gallery } from "./gallery";
import { OfferMap } from "./map";

const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
const href = (u: string) => (/^https?:\/\//.test(u) ? u : `https://${u}`);

export function VerifiedBanner({ company }: { company: Company }) {
  if (company.status !== "verificada") return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success-soft p-4 text-success">
      <BadgeCheck className="shrink-0" />
      <p className="text-sm font-semibold">Empresa verificada por la {UNIVERSITY} · aliada desde {company.since_year}</p>
    </div>
  );
}

export function CompanyContact({ company: c }: { company: Company }) {
  const hasMap = c.lat != null && c.lng != null && c.district !== "Remoto";
  return (
    <div className="space-y-6">
      {c.gallery.length > 0 && (
        <div>
          <h3 className="mb-3 font-sans text-base font-bold">Galería</h3>
          <Gallery items={c.gallery} company={c.short_name} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-sans text-base font-bold">Ubicación y contacto</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-primary" /><span><strong className="block">{c.address}</strong>{c.reference && <span className="text-ink-2">Referencia: {c.reference}</span>}</span></li>
            {c.phone && <li className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-primary" /><a href={tel(c.phone)} className="hover:text-primary hover:underline">{c.phone}</a></li>}
            {c.email && <li className="flex gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-primary" /><a href={`mailto:${c.email}`} className="break-all hover:text-primary hover:underline">{c.email}</a></li>}
            {c.website && <li className="flex gap-3"><Globe size={18} className="mt-0.5 shrink-0 text-primary" /><a href={href(c.website)} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">{c.website}</a></li>}
            {c.social && <li className="flex gap-3"><Share2 size={18} className="mt-0.5 shrink-0 text-primary" /><a href={href(c.social)} target="_blank" rel="noopener noreferrer" className="break-all hover:text-primary hover:underline">{c.social}</a></li>}
            {c.hours && <li className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-primary" /><span>{c.hours}</span></li>}
          </ul>
          {c.rep_name && (
            <div className="rounded-2xl border border-line bg-surface-2 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-2">Representante de la empresa</p>
              <div className="flex items-start gap-3">
                <Avatar name={c.rep_name} url={c.rep_photo_url} size={52} />
                <div className="min-w-0 text-sm">
                  <p className="font-bold">{c.rep_name}</p>
                  <p className="text-ink-2">{c.rep_role}</p>
                  {c.rep_email && <a href={`mailto:${c.rep_email}`} className="mt-1 block break-all text-primary hover:underline">{c.rep_email}</a>}
                  {c.rep_phone && <a href={tel(c.rep_phone)} className="block text-primary hover:underline">{c.rep_phone}</a>}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {hasMap ? (
            <>
              <OfferMap points={[{ lat: c.lat!, lng: c.lng!, title: c.short_name, subtitle: c.address }]} height={300} />
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                <Navigation size={18} /> Cómo llegar
              </a>
            </>
          ) : (
            <div className="grid h-[300px] place-items-center rounded-[18px] border border-dashed border-line-strong bg-surface-2 p-6 text-center text-sm text-ink-2">
              {c.district === "Remoto" ? "Esta organización trabaja de forma remota." : "La empresa aún no registró su ubicación en el mapa."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
