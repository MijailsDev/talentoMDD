import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Building2, ClipboardCheck, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/format";
import { APP_STATUS } from "@/lib/constants";
import type { Company } from "@/lib/types";
import { CompanyReview } from "@/components/company-review";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminHome() {
  const supabase = await createClient();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [pending, students, grads, companies, offers, apps, accepted, appsByStatus] = await Promise.all([
    supabase.from("companies").select("*, owner:profiles(email)").eq("status", "pendiente").order("created_at"),
    count(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "estudiante")),
    count(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "egresado")),
    count(supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "verificada")),
    count(supabase.from("offers").select("id", { count: "exact", head: true }).eq("is_active", true).gte("deadline", todayISO())),
    count(supabase.from("applications").select("id", { count: "exact", head: true })),
    count(supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "aceptado")),
    supabase.from("applications").select("status"),
  ]);
  const pend = (pending.data ?? []) as (Company & { owner: { email: string } | null })[];
  const byStatus = Object.fromEntries(Object.keys(APP_STATUS).map((k) => [k, (appsByStatus.data ?? []).filter((a) => a.status === k).length]));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          [Users, "Estudiantes", students], [Users, "Egresados", grads], [Building2, "Empresas verificadas", companies],
          [Briefcase, "Ofertas vigentes", offers], [ClipboardCheck, "Postulaciones", apps],
        ].map(([Icon, l, n]) => {
          const I = Icon as typeof Users;
          return (
            <div key={l as string} className="card p-5">
              <I size={20} className="text-primary" />
              <p className="mt-2 font-display text-3xl font-extrabold">{n as number}</p>
              <p className="text-sm text-ink-2">{l as string}</p>
            </div>
          );
        })}
      </div>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-extrabold">Postulaciones por estado</h2>
        <div className="flex h-4 overflow-hidden rounded-full bg-hover" aria-hidden>
          {Object.entries(byStatus).map(([k, n]) => apps > 0 && n > 0 && (
            <div key={k} className={APP_STATUS[k as keyof typeof APP_STATUS].cls.split(" ")[0]} style={{ width: `${(n / apps) * 100}%` }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          {Object.entries(byStatus).map(([k, n]) => <li key={k} className={`chip ${APP_STATUS[k as keyof typeof APP_STATUS].cls}`}>{APP_STATUS[k as keyof typeof APP_STATUS].label}: {n}</li>)}
        </ul>
        <p className="mt-3 text-sm text-ink-2">Tasa de aceptación: <strong>{apps ? Math.round((accepted / apps) * 100) : 0}%</strong></p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-extrabold"><Clock size={20} className="text-warning" /> Empresas por verificar ({pend.length})</h2>
          <Link href="/admin/empresas" className="btn-ghost btn-sm">Ver todas</Link>
        </div>
        {pend.length === 0 ? (
          <EmptyState icon={<Building2 />} title="No hay empresas pendientes">Las nuevas solicitudes aparecerán aquí.</EmptyState>
        ) : (
          <ul className="space-y-4">{pend.map((c) => <li key={c.id}><CompanyReview c={c} ownerEmail={c.owner?.email} /></li>)}</ul>
        )}
      </section>
    </div>
  );
}
