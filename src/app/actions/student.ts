"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { lines, str } from "@/lib/format";
import type { Certification, Experience, FormState, Language, Project } from "@/lib/types";

export async function toggleSave(offerId: string, path: string) {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (s.profile.role !== "estudiante" && s.profile.role !== "egresado") return { error: "Solo estudiantes y egresados pueden guardar ofertas." };
  const supabase = await createClient();
  const { data } = await supabase.from("saved_offers").select("offer_id").eq("student_id", s.uid).eq("offer_id", offerId).maybeSingle();
  const { error } = data
    ? await supabase.from("saved_offers").delete().eq("student_id", s.uid).eq("offer_id", offerId)
    : await supabase.from("saved_offers").insert({ student_id: s.uid, offer_id: offerId });
  if (error) return { error: "No se pudo actualizar tus guardados." };
  revalidatePath("/postulaciones");
  return { saved: !data };
}

export async function applyToOffer(_prev: FormState, formData: FormData): Promise<FormState> {
  const offerId = str(formData.get("offer_id"));
  const s = await getSession();
  if (!s) redirect(`/login?next=/ofertas/${offerId}`);
  const supabase = await createClient();
  const { data: offer } = await supabase.from("offers").select("type").eq("id", offerId).single();
  if (offer && offer.type !== "vol" && !s.profile.cv_path) {
    return { error: "Sube tu CV en «Mi perfil» antes de postular a esta oferta." };
  }
  const { error } = await supabase.from("applications").insert({
    offer_id: offerId,
    student_id: s.uid,
    message: str(formData.get("message")).slice(0, 2000),
    cv_path: s.profile.cv_path,
  });
  if (error) {
    if (error.code === "23505") return { error: "Ya postulaste a esta oferta." };
    return { error: error.code === "P0001" ? error.message : "No se pudo enviar tu postulación. Inténtalo de nuevo." };
  }
  revalidatePath(`/ofertas/${offerId}`);
  revalidatePath("/postulaciones");
  return { ok: "¡Postulación enviada! Puedes seguir su estado en «Mis postulaciones»." };
}

export async function withdrawApplication(formData: FormData) {
  const s = await getSession();
  if (!s) redirect("/login");
  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", str(formData.get("id"))).eq("student_id", s.uid);
  revalidatePath("/postulaciones");
}

export async function toggleConnection(formData: FormData) {
  const s = await getSession();
  if (!s) redirect("/login?next=/comunidad");
  const to = str(formData.get("to"));
  const supabase = await createClient();
  const { data } = await supabase.from("connections").select("to_id").eq("from_id", s.uid).eq("to_id", to).maybeSingle();
  if (data) await supabase.from("connections").delete().eq("from_id", s.uid).eq("to_id", to);
  else await supabase.from("connections").insert({ from_id: s.uid, to_id: to });
  revalidatePath("/comunidad");
}

function parseJson<T>(v: FormDataEntryValue | null, clean: (x: T) => boolean): T[] {
  try {
    const arr = JSON.parse(String(v ?? "[]"));
    return Array.isArray(arr) ? arr.filter(clean).slice(0, 30) : [];
  } catch {
    return [];
  }
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await getSession();
  if (!s) redirect("/login?next=/perfil/editar");
  const first = str(formData.get("first_name"));
  const last = str(formData.get("last_name"));
  const fields: Record<string, string> = {};
  if (!first) fields.first_name = "Ingresa tus nombres.";
  if (!last) fields.last_name = "Ingresa tus apellidos.";
  const phone = str(formData.get("phone"));
  if (phone && !/^[+\d\s()-]{6,20}$/.test(phone)) fields.phone = "Teléfono no válido.";
  const cycle = Number(formData.get("cycle")) || null;
  const grad = Number(formData.get("grad_year")) || null;
  if (Object.keys(fields).length) return { error: "Revisa los campos marcados.", fields };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: first,
      last_name: last,
      phone: phone || null,
      career_id: str(formData.get("career_id")) || null,
      cycle: cycle && cycle >= 1 && cycle <= 12 ? cycle : null,
      grad_year: grad && grad > 1990 && grad < 2100 ? grad : null,
      headline: str(formData.get("headline")).slice(0, 160),
      location: str(formData.get("location")).slice(0, 120),
      about: str(formData.get("about")).slice(0, 2000),
      skills: lines(formData.get("skills")).slice(0, 25),
      experience: parseJson<Experience>(formData.get("experience"), (x) => !!x?.title),
      projects: parseJson<Project>(formData.get("projects"), (x) => !!x?.name),
      certifications: parseJson<Certification>(formData.get("certifications"), (x) => !!x?.name),
      languages: parseJson<Language>(formData.get("languages"), (x) => !!x?.name),
    })
    .eq("id", s.uid);
  if (error) return { error: "No se pudo guardar tu perfil." };
  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  redirect("/perfil?guardado=1");
}
