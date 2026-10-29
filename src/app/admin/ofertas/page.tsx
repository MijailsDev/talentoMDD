import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OFFER_TYPES } from "@/lib/constants";
import { deadlineText } from "@/lib/format";
import { setOfferFlag } from "@/app/actions/admin";
import type { OfferWithCompany } from "@/lib/types";

export const metadata: Metadata = { title: "Ofertas · Administración" };

export default async function AdminOffers() {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("*, company:companies(*), applications(id)").order("created_at", { ascending: false });
  const offers = (data ?? []) as (OfferWithCompany & { applications: { id: string }[] })[];

  return (
    <div className="card overflow-x-auto">
      <p className="border-b border-line p-4 text-sm text-ink-2">Las ofertas <strong>destacadas</strong> aparecen primero en la portada (máximo 6 visibles).</p>
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-ink-2">
          <tr><th className="px-5 py-3">Oferta</th><th className="px-3 py-3">Empresa</th><th className="px-3 py-3">Postulaciones</th><th className="px-3 py-3">Cierre</th><th className="px-5 py-3 text-right">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {offers.map((o) => {
            const dl = deadlineText(o.deadline);
            return (
              <tr key={o.id}>
                <td className="px-5 py-3">
                  <Link href={`/ofertas/${o.id}`} className="font-semibold hover:text-primary">{o.title}</Link>
                  <p className="text-xs text-ink-2">{OFFER_TYPES[o.type].label}{!o.is_active && " · Pausada"}{o.featured && " · Destacada"}</p>
                </td>
                <td className="px-3 py-3">{o.company.short_name}{o.company.status !== "verificada" && <span className="chip ml-1 bg-warning-soft text-warning">{o.company.status}</span>}</td>
                <td className="px-3 py-3">{o.applications.length}</td>
                <td className={`px-3 py-3 ${dl.closed ? "text-error" : dl.soon ? "text-warning" : "text-ink-2"}`}>{dl.text}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <form action={setOfferFlag}>
                      <input type="hidden" name="id" value={o.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value={String(!o.featured)} />
                      <button className={`btn-ghost btn-sm ${o.featured ? "text-primary" : ""}`} title={o.featured ? "Quitar de destacadas" : "Destacar en portada"} aria-label={o.featured ? "Quitar de destacadas" : "Destacar en portada"}>
                        <Star size={16} fill={o.featured ? "currentColor" : "none"} />
                      </button>
                    </form>
                    <form action={setOfferFlag}>
                      <input type="hidden" name="id" value={o.id} /><input type="hidden" name="field" value="is_active" /><input type="hidden" name="value" value={String(!o.is_active)} />
                      <button className="btn-ghost btn-sm" title={o.is_active ? "Ocultar oferta" : "Mostrar oferta"} aria-label={o.is_active ? "Ocultar oferta" : "Mostrar oferta"}>{o.is_active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
