"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell as BellIcon, Bookmark, Briefcase, Building2, ChevronDown, LogOut, Menu, Shield, User, X } from "lucide-react";
import type { Role } from "@/lib/types";
import { ROLES } from "@/lib/constants";
import { Avatar } from "./ui";
import { createClient } from "@/lib/supabase/client";

type NavUser = { name: string; email: string; role: Role; avatar: string | null; unread: number } | null;

function Bell({ count, onClick }: { count: number; onClick?: () => void }) {
  const label = count ? `Notificaciones, ${count} sin leer` : "Notificaciones";
  return (
    <Link href="/notificaciones" onClick={onClick} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink transition hover:bg-hover" aria-label={label} title={label}>
      <BellIcon size={21} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white ring-2 ring-bg">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/empresas", label: "Empresas" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/#como-funciona", label: "Cómo funciona" },
];

export function NavBar({ user, children }: { user: NavUser; children: React.ReactNode }) {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(user?.unread ?? 0);
  const [serverUnread, setServerUnread] = useState(user?.unread ?? 0);
  const signedIn = !!user;
  // Si el servidor trae un contador nuevo (p. ej. tras marcar como leídas), manda ese
  if ((user?.unread ?? 0) !== serverUnread) {
    setServerUnread(user?.unread ?? 0);
    setUnread(user?.unread ?? 0);
  }

  // El header vive en el layout y no se vuelve a renderizar al navegar: refresca el contador aquí
  useEffect(() => {
    if (!signedIn) return;
    const supabase = createClient();
    const refresh = async () => {
      const { data } = await supabase.auth.getClaims();
      const uid = data?.claims?.sub;
      if (!uid) return;
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).is("read_at", null);
      if (count !== null) setUnread(count);
    };
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [signedIn, path]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const off = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const active = (href: string) =>
    href === "/" ? path === "/" : !href.includes("#") && (path === href || path.startsWith(href + "/"));

  const close = () => {
    setMobile(false);
    setMenu(false);
  };

  const userLinks = user
    ? [
        ...(user.role === "admin" ? [{ href: "/admin", label: "Administración", icon: Shield }] : []),
        ...(user.role === "empresa" ? [{ href: "/empresa", label: "Panel de empresa", icon: Building2 }] : []),
        ...(user.role !== "empresa" && user.role !== "admin" ? [{ href: "/perfil", label: "Mi perfil", icon: User }] : []),
        ...(user.role === "estudiante" || user.role === "egresado"
          ? [{ href: "/postulaciones", label: "Mis postulaciones", icon: Briefcase }, { href: "/postulaciones?tab=guardadas", label: "Ofertas guardadas", icon: Bookmark }]
          : []),
      ]
    : [];

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-bg/90 backdrop-blur-md transition-shadow ${scrolled ? "border-line shadow-[0_8px_24px_rgba(200,0,54,.10)]" : "border-transparent"}`}
    >
      <div className="container-x flex h-[72px] items-center gap-6">
        {children}
        <nav aria-label="Principal" className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-full px-3.5 py-2 text-[15px] font-semibold transition hover:bg-hover ${active(l.href) ? "text-primary" : "text-ink"}`}
              aria-current={active(l.href) ? "page" : undefined}
            >
              {l.label}
              {active(l.href) && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded bg-primary" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user && <Bell count={unread} />}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition hover:border-line-strong"
              >
                <Avatar name={user.name} url={user.avatar} size={34} />
                <span className="max-w-36 truncate text-sm font-semibold">{user.name.split(" ")[0]}</span>
                <ChevronDown size={16} className={`transition ${menu ? "rotate-180" : ""}`} />
              </button>
              {menu && (
                <div role="menu" className="absolute right-0 top-12 w-64 rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow-pop)]">
                  <div className="border-b border-line px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink-2">{user.email}</p>
                    <span className="chip mt-1 bg-primary-soft text-primary">{ROLES[user.role]}</span>
                  </div>
                  {userLinks.map((l) => (
                    <Link key={l.href} href={l.href} role="menuitem" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-hover">
                      <l.icon size={17} /> {l.label}
                    </Link>
                  ))}
                  <form action="/auth/signout" method="post">
                    <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-error hover:bg-error-soft">
                      <LogOut size={17} /> Cerrar sesión
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Iniciar sesión</Link>
              <Link href="/registro" className="btn-primary">Crear cuenta</Link>
            </>
          )}
        </div>

        {user && <span className="ml-auto lg:hidden"><Bell count={unread} onClick={close} /></span>}
        <button type="button" className={`btn-ghost h-10 w-10 px-0 lg:hidden ${user ? "-ml-4" : "ml-auto"}`} onClick={() => setMobile((m) => !m)} aria-expanded={mobile} aria-label={mobile ? "Cerrar menú" : "Abrir menú"}>
          {mobile ? <X /> : <Menu />}
        </button>
      </div>

      {mobile && (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav aria-label="Principal móvil" className="container-x flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className={`rounded-xl px-3 py-2.5 font-semibold hover:bg-hover ${active(l.href) ? "text-primary" : ""}`}>
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <>
                {userLinks.map((l) => (
                  <Link key={l.href} href={l.href} onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium hover:bg-hover">
                    <l.icon size={18} /> {l.label}
                  </Link>
                ))}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-error hover:bg-error-soft">
                    <LogOut size={18} /> Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={close} className="btn-outline flex-1">Iniciar sesión</Link>
                <Link href="/registro" onClick={close} className="btn-primary flex-1">Crear cuenta</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
