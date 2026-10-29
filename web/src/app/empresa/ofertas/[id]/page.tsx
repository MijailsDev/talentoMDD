import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMyCompany, requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Offer } from "@/lib/types";
import { OfferForm } from "@/components/offer-form";

export const metadata: Metadata = { title: "Editar oferta" };

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole(["empresa"], `/empresa/ofertas/${id}`);
  const c = await getMyCompany();
  if (!c) redirect("/empresa");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("*").eq("id", id).eq("company_id", c.id).maybeSingle<Offer>();
  if (!data) notFound();
  const catalog = await getCatalog();
  return (
    <div className="container-x max-w-4xl space-y-6 py-8">
      <Link href="/empresa" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Panel de empresa</Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Editar oferta</h1>
      <OfferForm offer={data} faculties={catalog.faculties} careers={catalog.careers} />
    </div>
  );
}
