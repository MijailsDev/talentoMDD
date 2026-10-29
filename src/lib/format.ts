const MONTHS = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "set.", "oct.", "nov.", "dic."];

/** Fecha de hoy en Perú (UTC-5) como YYYY-MM-DD */
export function todayISO() {
  return new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
}

export function daysLeft(deadline: string) {
  return Math.round((Date.parse(deadline + "T00:00:00Z") - Date.parse(todayISO() + "T00:00:00Z")) / 864e5);
}

export function fmtDate(d: string) {
  const x = new Date(d.length === 10 ? d + "T12:00:00Z" : d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`;
}

export function fmtDateLong(d: string) {
  const x = new Date(d.length === 10 ? d + "T12:00:00Z" : d);
  return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export function deadlineText(deadline: string) {
  const dl = daysLeft(deadline);
  if (dl < 0) return { text: "Convocatoria cerrada", soon: false, closed: true };
  if (dl === 0) return { text: "Cierra hoy", soon: true, closed: false };
  if (dl <= 5) return { text: `Cierra en ${dl} ${dl === 1 ? "día" : "días"}`, soon: true, closed: false };
  return { text: `Postula hasta el ${fmtDate(deadline)}`, soon: false, closed: false };
}

export function isNew(createdAt: string) {
  return Date.now() - Date.parse(createdAt) <= 3 * 864e5;
}

export function initials(name: string) {
  return name
    .replace(/^(Dra?\.|MV\.|Ing\.|Lic\.( Enf\.)?|CPC\.|Blgo\.)\s*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function norm(t: string | null | undefined) {
  return String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function slugify(s: string) {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "empresa";
}

export function lines(v: FormDataEntryValue | null) {
  return String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

export function str(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

export function cycleText(cycle: number | null) {
  return cycle ? `${cycle}.º ciclo` : "";
}
