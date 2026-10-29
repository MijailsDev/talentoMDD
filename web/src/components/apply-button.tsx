"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Send, X } from "lucide-react";
import { applyToOffer } from "@/app/actions/student";
import { FormMessage, SubmitButton, useFormAction } from "./form-ui";

type Props = {
  offerId: string;
  title: string;
  company: string;
  state: "guest" | "closed" | "applied" | "not-allowed" | "can-apply";
  cvName: string | null;
  needsCv: boolean;
};

export function ApplyButton({ offerId, title, company, state, cvName, needsCv }: Props) {
  const [open, setOpen] = useState(false);
  const { state: result, pending, onSubmit } = useFormAction(applyToOffer);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  if (state === "guest") return <Link href={`/login?next=/ofertas/${offerId}`} className="btn-primary w-full">Inicia sesión para postular</Link>;
  if (state === "closed") return <button disabled className="btn-outline w-full">Convocatoria cerrada</button>;
  if (state === "applied" || result?.ok)
    return (
      <Link href="/postulaciones" className="btn w-full bg-success-soft text-success">
        <CheckCircle2 size={18} /> Ya postulaste · ver estado
      </Link>
    );
  if (state === "not-allowed") return <p className="rounded-xl bg-hover p-3 text-center text-sm text-ink-2">Solo estudiantes y egresados pueden postular.</p>;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary w-full">
        <Send size={18} /> Postular
      </button>
      <dialog ref={dialog} onClose={() => setOpen(false)} className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[24px] border border-line bg-surface p-0 text-ink shadow-[var(--shadow-pop)] backdrop:bg-dark/50 backdrop:backdrop-blur-sm">
        <form method="post" onSubmit={onSubmit} className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Postulación</p>
              <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
              <p className="text-sm text-ink-2">{company}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost h-9 w-9 px-0" aria-label="Cerrar"><X size={20} /></button>
          </div>
          <input type="hidden" name="offer_id" value={offerId} />
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 text-sm">
            <FileText className="shrink-0 text-primary" />
            {cvName ? (
              <span>Se enviará tu CV: <strong>{cvName}</strong></span>
            ) : (
              <span className={needsCv ? "font-semibold text-error" : ""}>
                {needsCv ? "Necesitas subir tu CV para postular. " : "No tienes CV cargado (opcional para voluntariados). "}
                <Link href="/perfil/editar#cv" className="text-primary underline">Subir CV</Link>
              </span>
            )}
          </div>
          <div>
            <label htmlFor="message" className="label">Mensaje para la empresa <span className="font-normal text-ink-2">(opcional)</span></label>
            <textarea id="message" name="message" rows={5} maxLength={2000} className="field" placeholder="Cuéntales por qué te interesa esta oferta y qué puedes aportar." />
          </div>
          <FormMessage state={result} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
            <SubmitButton busy={pending} pendingText="Enviando…" disabled={needsCv && !cvName}>Enviar postulación</SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
