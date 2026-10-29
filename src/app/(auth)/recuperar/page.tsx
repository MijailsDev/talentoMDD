import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPage() {
  return (
    <AuthShell title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para que crees una nueva.">
      <ForgotForm />
    </AuthShell>
  );
}
