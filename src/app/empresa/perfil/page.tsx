import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMyCompany, requireRole } from "@/lib/auth";
import { setCompanyGallery, setCompanyImage } from "@/app/actions/media";
import { CompanyForm } from "@/components/company-form";
import { GalleryUpload, ImageUpload } from "@/components/uploaders";
import { Avatar, CompanyLogo } from "@/components/ui";

export const metadata: Metadata = { title: "Editar empresa" };

export default async function CompanyProfilePage() {
  await requireRole(["empresa"], "/empresa/perfil");
  const c = await getMyCompany();
  if (!c) redirect("/empresa");

  async function saveLogo(url: string | null) {
    "use server";
    return setCompanyImage("logo_url", url);
  }
  async function saveCover(url: string | null) {
    "use server";
    return setCompanyImage("cover_url", url);
  }
  async function saveRep(url: string | null) {
    "use server";
    return setCompanyImage("rep_photo_url", url);
  }

  return (
    <div className="container-x max-w-4xl space-y-6 py-8">
      <Link href="/empresa" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Panel de empresa</Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Editar empresa</h1>

      <section className="card space-y-6 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Imágenes</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUpload bucket="company-media" folder={c.id} prefix="logo" current={c.logo_url} shape="square" label="Logo" onSave={saveLogo} fallback={<CompanyLogo company={{ ...c, logo_url: null }} size={96} />} />
          <ImageUpload bucket="company-media" folder={c.id} prefix="representante" current={c.rep_photo_url} label="Foto del representante" onSave={saveRep} fallback={<Avatar name={c.rep_name || c.short_name} size={104} />} />
        </div>
        <ImageUpload bucket="company-media" folder={c.id} prefix="portada" current={c.cover_url} shape="rect" label="Portada (fachada o instalaciones)" onSave={saveCover} />
        <div>
          <p className="label">Galería</p>
          <GalleryUpload folder={c.id} items={c.gallery} onSave={setCompanyGallery} />
        </div>
      </section>

      <CompanyForm company={c} />
    </div>
  );
}
