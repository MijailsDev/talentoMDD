import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import { setCompanyStatus } from "@/app/actions/admin";
import { COMPANY_STATUS } from "@/lib/constants";
import { fmtDateLong } from "@/lib/format";
import type { Company } from "@/lib/types";
import { CompanyLogo } from "./ui";

/** Tarjeta de revisión de una empresa para el administrador */
export function CompanyReview({ c, ownerEmail }: { c: Company; ownerEmail?: string }) {
  const st = COMPANY_STATUS[c.status];
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <CompanyLogo company={c} size={52} />
        <div className="min-w-0 flex-1 basis-56 break-words">
          <p className="flex flex-wrap items-center gap-2 font-bold">{c.name} <span className={`chip ${st.cls}`}>{st.label}</span></p>
          <p className="text-sm text-ink-2">{c.legal_name} · RUC <a href={`https://e-consultaruc.sunat.gob.pe/`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{c.ruc}</a> · {c.sector}</p>
          <p className="text-sm text-ink-2">{c.address} · {c.phone} · {c.email}</p>
          <p className="text-xs text-ink-2">Representante: {c.rep_name || "—"} {c.rep_role && `(${c.rep_role})`} · Cuenta: {ownerEmail ?? "creada por la universidad"} · Registrada el {fmtDateLong(c.created_at)}</p>
          {c.review_note && <p className="mt-1 text-xs text-error">Nota: {c.review_note}</p>}
        </div>
        <Link href={`/empresas/${c.slug}`} className="btn-ghost btn-sm" target="_blank"><ExternalLink size={15} /> Ficha</Link>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {c.status !== "verificada" && (
          <form action={setCompanyStatus}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="status" value="verificada" />
            <button className="btn btn-sm bg-success text-white hover:opacity-90"><Check size={16} /> Verificar</button>
          </form>
        )}
        {c.status !== "rechazada" && (
          <form action={setCompanyStatus} className="flex flex-1 flex-wrap gap-2">
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="status" value="rechazada" />
            <label htmlFor={`note-${c.id}`} className="sr-only">Motivo</label>
            <input id={`note-${c.id}`} name="note" placeholder="Motivo del rechazo (lo verá la empresa)" className="field h-9 min-w-48 flex-1 text-sm" />
            <button className="btn-outline btn-sm text-error"><X size={16} /> {c.status === "verificada" ? "Suspender" : "Rechazar"}</button>
          </form>
        )}
        {c.status === "rechazada" && (
          <form action={setCompanyStatus}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="status" value="pendiente" />
            <button className="btn-ghost btn-sm">Volver a revisión</button>
          </form>
        )}
      </div>
    </div>
  );
}
