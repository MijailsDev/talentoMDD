import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getSession, homeFor } from "@/lib/auth";
import { DOMAIN, UNIVERSITY } from "@/lib/constants";

export const metadata: Metadata = { title: "Iniciar sesión" };

const ERRORS: Record<string, string> = {
  dominio: `Solo se aceptan cuentas @${DOMAIN}. Si eres una empresa, regístrate con el rol «Empresa».`,
  enlace: "El enlace no es válido o ya expiró. Vuelve a intentarlo.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const s = await getSession();
  if (s) redirect(next?.startsWith("/") ? next : homeFor(s.profile.role));
  return (
    <AuthShell title="Inicia sesión" subtitle={`Acceso exclusivo para la comunidad de la ${UNIVERSITY} y sus empresas aliadas.`}>
      <LoginForm next={next} notice={error ? ERRORS[error] : undefined} />
    </AuthShell>
  );
}
