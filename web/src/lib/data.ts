import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { norm, todayISO } from "./format";
import type { Career, Company, Faculty, News, OfferType, OfferWithCompany } from "./types";

const OFFER_SELECT = "*, company:companies!inner(*)";

export const getCatalog = cache(async () => {
  const supabase = await createClient();
  const [{ data: faculties }, { data: careers }] = await Promise.all([
    supabase.from("faculties").select("*").order("name"),
    supabase.from("careers").select("*").order("name"),
  ]);
  const list = (careers ?? []) as Career[];
  return {
    faculties: (faculties ?? []) as Faculty[],
    careers: list,
    careerName: (id: string) => list.find((c) => c.id === id)?.name ?? id,
  };
});

export type OfferFilters = {
  q?: string;
  car?: string;
  fac?: string;
  tipo?: string[];
  modo?: string[];
  pago?: string;
  orden?: string;
  cerradas?: boolean;
};

export async function getOffers(f: OfferFilters = {}) {
  const supabase = await createClient();
  let query = supabase.from("offers").select(OFFER_SELECT).eq("is_active", true).eq("company.status", "verificada");
  if (!f.cerradas) query = query.gte("deadline", todayISO());
  if (f.tipo?.length) query = query.in("type", f.tipo as OfferType[]);
  if (f.modo?.length) query = query.in("mode", f.modo);
  if (f.pago === "si") query = query.eq("paid", true);
  if (f.pago === "no") query = query.eq("paid", false);
  if (f.car && f.car !== "all") query = query.contains("career_ids", [f.car]);
  query = f.orden === "cierre" ? query.order("deadline", { ascending: true }) : query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let list = (data ?? []) as OfferWithCompany[];

  if (f.fac && f.fac !== "all" && (!f.car || f.car === "all")) {
    const { careers } = await getCatalog();
    const ids = new Set(careers.filter((c) => c.faculty_id === f.fac).map((c) => c.id));
    list = list.filter((o) => o.career_ids.some((c) => ids.has(c)));
  }
  if (f.q) {
    const words = norm(f.q).split(/\s+/).filter(Boolean);
    list = list.filter((o) => {
      const hay = norm([o.title, o.description, o.company.short_name, o.company.sector, o.skills.join(" ")].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }
  return list;
}

export async function getOffer(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("*, company:companies(*)").eq("id", id).maybeSingle();
  return data as OfferWithCompany | null;
}

export async function getCompanies() {
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*").eq("status", "verificada").order("short_name");
  return (data ?? []) as Company[];
}

export async function getCompanyBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
  return data as Company | null;
}

export async function getActiveOfferCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("company_id, career_ids, company:companies!inner(status)")
    .eq("is_active", true).eq("company.status", "verificada").gte("deadline", todayISO());
  const byCompany: Record<string, number> = {};
  const byCareer: Record<string, number> = {};
  for (const o of (data ?? []) as { company_id: string; career_ids: string[] }[]) {
    byCompany[o.company_id] = (byCompany[o.company_id] ?? 0) + 1;
    for (const c of o.career_ids) byCareer[c] = (byCareer[c] ?? 0) + 1;
  }
  return { byCompany, byCareer };
}

export async function getStats() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("portal_stats");
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, number> | null;
  return {
    offers: Number(row?.active_offers ?? 0),
    companies: Number(row?.companies ?? 0),
    members: Number(row?.members ?? 0),
    hired: Number(row?.hired ?? 0),
  };
}

export async function getNews(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase.from("news").select("*").order("event_date", { ascending: false }).limit(limit);
  return (data ?? []) as News[];
}

export async function getSavedIds(uid: string | undefined) {
  if (!uid) return new Set<string>();
  const supabase = await createClient();
  const { data } = await supabase.from("saved_offers").select("offer_id").eq("student_id", uid);
  return new Set((data ?? []).map((r: { offer_id: string }) => r.offer_id));
}
