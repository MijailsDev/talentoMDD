import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMyCompany, requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { OfferForm } from "@/components/offer-form";

export const metadata: Metadata = { title: "Nueva oferta" };

export default async function NewOfferPage() {
  await requireRole(["empresa"], "/empresa/ofertas/nueva");
  const c = await getMyCompany();
  if (!c || c.status !== "verificada") redirect("/empresa");
  const catalog = await getCatalog();
  return (
    <div className="container-x max-w-4xl space-y-6 py-8">
      <Link href="/empresa" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Panel de empresa</Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Publicar nueva oferta</h1>
      <OfferForm offer={null} faculties={catalog.faculties} careers={catalog.careers} minDate={todayISO()} />
    </div>
  );
}
