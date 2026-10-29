import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { setCv, setProfileImage } from "@/app/actions/media";
import { CvUpload, ImageUpload } from "@/components/uploaders";
import { ProfileForm } from "@/components/profile-form";
import { Avatar } from "@/components/ui";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function EditProfilePage() {
  const { profile: p, uid } = await requireRole(["estudiante", "egresado", "docente"], "/perfil/editar");
  const catalog = await getCatalog();

  async function saveAvatar(url: string | null) {
    "use server";
    return setProfileImage("avatar_url", url);
  }
  async function saveCover(url: string | null) {
    "use server";
    return setProfileImage("cover_url", url);
  }

  return (
    <div className="container-x max-w-4xl space-y-6 py-8">
      <Link href="/perfil" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Volver a mi perfil</Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Editar perfil</h1>

      <section className="card space-y-6 p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">Fotos</h2>
        <ImageUpload bucket="avatars" folder={uid} prefix="avatar" current={p.avatar_url} label="Foto de perfil" onSave={saveAvatar}
          fallback={<Avatar name={`${p.first_name} ${p.last_name}`} size={112} />} />
        <ImageUpload bucket="avatars" folder={uid} prefix="portada" current={p.cover_url} shape="rect" label="Portada" onSave={saveCover} />
      </section>

      {p.role !== "docente" && (
        <section className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Currículum (CV)</h2>
          <CvUpload uid={uid} current={p.cv_path} currentName={p.cv_name} onSave={setCv} />
        </section>
      )}

      <ProfileForm p={p} faculties={catalog.faculties} careers={catalog.careers} />
    </div>
  );
}
