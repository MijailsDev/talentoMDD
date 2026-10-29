import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { fmtDateLong, norm } from "@/lib/format";
import { setUserRole } from "@/app/actions/admin";
import type { Profile, Role } from "@/lib/types";
import { Avatar } from "@/components/ui";

export const metadata: Metadata = { title: "Usuarios · Administración" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; rol?: string }> }) {
  const { q = "", rol = "todos" } = await searchParams;
  const s = await getSession();
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
  if (rol !== "todos") query = query.eq("role", rol as Role);
  const { data } = await query;
  const users = ((data ?? []) as Profile[]).filter((u) => !q || norm(`${u.first_name} ${u.last_name} ${u.email} ${u.student_code ?? ""}`).includes(norm(q)));

  return (
    <div className="space-y-5">
      <form className="flex flex-wrap gap-3" role="search">
        <label htmlFor="uq" className="sr-only">Buscar</label>
        <input id="uq" name="q" defaultValue={q} placeholder="Nombre, correo o código" className="field max-w-xs" />
        <label htmlFor="urol" className="sr-only">Rol</label>
        <select id="urol" name="rol" defaultValue={rol} className="field max-w-xs">
          <option value="todos">Todos los roles</option>
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn-primary">Buscar</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-ink-2">
            <tr><th className="px-5 py-3">Usuario</th><th className="px-3 py-3">Código</th><th className="px-3 py-3">Registro</th><th className="px-5 py-3">Rol</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
              return (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} url={u.avatar_url} size={36} />
                      <div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="truncate text-xs text-ink-2">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-2">{u.student_code ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-2">{fmtDateLong(u.created_at)}</td>
                  <td className="px-5 py-3">
                    <form action={setUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <label htmlFor={`r-${u.id}`} className="sr-only">Rol de {name}</label>
                      <select id={`r-${u.id}`} name="role" defaultValue={u.role} disabled={u.id === s?.uid} className="field h-9 w-auto text-sm">
                        {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      {u.id !== s?.uid && <button className="btn-ghost btn-sm">Cambiar</button>}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-sm text-ink-2">No hay usuarios con esos filtros.</p>}
      </div>
    </div>
  );
}
