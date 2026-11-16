import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, UserCheck, UserPlus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCatalog } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { toggleConnection } from "@/app/actions/student";
import { ProfileHeader, ProfileSections, type PublicProfile } from "@/components/profile-view";

export const metadata: Metadata = { title: "Perfil" };

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { uid, profile: me } = await requireRole(["estudiante", "egresado", "docente", "admin"], `/comunidad/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data }, { data: conn }, catalog] = await Promise.all([
    supabase.rpc("public_profile", { pid: id }),
    supabase.from("connections").select("to_id").eq("from_id", uid).eq("to_id", id).maybeSingle(),
    getCatalog(),
  ]);
  const p = (Array.isArray(data) ? data[0] : data) as PublicProfile | undefined;
  if (!p) notFound();
  const isMe = uid === p.id;
  const tags = [
    p.career_id && p.career_id === me.career_id ? "Misma carrera" : null,
    p.career_id && me.career_id && catalog.careers.find((c) => c.id === p.career_id)?.faculty_id === catalog.careers.find((c) => c.id === me.career_id)?.faculty_id ? "Misma facultad" : null,
  ].filter(Boolean) as string[];
  // Los correos @unamad.edu.pe son de Google: Gmail abre el mensaje ya escrito, con la cuenta institucional de quien escribe
  const mailHref = p.email
    ? `https://mail.google.com/mail/?${new URLSearchParams({
        authuser: me.email,
        view: "cm",
        fs: "1",
        to: p.email,
        su: "Hola desde TalentoMDD",
        body: `Hola, ${p.first_name}:\n\nVi tu perfil en TalentoMDD y me gustaría conversar contigo.\n\nSaludos,\n${me.first_name} ${me.last_name}`,
      })}`
    : null;

  return (
    <div className="container-x max-w-5xl space-y-6 py-8">
      <Link href="/comunidad" className="btn-ghost btn-sm -ml-3"><ArrowLeft size={16} /> Comunidad</Link>
      <ProfileHeader
        p={p}
        careerName={p.career_id ? catalog.careerName(p.career_id) : ""}
        actions={
          isMe ? <Link href="/perfil/editar" className="btn-outline btn-sm">Editar mi perfil</Link> : (
            <>
              <form action={toggleConnection}>
                <input type="hidden" name="to" value={p.id} />
                <button className={conn ? "btn btn-sm bg-success-soft text-success" : "btn-primary btn-sm"}>{conn ? <><UserCheck size={16} /> Conectado</> : <><UserPlus size={16} /> Conectar</>}</button>
              </form>
              {mailHref && (
                <a href={mailHref} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" title={`Escribir a ${p.email}`}>
                  <Mail size={16} /> Enviar correo
                </a>
              )}
            </>
          )
        }
        extra={tags.length > 0 && <div className="mt-3 flex gap-2">{tags.map((t) => <span key={t} className="chip bg-success-soft text-success">{t}</span>)}</div>}
      />
      <ProfileSections p={p} />
    </div>
  );
}
