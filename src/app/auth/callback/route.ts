import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { homeFor } from "@/lib/auth";
import type { Role } from "@/lib/types";

// Destino de los enlaces de confirmación, recuperación de contraseña y Google OAuth
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "";

  const supabase = await createClient();
  let error: { message: string; code?: string } | null = null;
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  else error = { message: searchParams.get("error_description") ?? "Enlace no válido" };

  // El enlace se abrió en otro navegador: Supabase ya confirmó el correo, pero aquí no hay
  // verificador PKCE para iniciar la sesión automáticamente.
  if (error?.code === "pkce_code_verifier_not_found") {
    return NextResponse.redirect(`${origin}/login?aviso=${next === "/actualizar-clave" ? "otro-navegador" : "confirmado"}`);
  }

  if (error) {
    const msg = /database error/i.test(error.message) ? "dominio" : "enlace";
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  const { data } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user?.id ?? "").maybeSingle<{ role: Role }>();
  return NextResponse.redirect(`${origin}${next || homeFor(profile?.role ?? "estudiante")}`);
}
