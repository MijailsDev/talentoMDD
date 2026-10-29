"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { slugify, str } from "@/lib/format";
import type { CompanyStatus, Role } from "@/lib/types";
import { CAREER_ICON_KEYS } from "@/components/career-icon";

async function requireAdmin() {
  const s = await getSession();
  if (!s || s.profile.role !== "admin") redirect("/");
  return { s, supabase: await createClient() };
}

export async function setCompanyStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = str(formData.get("status")) as CompanyStatus;
  if (!["pendiente", "verificada", "rechazada"].includes(status)) return;
  await supabase.from("companies").update({ status, review_note: str(formData.get("note")) || null }).eq("id", str(formData.get("id")));
  revalidatePath("/admin", "layout");
  revalidatePath("/empresas");
  revalidatePath("/ofertas");
  revalidatePath("/");
}

export async function updateCompanyStats(formData: FormData) {
  const { supabase } = await requireAdmin();
  const interns = Math.max(0, Number(formData.get("interns_count")) || 0);
  const since = Number(formData.get("since_year")) || new Date().getFullYear();
  await supabase.from("companies").update({ interns_count: interns, since_year: since }).eq("id", str(formData.get("id")));
  revalidatePath("/admin/empresas");
}

export async function deleteCompany(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("companies").delete().eq("id", str(formData.get("id")));
  revalidatePath("/admin", "layout");
  revalidatePath("/empresas");
}

export async function setOfferFlag(formData: FormData) {
  const { supabase } = await requireAdmin();
  const field = str(formData.get("field"));
  if (field !== "featured" && field !== "is_active") return;
  await supabase.from("offers").update({ [field]: formData.get("value") === "true" }).eq("id", str(formData.get("id")));
  revalidatePath("/admin/ofertas");
  revalidatePath("/ofertas");
  revalidatePath("/");
}

export async function setUserRole(formData: FormData) {
  const { s, supabase } = await requireAdmin();
  const id = str(formData.get("id"));
  const role = str(formData.get("role")) as Role;
  if (!["estudiante", "egresado", "docente", "empresa", "admin"].includes(role)) return;
  if (id === s.uid && role !== "admin") return; // evita quitarse a sí mismo el acceso
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function createNews(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = str(formData.get("title"));
  if (!title) return;
  await supabase.from("news").insert({ title: title.slice(0, 140), body: str(formData.get("body")).slice(0, 600), event_date: str(formData.get("event_date")) || undefined });
  revalidatePath("/admin/contenido");
  revalidatePath("/comunidad");
}

export async function deleteNews(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("news").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/admin/contenido");
  revalidatePath("/comunidad");
}

export async function createFaculty(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = str(formData.get("name"));
  if (!name) return;
  await supabase.from("faculties").insert({ id: slugify(name.replace(/^facultad de /i, "")).slice(0, 24), name });
  revalidatePath("/", "layout");
}

export async function createCareer(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = str(formData.get("name"));
  const faculty = str(formData.get("faculty_id"));
  const icon = str(formData.get("icon"));
  if (!name || !faculty) return;
  const base = slugify(name.replace(/^ingenier[ií]a (de |en )?/i, "")).slice(0, 16);
  await supabase.from("careers").insert({ id: `${base}-${Math.random().toString(36).slice(2, 5)}`, faculty_id: faculty, name, icon: CAREER_ICON_KEYS.includes(icon) ? icon : "school" });
  revalidatePath("/", "layout");
}

export async function deleteCareer(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("careers").delete().eq("id", str(formData.get("id")));
  revalidatePath("/", "layout");
}
