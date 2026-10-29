"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { homeFor } from "@/lib/auth";
import { DOMAIN } from "@/lib/constants";
import { str } from "@/lib/format";
import type { FormState, Role } from "@/lib/types";

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = str(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: "Ingresa tu correo y tu contraseña.", fields: { email } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Aún no confirmas tu correo. Revisa tu bandeja de entrada (y la carpeta de spam)."
      : "Correo o contraseña incorrectos.";
    return { error: msg, fields: { email } };
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single<{ role: Role }>();
  revalidatePath("/", "layout");
  redirect(safeNext(str(formData.get("next"))) || homeFor(profile?.role ?? "estudiante"));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const role = (["estudiante", "egresado", "docente", "empresa"].includes(str(formData.get("role"))) ? str(formData.get("role")) : "estudiante") as Role;
  const first = str(formData.get("first_name"));
  const last = str(formData.get("last_name"));
  const email = str(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const keep = { role, first_name: first, last_name: last, email };
  const fields: Record<string, string> = {};

  if (!first) fields.first_name = "Ingresa tus nombres.";
  if (!last) fields.last_name = "Ingresa tus apellidos.";
  if (!EMAIL_RE.test(email)) fields.email = "Ingresa un correo válido.";
  else if (role !== "empresa" && !email.endsWith("@" + DOMAIN)) fields.email = `Usa tu correo institucional @${DOMAIN}.`;
  if (password.length < 8) fields.password = "Usa al menos 8 caracteres.";
  if (password !== confirm) fields.confirm = "Las contraseñas no coinciden.";
  if (formData.get("terms") !== "on") fields.terms = "Debes aceptar los términos y la política de datos.";
  if (Object.keys(fields).length) return { error: "Revisa los campos marcados.", fields: { ...keep, ...fields, _invalid: Object.keys(fields).join(",") } };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=${role === "empresa" ? "/empresa" : "/perfil"}`,
      data: { first_name: first, last_name: last, role },
    },
  });
  if (error) {
    const msg = /registered|already/i.test(error.message)
      ? "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña."
      : /database error/i.test(error.message)
        ? `No se pudo crear la cuenta. Verifica que uses tu correo @${DOMAIN}.`
        : error.message;
    return { error: msg, fields: keep };
  }
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(homeFor(role));
  }
  return { ok: `Te enviamos un enlace de confirmación a ${email}. Ábrelo para activar tu cuenta.` };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = str(formData.get("email")).toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Ingresa un correo válido." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await siteUrl()}/auth/callback?next=/actualizar-clave` });
  return { ok: "Si el correo está registrado, recibirás un enlace para crear una nueva contraseña." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Usa al menos 8 caracteres." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Las contraseñas no coinciden." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No se pudo actualizar la contraseña. Solicita un nuevo enlace." };
  return { ok: "Contraseña actualizada. Ya puedes usarla para iniciar sesión." };
}
