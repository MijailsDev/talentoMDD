"use client";
import Link from "next/link";
import { useState } from "react";
import { Building2, Eye, EyeOff, GraduationCap, School, UserRound } from "lucide-react";
import { login, register, requestPasswordReset, updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { DOMAIN, GOOGLE_ENABLED } from "@/lib/constants";
import { FieldError, FormMessage, SubmitButton, useFormAction } from "./form-ui";
import type { FormState } from "@/lib/types";

function PasswordInput({ id, name, autoComplete, invalid }: { id: string; name: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required className="field pr-11" aria-invalid={invalid || undefined} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-2 hover:bg-hover" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function GoogleButton({ next }: { next?: string }) {
  const [busy, setBusy] = useState(false);
  if (!GOOGLE_ENABLED) return null;
  const go = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
        queryParams: { hd: DOMAIN, prompt: "select_account" },
      },
    });
  };
  return (
    <>
      <button type="button" onClick={go} disabled={busy} className="btn-outline w-full">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continuar con Google ({DOMAIN})
      </button>
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink-2">
        <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: FormState }) {
  const { state, pending, onSubmit } = useFormAction(login);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4" noValidate>
      {notice && !state && <FormMessage state={notice} />}
      <FormMessage state={state} />
      <GoogleButton next={next} />
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} placeholder={`codigo@${DOMAIN}`} className="field" />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">Contraseña</label>
          <Link href="/recuperar" className="text-sm font-semibold text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>
      <SubmitButton busy={pending} className="btn-primary w-full" pendingText="Ingresando…">Iniciar sesión</SubmitButton>
      <p className="text-center text-sm text-ink-2">
        ¿No tienes cuenta? <Link href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary hover:underline">Crear cuenta</Link>
      </p>
    </form>
  );
}

const ROLE_OPTS = [
  { v: "estudiante", l: "Estudiante", icon: GraduationCap },
  { v: "egresado", l: "Egresado/a", icon: School },
  { v: "docente", l: "Docente", icon: UserRound },
  { v: "empresa", l: "Empresa", icon: Building2 },
];

export function RegisterForm({ initialRole }: { initialRole?: string }) {
  const { state, pending, onSubmit } = useFormAction(register);
  const [role, setRole] = useState(state?.fields?.role ?? (ROLE_OPTS.some((r) => r.v === initialRole) ? initialRole! : "estudiante"));
  const [email, setEmail] = useState(state?.fields?.email ?? "");
  const isEmp = role === "empresa";
  const domainOk = !email.includes("@") || isEmp || email.toLowerCase().endsWith("@" + DOMAIN);
  const invalid = new Set((state?.fields?._invalid ?? "").split(","));

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <FormMessage state={state} />
        <Link href="/login" className="btn-primary w-full">Ir a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <fieldset>
        <legend className="label">Soy</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROLE_OPTS.map((r) => (
            <label key={r.v} className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-[1.5px] px-2 py-3 text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20 ${role === r.v ? "border-primary bg-primary-soft text-primary" : "border-line-strong hover:border-primary/50"}`}>
              <input type="radio" name="role" value={r.v} checked={role === r.v} onChange={() => setRole(r.v)} className="sr-only" />
              <r.icon size={20} /> {r.l}
            </label>
          ))}
        </div>
      </fieldset>
      {role === "estudiante" && <GoogleButton />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="label">{isEmp ? "Nombres del representante" : "Nombres"}</label>
          <input id="first_name" name="first_name" autoComplete="given-name" defaultValue={state?.fields?.first_name} className="field" aria-invalid={invalid.has("first_name") || undefined} />
          {invalid.has("first_name") && <FieldError state={state} name="first_name" />}
        </div>
        <div>
          <label htmlFor="last_name" className="label">Apellidos</label>
          <input id="last_name" name="last_name" autoComplete="family-name" defaultValue={state?.fields?.last_name} className="field" aria-invalid={invalid.has("last_name") || undefined} />
          {invalid.has("last_name") && <FieldError state={state} name="last_name" />}
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">{isEmp ? "Correo corporativo" : "Correo institucional"}</label>
        <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isEmp ? "rrhh@tuempresa.pe" : `codigo@${DOMAIN}`} className="field" aria-invalid={!domainOk || invalid.has("email") || undefined} aria-describedby="email-hint" />
        <p id="email-hint" className={`mt-1 text-xs ${domainOk ? "text-ink-2" : "font-semibold text-error"}`}>
          {isEmp ? "La universidad verificará tu empresa antes de que puedas publicar ofertas." : domainOk ? `Solo se aceptan correos @${DOMAIN}.` : `Este correo no es @${DOMAIN}.`}
        </p>
        {invalid.has("email") && <FieldError state={state} name="email" />}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <PasswordInput id="password" name="password" autoComplete="new-password" invalid={invalid.has("password")} />
          {invalid.has("password") ? <FieldError state={state} name="password" /> : <p className="hint">Mínimo 8 caracteres.</p>}
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirmar contraseña</label>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={invalid.has("confirm")} />
          {invalid.has("confirm") && <FieldError state={state} name="confirm" />}
        </div>
      </div>
      <div>
        <label className="flex items-start gap-2.5 text-sm text-ink-2">
          <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 accent-primary" />
          <span>Acepto los términos de uso y autorizo el tratamiento de mis datos personales según la Ley N.º 29733 para fines de empleabilidad.</span>
        </label>
        {invalid.has("terms") && <FieldError state={state} name="terms" />}
      </div>
      <SubmitButton busy={pending} className="btn-primary w-full" pendingText="Creando cuenta…">Crear cuenta</SubmitButton>
      <p className="text-center text-sm text-ink-2">
        ¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const { state, pending, onSubmit } = useFormAction(requestPasswordReset);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className="label">Correo de tu cuenta</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      <SubmitButton busy={pending} className="btn-primary w-full" pendingText="Enviando…">Enviar enlace</SubmitButton>
      <p className="text-center text-sm"><Link href="/login" className="font-semibold text-primary hover:underline">Volver a iniciar sesión</Link></p>
    </form>
  );
}

export function NewPasswordForm() {
  const { state, pending, onSubmit } = useFormAction(updatePassword);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="password" className="label">Nueva contraseña</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirmar contraseña</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </div>
      <SubmitButton busy={pending} className="btn-primary w-full">Guardar contraseña</SubmitButton>
    </form>
  );
}
