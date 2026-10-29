"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyCompany, getSession } from "@/lib/auth";
import type { GalleryItem } from "@/lib/types";

const publicPrefix = (bucket: string, folder: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${folder}/`;

/** Borra del storage un archivo anterior si pertenece a la carpeta indicada */
async function removeOld(bucket: string, folder: string, urlOrPath: string | null | undefined) {
  if (!urlOrPath) return;
  const prefix = publicPrefix(bucket, folder);
  const path = urlOrPath.startsWith(prefix) ? `${folder}/${urlOrPath.slice(prefix.length)}` : urlOrPath.startsWith(folder + "/") ? urlOrPath : null;
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
}

export async function setProfileImage(kind: "avatar_url" | "cover_url", url: string | null) {
  const s = await getSession();
  if (!s) return { error: "Inicia sesión." };
  if (url && !url.startsWith(publicPrefix("avatars", s.uid))) return { error: "Archivo no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ [kind]: url }).eq("id", s.uid);
  if (error) return { error: "No se pudo guardar la imagen." };
  await removeOld("avatars", s.uid, s.profile[kind]);
  revalidatePath("/", "layout");
  return {};
}

export async function setCv(path: string | null, name: string | null) {
  const s = await getSession();
  if (!s) return { error: "Inicia sesión." };
  if (path && !path.startsWith(`${s.uid}/`)) return { error: "Archivo no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ cv_path: path, cv_name: path ? (name ?? "CV.pdf").slice(0, 120) : null }).eq("id", s.uid);
  if (error) return { error: "No se pudo guardar el CV." };
  // El CV anterior se conserva si alguna postulación lo usa; solo se borra si no.
  if (s.profile.cv_path && s.profile.cv_path !== path) {
    const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("cv_path", s.profile.cv_path);
    if (!count) await removeOld("cvs", s.uid, s.profile.cv_path);
  }
  revalidatePath("/perfil");
  revalidatePath("/perfil/editar");
  return {};
}

export async function getCvUrl(path: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("cvs").createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}

type CompanyImageKind = "logo_url" | "cover_url" | "rep_photo_url";

export async function setCompanyImage(kind: CompanyImageKind, url: string | null) {
  const c = await getMyCompany();
  if (!c) return { error: "Primero registra tu empresa." };
  if (url && !url.startsWith(publicPrefix("company-media", c.id))) return { error: "Archivo no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("companies").update({ [kind]: url }).eq("id", c.id);
  if (error) return { error: "No se pudo guardar la imagen." };
  await removeOld("company-media", c.id, c[kind]);
  revalidatePath("/empresa", "layout");
  revalidatePath(`/empresas/${c.slug}`);
  return {};
}

export async function setCompanyGallery(gallery: GalleryItem[]) {
  const c = await getMyCompany();
  if (!c) return { error: "Primero registra tu empresa." };
  const prefix = publicPrefix("company-media", c.id);
  const clean = gallery.filter((g) => g.url.startsWith(prefix)).slice(0, 8).map((g) => ({ label: g.label.slice(0, 60) || "foto", url: g.url }));
  const supabase = await createClient();
  const { error } = await supabase.from("companies").update({ gallery: clean }).eq("id", c.id);
  if (error) return { error: "No se pudo guardar la galería." };
  for (const old of c.gallery) if (!clean.some((g) => g.url === old.url)) await removeOld("company-media", c.id, old.url);
  revalidatePath("/empresa/perfil");
  revalidatePath(`/empresas/${c.slug}`);
  return {};
}
