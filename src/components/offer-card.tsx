import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";
import { OFFER_TYPES } from "@/lib/constants";
import { deadlineText, isNew, plural } from "@/lib/format";
import type { OfferWithCompany } from "@/lib/types";
import { CompanyLogo, Cover, Verified } from "./ui";
import { SaveButton } from "./save-button";

export function offerPlace(o: OfferWithCompany) {
  if (o.mode === "Remoto") return "Remoto · Perú";
  if (o.place) return o.place;
  const city = o.company.district === "Tambopata" ? "Puerto Maldonado" : o.company.district;
  return `${city}, Madre de Dios`;
}

export function careersText(ids: string[], careerName: (id: string) => string) {
  const names = ids.map(careerName);
  return names.length > 2 ? `${names.slice(0, 2).join(", ")} y ${names.length - 2} más` : names.join(" · ");
}

export function OfferCard({ offer: o, careerName, saved, canSave }: { offer: OfferWithCompany; careerName: (id: string) => string; saved: boolean; canSave: boolean }) {
  const t = OFFER_TYPES[o.type];
  const dl = deadlineText(o.deadline);
  const fresh = isNew(o.created_at);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-[translate,scale,border-color,box-shadow] duration-200 ease-out hover:border-peach hover:shadow-[0_26px_50px_rgba(200,0,54,.2)] motion-safe:hover:-translate-y-1 active:not-has-[button:active]:scale-[0.99]">
      <div className="relative mx-2 mt-2 h-[150px] shrink-0 overflow-hidden rounded-2xl">
        <Cover src={o.company.cover_url} className="transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/45" />
        {(dl.soon || fresh) && (
          <span className={`chip absolute left-3 top-3 ${dl.soon ? "bg-warning-soft text-warning" : "bg-primary text-white"}`}>
            {dl.soon ? "Cierra pronto" : "Nueva"}
          </span>
        )}
      </div>
      <CompanyLogo company={o.company} size={52} className="absolute left-6 top-[132px] z-[1] border-[3px] border-surface shadow-md" />
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-8">
        <div className={`flex flex-wrap gap-1.5 ${canSave ? "pr-11" : ""}`}>
          <span className={`chip ${t.cls}`}>{t.label}</span>
          <span className="chip bg-hover text-ink-2">{o.mode}</span>
        </div>
        <h3 className="mt-0.5 font-sans text-[17px] font-bold leading-snug">
          <Link href={`/ofertas/${o.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {o.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-ink-2">
          {o.company.short_name} {o.company.status === "verificada" && <Verified />}
        </p>
        <div className="space-y-1 text-[13px] text-ink-2">
          <p className="flex items-start gap-1.5"><MapPin size={15} className="mt-0.5 shrink-0" /> {offerPlace(o)}</p>
          <p className="flex items-start gap-1.5"><GraduationCap size={15} className="mt-0.5 shrink-0" /> {careersText(o.career_ids, careerName)}</p>
        </div>
        <span className="flex-1" />
        <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-[13px]">
          <span className={`font-semibold ${dl.soon ? "text-warning" : "text-ink-2"}`}>{dl.text}</span>
          <span className="text-ink-2">{plural(o.vacancies, "vacante", "vacantes")}</span>
        </div>
      </div>
      {canSave && (
        <div className="absolute right-3 top-[164px]">
          <SaveButton offerId={o.id} saved={saved} />
        </div>
      )}
    </article>
  );
}
