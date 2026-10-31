import { BadgeCheck } from "lucide-react";
import { initials } from "@/lib/format";
import type { Company } from "@/lib/types";
import { FALLBACK_COVER } from "@/lib/constants";

const AVATAR_COLORS = ["#C80036", "#0C1844", "#2F5E4C", "#7A4E2A", "#683F70", "#A1002C", "#3E5563"];

export function Avatar({ name, url, size = 40, className = "" }: { name: string; url?: string | null; size?: number; className?: string }) {
  const color = AVATAR_COLORS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % AVATAR_COLORS.length];
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" width={size} height={size} className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, background: color, fontSize: Math.max(11, size * 0.36) }}
    >
      {initials(name) || "?"}
    </span>
  );
}

export function CompanyLogo({ company, size = 52, className = "" }: { company: Pick<Company, "logo_url" | "logo_text" | "color" | "short_name">; size?: number; className?: string }) {
  return company.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={company.logo_url} alt={`Logo de ${company.short_name}`} width={size} height={size} className={`shrink-0 rounded-[14px_14px_14px_4px] bg-white object-contain ${className}`} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[14px_14px_14px_4px] font-display font-extrabold text-white ${className}`}
      style={{ width: size, height: size, background: company.color, fontSize: size * 0.32 }}
    >
      {company.logo_text || initials(company.short_name)}
    </span>
  );
}

export function Cover({ src, alt = "", className = "" }: { src?: string | null; alt?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src || FALLBACK_COVER} alt={alt} width={1000} height={750} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
}

export function Verified({ size = 16 }: { size?: number }) {
  return (
    <span title="Empresa verificada por la universidad" className="inline-flex text-success">
      <BadgeCheck size={size} aria-label="Empresa verificada" />
    </span>
  );
}

export function PageHeader({ eyebrow, title, compact, children }: { eyebrow?: string; title: string; compact?: boolean; children?: React.ReactNode }) {
  return (
    <div className="bg-textil relative overflow-hidden text-white">
      {/* compact: en celular y tableta deja solo la banda y el título, para llegar antes al contenido */}
      <div className={`container-x ${compact ? "py-5 lg:py-12" : "py-10 sm:py-12"}`}>
        {eyebrow && <p className={`eyebrow text-peach before:bg-peach before:bg-none ${compact ? "max-lg:hidden" : ""}`}>{eyebrow}</p>}
        <h1 className={`font-display text-[clamp(28px,3.6vw,42px)] font-extrabold tracking-[-0.02em] ${compact ? "lg:mt-2" : "mt-2"}`}>{title}</h1>
        {children && <div className={`mt-1.5 max-w-2xl text-base text-white ${compact ? "max-lg:hidden" : ""}`}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</div>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export function Alert({ kind = "info", children }: { kind?: "info" | "error" | "success" | "warning"; children: React.ReactNode }) {
  const cls = {
    info: "bg-primary-soft text-primary border-primary/20",
    error: "bg-error-soft text-error border-error/20",
    success: "bg-success-soft text-success border-success/20",
    warning: "bg-warning-soft text-warning border-warning/20",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium ${cls}`}>
      {children}
    </div>
  );
}
