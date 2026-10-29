import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMPANY_STATUS } from "@/lib/constants";
import { deleteCompany, updateCompanyStats } from "@/app/actions/admin";
import type { Company, CompanyStatus } from "@/lib/types";
import { CompanyReview } from "@/components/company-review";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Empresas · Administración" };

export default async function AdminCompanies({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado = "todas" } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*, owner:profiles(email)").order("created_at", { ascending: false });
  const all = (data ?? []) as (Company & { owner: { email: string } | null })[];
  const list = estado === "todas" ? all : all.filter((c) => c.status === estado);

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
        {["todas", "pendiente", "verificada", "rechazada"].map((k) => (
          <Link key={k} href={`?estado=${k}`} scroll={false} aria-current={estado === k || undefined}
            className={`chip border px-3 py-1.5 text-sm ${estado === k ? "border-primary bg-primary text-white" : "border-line-strong bg-surface"}`}>
            {k === "todas" ? "Todas" : COMPANY_STATUS[k as CompanyStatus].label} ({k === "todas" ? all.length : all.filter((c) => c.status === k).length})
          </Link>
        ))}
      </nav>
      {list.length === 0 ? <EmptyState icon={<Building2 />} title="Sin empresas en este estado" /> : (
        <ul className="space-y-4">
          {list.map((c) => (
            <li key={c.id} className="space-y-2">
              <CompanyReview c={c} ownerEmail={c.owner?.email} />
              <div className="flex flex-wrap items-center gap-3 px-2 text-sm">
                <form action={updateCompanyStats} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <label className="flex items-center gap-1.5 text-ink-2">Practicantes recibidos <input name="interns_count" type="number" min={0} defaultValue={c.interns_count} className="field h-8 w-20 text-sm" /></label>
                  <label className="flex items-center gap-1.5 text-ink-2">Aliada desde <input name="since_year" type="number" min={1990} max={2100} defaultValue={c.since_year} className="field h-8 w-24 text-sm" /></label>
                  <button className="btn-ghost btn-sm">Guardar</button>
                </form>
                <span className="flex-1" />
                <ConfirmButton action={deleteCompany} fields={{ id: c.id }} message={`¿Eliminar definitivamente «${c.name}» con todas sus ofertas y postulaciones? Esta acción no se puede deshacer.`} className="btn-ghost btn-sm text-error" title="Eliminar empresa">
                  <Trash2 size={15} /> Eliminar
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
