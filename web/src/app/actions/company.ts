"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyCompany, getSession } from "@/lib/auth";
import { lines, slugify, str } from "@/lib/format";
import type { AppStatus, FormState, OfferType, WorkMode } from "@/lib/types";

async function requireCompanyUser() {
  const s = await getSession();
  if (!s) redirect("/login?next=/empresa");
  if (s.profile.role !== "empresa" && s.profile.role !== "admin") redirect("/");
  return s;
}

export async function saveCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireCompanyUser();
  const existing = await getMyCompany();
  const v = (k: string) => str(formData.get(k));
  const fields: Record<string, string> = {};
  const name = v("name");
  const ruc = v("ruc");
  if (!name) fields.name = "Ingresa el nombre comercial.";
  if (!v("legal_name")) fields.legal_name = "Ingresa la razón social.";
  if (!/^(10|15|17|20)\d{9}$/.test(ruc)) fields.ruc = "El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20.";
  if (!v("sector")) fields.sector = "Elige un rubro.";
  if (!v("description") || v("description").length < 40) fields.description = "Describe tu empresa (mínimo 40 caracteres).";
  if (!v("address")) fields.address = "Ingresa la dirección.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) fields.email = "Ingresa un correo de contacto válido.";
  if (!v("phone")) fields.phone = "Ingresa un teléfono.";
  if (!v("rep_name")) fields.rep_name = "Ingresa el nombre del representante.";
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lng = formData.get("lng") ? Number(formData.get("lng")) : null;
  if ((lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) || (lng !== null && (isNaN(lng) || lng < -180 || lng > 180))) fields.lat = "Coordenadas no válidas.";
  if (Object.keys(fields).length) return { error: "Revisa los campos marcados.", fields };

  const color = /^#[0-9a-f]{6}$/i.test(v("color")) ? v("color") : "#A1002C";
  const row = {
    name, short_name: v("short_name") || name, legal_name: v("legal_name"), ruc, sector: v("sector"),
    logo_text: (v("logo_text") || name.split(/\s+/).map((w) => w[0]).join("")).slice(0, 3).toUpperCase(), color,
    description: v("description").slice(0, 3000), address: v("address"), reference: v("reference"), district: v("district") || "Tambopata",
    lat, lng, phone: v("phone"), email: v("email").toLowerCase(), website: v("website"), social: v("social"), hours: v("hours"),
    rep_name: v("rep_name"), rep_role: v("rep_role"), rep_email: v("rep_email").toLowerCase(), rep_phone: v("rep_phone"),
  };

  const supabase = await createClient();
  if (existing) {
    const { error } = await supabase.from("companies").update(row).eq("id", existing.id);
    if (error) return { error: "No se pudo guardar. Inténtalo de nuevo." };
    revalidatePath("/empresa", "layout");
    revalidatePath(`/empresas/${existing.slug}`);
    return { ok: existing.ruc !== ruc || existing.legal_name !== row.legal_name ? "Datos guardados. Como cambiaste el RUC o la razón social, la universidad volverá a verificar tu empresa." : "Datos guardados." };
  }

  const s = await getSession();
  let slug = slugify(row.short_name);
  const { data: taken } = await supabase.from("companies").select("slug").like("slug", `${slug}%`);
  if (taken?.some((t) => t.slug === slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const { error } = await supabase.from("companies").insert({ ...row, slug, owner_id: s!.uid });
  if (error) return { error: error.code === "42501" ? "Tu cuenta ya tiene una empresa registrada." : "No se pudo registrar la empresa." };
  revalidatePath("/empresa", "layout");
  redirect("/empresa?registrada=1");
}

export async function saveOffer(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireCompanyUser();
  const company = await getMyCompany();
  if (!company) redirect("/empresa");
  if (company.status !== "verificada") return { error: "Tu empresa debe estar verificada para publicar ofertas." };
  const id = str(formData.get("id"));
  const v = (k: string) => str(formData.get(k));
  const fields: Record<string, string> = {};
  const type = v("type") as OfferType;
  const mode = v("mode") as WorkMode;
  const careers = formData.getAll("career_ids").map(String).filter(Boolean);
  const vacancies = Number(v("vacancies"));
  const deadline = v("deadline");
  if (!v("title")) fields.title = "Ingresa el nombre del puesto.";
  if (!["pre", "pro", "emp", "vol"].includes(type)) fields.type = "Elige el tipo de oferta.";
  if (!["Presencial", "Remoto", "Híbrido"].includes(mode)) fields.mode = "Elige la modalidad.";
  if (!careers.length) fields.career_ids = "Elige al menos una carrera.";
  if (!Number.isInteger(vacancies) || vacancies < 1 || vacancies > 500) fields.vacancies = "Número de vacantes no válido.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) fields.deadline = "Elige la fecha límite.";
  if (v("description").length < 30) fields.description = "Describe el puesto (mínimo 30 caracteres).";
  if (Object.keys(fields).length) return { error: "Revisa los campos marcados.", fields };

  const minCycle = Number(v("min_cycle"));
  const row = {
    company_id: company.id, type, mode, title: v("title").slice(0, 140), place: v("place") || null, career_ids: careers,
    min_cycle: minCycle >= 1 && minCycle <= 12 ? minCycle : null, graduates_only: formData.get("graduates_only") === "on",
    pay: v("pay"), paid: formData.get("paid") === "on", vacancies, deadline, description: v("description").slice(0, 4000),
    functions: lines(formData.get("functions")), skills: lines(formData.get("skills")), languages: lines(formData.get("languages")),
    documents: lines(formData.get("documents")), benefits: lines(formData.get("benefits")), stages: lines(formData.get("stages")),
    schedule: v("schedule"), duration: v("duration"), start_text: v("start_text"),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("offers").update(row).eq("id", id).eq("company_id", company.id)
    : await supabase.from("offers").insert(row);
  if (error) return { error: "No se pudo guardar la oferta." };
  revalidatePath("/empresa");
  revalidatePath("/ofertas");
  revalidatePath("/");
  redirect(`/empresa?oferta=${id ? "actualizada" : "publicada"}`);
}

export async function toggleOfferActive(formData: FormData) {
  await requireCompanyUser();
  const supabase = await createClient();
  await supabase.from("offers").update({ is_active: formData.get("active") === "true" }).eq("id", str(formData.get("id")));
  revalidatePath("/empresa");
  revalidatePath("/ofertas");
}

export async function deleteOffer(formData: FormData) {
  await requireCompanyUser();
  const supabase = await createClient();
  await supabase.from("offers").delete().eq("id", str(formData.get("id")));
  revalidatePath("/empresa");
  revalidatePath("/ofertas");
}

export async function setApplicationStatus(formData: FormData) {
  await requireCompanyUser();
  const status = str(formData.get("status")) as AppStatus;
  if (!["postulado", "revision", "entrevista", "aceptado", "rechazado"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("applications").update({ status }).eq("id", str(formData.get("id")));
  revalidatePath(`/empresa/ofertas/${str(formData.get("offer_id"))}/postulantes`);
}
