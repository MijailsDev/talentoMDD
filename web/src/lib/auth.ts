import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Company, Profile, Role } from "./types";

/** Usuario y perfil de la petición actual (o null). Se memoriza por petición. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single<Profile>();
  if (!profile) return null;
  return { uid, profile };
});

export async function requireUser(next = "/perfil") {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  return s;
}

export async function requireRole(roles: Role[], next: string) {
  const s = await requireUser(next);
  if (!roles.includes(s.profile.role)) redirect(homeFor(s.profile.role));
  return s;
}

export function homeFor(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "empresa") return "/empresa";
  return "/perfil";
}

export const getMyCompany = cache(async () => {
  const s = await getSession();
  if (!s) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*").eq("owner_id", s.uid).maybeSingle<Company>();
  return data;
});
