import type { Metadata } from "next";
import { Bell, Briefcase, Building2, CheckCheck, ClipboardCheck, Trash2, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { clearReadNotifications, markAllNotificationsRead } from "@/app/actions/notifications";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Notificaciones" };

type Notification = { id: number; kind: string; title: string; body: string; read_at: string | null; created_at: string };

const ICONS: Record<string, typeof Bell> = { conexion: UserPlus, postulacion: Briefcase, estado: ClipboardCheck, empresa: Building2 };

export default async function NotificationsPage() {
  const s = await requireUser("/notificaciones");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, read_at, created_at")
    .eq("user_id", s.uid)
    .order("created_at", { ascending: false })
    .limit(60);
  const items = (data ?? []) as Notification[];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <>
      <PageHeader eyebrow="Tu actividad" title="Notificaciones">
        Aquí te avisamos cuando alguien conecta contigo, cuando cambia el estado de tus postulaciones y más.
      </PageHeader>
      <div className="container-x max-w-3xl py-8">
        {items.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2">{unread ? `${unread} sin leer` : "Estás al día"}</p>
            <div className="flex flex-wrap gap-2">
              {unread > 0 && (
                <form action={markAllNotificationsRead}>
                  <button className="btn-outline btn-sm"><CheckCheck size={16} /> Marcar todas como leídas</button>
                </form>
              )}
              {items.length > unread && (
                <form action={clearReadNotifications}>
                  <button className="btn-ghost btn-sm text-ink-2"><Trash2 size={16} /> Borrar leídas</button>
                </form>
              )}
            </div>
          </div>
        )}
        {items.length === 0 ? (
          <EmptyState icon={<Bell />} title="No tienes notificaciones">
            Te avisaremos aquí cuando haya novedades sobre tus conexiones, postulaciones u ofertas.
          </EmptyState>
        ) : (
          <ul className="card divide-y divide-line overflow-hidden">
            {items.map((n) => {
              const Icon = ICONS[n.kind] ?? Bell;
              return (
                <li key={n.id}>
                  <a href={`/notificaciones/ir/${n.id}`} className={`flex gap-4 p-4 transition hover:bg-hover sm:p-5 ${n.read_at ? "" : "bg-primary-soft/40"}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read_at ? "bg-hover text-ink-2" : "bg-primary text-white"}`}><Icon size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className={`block break-words ${n.read_at ? "font-semibold" : "font-bold"}`}>{n.title}</span>
                      {n.body && <span className="block break-words text-sm text-ink-2">{n.body}</span>}
                      <span className="mt-1 block text-xs text-ink-2">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.read_at && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
