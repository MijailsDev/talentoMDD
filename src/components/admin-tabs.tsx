"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/admin", "Resumen"],
  ["/admin/empresas", "Empresas"],
  ["/admin/ofertas", "Ofertas"],
  ["/admin/usuarios", "Usuarios"],
  ["/admin/contenido", "Novedades y carreras"],
];

export function AdminTabs() {
  const path = usePathname();
  return (
    <nav className="-mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Secciones de administración">
      {TABS.map(([href, label]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap border-b-[3px] px-4 py-3 text-sm font-semibold transition ${active ? "border-primary text-primary" : "border-transparent text-ink-2 hover:text-ink"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
