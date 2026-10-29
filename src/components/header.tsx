import Link from "next/link";
import { getSession } from "@/lib/auth";
import { BRAND, UNIVERSITY } from "@/lib/constants";
import { NavBar } from "./nav-bar";

export async function Header() {
  const s = await getSession();
  const user = s
    ? {
        name: `${s.profile.first_name} ${s.profile.last_name}`.trim() || s.profile.email,
        email: s.profile.email,
        role: s.profile.role,
        avatar: s.profile.avatar_url,
      }
    : null;
  return (
    <NavBar user={user}>
      <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND}, inicio`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/isotipo.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
        <span className="leading-tight">
          <span className="block font-display text-xl font-extrabold tracking-tight">{BRAND}</span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2">{UNIVERSITY}</span>
        </span>
      </Link>
    </NavBar>
  );
}
