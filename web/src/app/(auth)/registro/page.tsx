import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { getSession, homeFor } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ rol?: string }> }) {
  const { rol } = await searchParams;
  const s = await getSession();
  if (s) redirect(homeFor(s.profile.role));
  return (
    <AuthShell title="Crea tu cuenta" subtitle="Estudiantes, egresados y docentes se registran con su correo institucional. Las empresas, con su correo corporativo.">
      <RegisterForm initialRole={rol} />
    </AuthShell>
  );
}
