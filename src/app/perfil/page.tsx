import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, Pencil, Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { APP_STATUS } from "@/lib/constants";
import { ProfileHeader, ProfileSections, profileStrength } from "@/components/profile-view";
import { CvLink } from "@/components/uploaders";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const { guardado } = await searchParams;
  const { profile: p, uid } = await requireRole(["estudiante", "egresado", "docente"], "/perfil");
  const catalog = await getCatalog();
  const supabase = await createClient();
  const [{ data: apps }, { count: following }, { count: followers }] = await Promise.all([
    supabase.from("applications").select("status").eq("student_id", uid),
    supabase.from("connections").select("to_id", { count: "exact", head: true }).eq("from_id", uid),
    supabase.from("connections").select("from_id", { count: "exact", head: true }).eq("to_id", uid),
  ]);
  const strength = profileStrength(p);
  const isStudent = p.role !== "docente";

  return (
    <div className="container-x grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {guardado && <Alert kind="success">Perfil actualizado.</Alert>}
        <ProfileHeader
          p={p}
          careerName={p.career_id ? catalog.careerName(p.career_id) : ""}
          actions={<Link href="/perfil/editar" className="btn-primary btn-sm"><Pencil size={16} /> Editar perfil</Link>}
        />
        <ProfileSections
          p={p}
          empty={() => (
            <Link href="/perfil/editar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><Plus size={16} /> Completar esta sección</Link>
          )}
        />
      </div>
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Fortaleza del perfil</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-extrabold text-primary">{strength.pct}%</span>
            <span className="mb-1 text-sm text-ink-2">{strength.pct >= 85 ? "¡Excelente!" : strength.pct >= 50 ? "Vas bien" : "Por completar"}</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-hover" role="progressbar" aria-valuenow={strength.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Fortaleza del perfil">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${strength.pct}%` }} />
          </div>
          {strength.missing.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
              {strength.missing.slice(0, 4).map((m) => <li key={m}>· {m}</li>)}
            </ul>
          )}
        </div>
        {isStudent && (
          <div className="card space-y-3 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Mi CV</p>
            {p.cv_path ? (
              <div className="flex items-center gap-3">
                <FileText className="text-success" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.cv_name}</span>
                <CvLink path={p.cv_path} className="btn-ghost btn-sm" />
              </div>
            ) : (
              <p className="text-sm text-ink-2">Necesitas un CV para postular a prácticas y empleos.</p>
            )}
            <Link href="/perfil/editar#cv" className="btn-outline btn-sm w-full">{p.cv_path ? "Reemplazar CV" : "Subir CV"}</Link>
          </div>
        )}
        {isStudent && (
          <div className="card p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Mis postulaciones</p>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(APP_STATUS).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span className={`chip ${v.cls}`}>{v.label}</span><strong>{(apps ?? []).filter((a) => a.status === k).length}</strong></li>
              ))}
            </ul>
            <Link href="/postulaciones" className="btn-primary btn-sm mt-4 w-full"><Briefcase size={16} /> Ver mis postulaciones</Link>
          </div>
        )}
        <div className="card p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-ink-2">Mi red</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/comunidad?vista=conexiones" className="rounded-2xl bg-surface-2 p-3 transition hover:bg-hover">
              <span className="block font-display text-3xl font-extrabold text-primary">{following ?? 0}</span>
              <span className="text-sm text-ink-2">Mis conexiones</span>
            </Link>
            <Link href="/comunidad?vista=contigo" className="rounded-2xl bg-surface-2 p-3 transition hover:bg-hover">
              <span className="block font-display text-3xl font-extrabold text-primary">{followers ?? 0}</span>
              <span className="text-sm text-ink-2">Conectaron contigo</span>
            </Link>
          </div>
          <Link href="/comunidad" className="btn-outline btn-sm mt-4 w-full"><Users size={16} /> Ir a la comunidad</Link>
        </div>
        <div className="card p-6 text-sm">
          <p className="font-bold">Datos de contacto</p>
          <p className="mt-2 text-ink-2">{p.email}</p>
          {p.phone && <p className="text-ink-2">{p.phone}</p>}
          {p.student_code && <p className="text-ink-2">Código: {p.student_code.slice(0, 4)}••••</p>}
          <p className="mt-2 text-xs text-ink-2">Las empresas solo ven tus datos de contacto cuando postulas a sus ofertas.</p>
        </div>
      </aside>
    </div>
  );
}
