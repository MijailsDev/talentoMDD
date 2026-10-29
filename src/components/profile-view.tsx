import { Award, Briefcase, ExternalLink, FolderGit2, GraduationCap, Languages, MapPin } from "lucide-react";
import type { Profile } from "@/lib/types";
import { ROLES, UNIVERSITY } from "@/lib/constants";
import { cycleText } from "@/lib/format";
import { Avatar } from "./ui";

export type PublicProfile = Pick<Profile, "id" | "role" | "first_name" | "last_name" | "career_id" | "cycle" | "grad_year" | "headline" | "location" | "about" | "skills" | "languages" | "experience" | "projects" | "certifications" | "avatar_url" | "cover_url">;

const COVER_BG = "linear-gradient(120deg,#E0705A,#C80036 45%,#0C1844)";

export function ProfileHeader({ p, careerName, actions, extra }: { p: PublicProfile; careerName: string; actions?: React.ReactNode; extra?: React.ReactNode }) {
  const name = `${p.first_name} ${p.last_name}`.trim();
  const academic = [UNIVERSITY, careerName, p.role === "egresado" && p.grad_year ? `Egresado ${p.grad_year}` : cycleText(p.cycle)].filter(Boolean).join(" · ");
  return (
    <div className="card overflow-hidden">
      <div className="relative h-40 sm:h-52" style={{ background: p.cover_url ? undefined : COVER_BG }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-16 flex flex-wrap items-end justify-between gap-4">
          <Avatar name={name} url={p.avatar_url} size={128} className="border-[5px] border-surface shadow-lg" />
          <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{name}</h1>
          <span className="chip bg-primary-soft text-primary">{ROLES[p.role]}</span>
        </div>
        {p.headline && <p className="mt-1 text-lg">{p.headline}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
          <span className="flex items-center gap-1.5"><GraduationCap size={16} /> {academic}</span>
          {p.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {p.location}</span>}
        </p>
        {extra}
      </div>
    </div>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold"><span className="text-primary">{icon}</span> {title}</h2>
      {children}
    </section>
  );
}

export function ProfileSections({ p, empty }: { p: PublicProfile; empty?: (section: string) => React.ReactNode }) {
  return (
    <div className="space-y-6">
      {(p.about || empty) && (
        <Block icon={<Briefcase size={20} />} title="Acerca de">
          {p.about ? <p className="whitespace-pre-line leading-relaxed text-ink-2">{p.about}</p> : empty?.("about")}
        </Block>
      )}
      {(p.experience.length > 0 || empty) && (
        <Block icon={<Briefcase size={20} />} title="Experiencia y prácticas">
          {p.experience.length ? (
            <ol className="space-y-5">
              {p.experience.map((e, i) => (
                <li key={i} className="border-l-2 border-peach pl-4">
                  <p className="font-bold">{e.title}</p>
                  <p className="text-sm text-ink-2">{[e.org, e.period].filter(Boolean).join(" · ")}</p>
                  {e.description && <p className="mt-1 text-sm">{e.description}</p>}
                </li>
              ))}
            </ol>
          ) : empty?.("experience")}
        </Block>
      )}
      {(p.projects.length > 0 || empty) && (
        <Block icon={<FolderGit2 size={20} />} title="Proyectos">
          {p.projects.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {p.projects.map((x, i) => (
                <li key={i} className="rounded-2xl bg-surface-2 p-4">
                  <p className="font-bold">{x.name}</p>
                  {x.description && <p className="mt-1 text-sm text-ink-2">{x.description}</p>}
                  {x.url && <a href={/^https?:/.test(x.url) ? x.url : `https://${x.url}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Ver proyecto <ExternalLink size={14} /></a>}
                </li>
              ))}
            </ul>
          ) : empty?.("projects")}
        </Block>
      )}
      {(p.skills.length > 0 || empty) && (
        <Block icon={<Award size={20} />} title="Habilidades">
          {p.skills.length ? <div className="flex flex-wrap gap-2">{p.skills.map((s) => <span key={s} className="chip bg-hover px-3 py-1.5 text-sm text-ink">{s}</span>)}</div> : empty?.("skills")}
        </Block>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {(p.certifications.length > 0 || empty) && (
          <Block icon={<Award size={20} />} title="Certificaciones">
            {p.certifications.length ? (
              <ul className="space-y-3">
                {p.certifications.map((c, i) => <li key={i}><p className="font-semibold">{c.name}</p><p className="text-sm text-ink-2">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p></li>)}
              </ul>
            ) : empty?.("certifications")}
          </Block>
        )}
        {p.languages.length > 0 && (
          <Block icon={<Languages size={20} />} title="Idiomas">
            <ul className="space-y-2">{p.languages.map((l, i) => <li key={i} className="flex justify-between"><span className="font-semibold">{l.name}</span><span className="text-ink-2">{l.level}</span></li>)}</ul>
          </Block>
        )}
      </div>
    </div>
  );
}

export function profileStrength(p: Profile) {
  const checks: [boolean, string][] = [
    [!!p.avatar_url, "Agrega una foto de perfil"],
    [!!p.headline && !/^(Estudiante|Egresado\/a|Docente) de la/.test(p.headline), "Escribe un titular profesional"],
    [p.about.length >= 60, "Completa la sección «Acerca de»"],
    [!!p.career_id, "Indica tu carrera"],
    [p.skills.length >= 3, "Agrega al menos 3 habilidades"],
    [p.experience.length > 0 || p.projects.length > 0, "Agrega una experiencia o proyecto"],
    [!!p.cv_path, "Sube tu CV en PDF"],
    [!!p.phone, "Agrega un teléfono de contacto"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return { pct: Math.round((done / checks.length) * 100), missing: checks.filter(([ok]) => !ok).map(([, m]) => m) };
}
