import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BRAND, UNIVERSITY } from "@/lib/constants";
import { NavBar } from "./nav-bar";

export async function Header() {
  const s = await getSession();
  let unread = 0;
  if (s) {
    const supabase = await createClient();
    const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", s.uid).is("read_at", null);
    unread = count ?? 0;
  }
  const user = s
    ? {
        name: `${s.profile.first_name} ${s.profile.last_name}`.trim() || s.profile.email,
        email: s.profile.email,
        role: s.profile.role,
        avatar: s.profile.avatar_url,
        unread,
      }
    : null;
  return (
    <NavBar user={user}>
      <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND}, inicio`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/isotipo.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-xl shadow-[0_6px_16px_rgba(12,24,68,.18)]" />
        <span className="leading-tight">
          <span className="block font-display text-[21px] font-extrabold tracking-[-0.03em]">{BRAND}</span>
          <span className="block text-xs text-ink-2">{UNIVERSITY}</span>
        </span>
      </Link>
    </NavBar>
  );
}
