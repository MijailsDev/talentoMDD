import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { NewPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function NewPasswordPage() {
  return (
    <AuthShell title="Crea una nueva contraseña" subtitle="Usa al menos 8 caracteres.">
      <NewPasswordForm />
    </AuthShell>
  );
}
