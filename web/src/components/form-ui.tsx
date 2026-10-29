"use client";
import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/lib/types";
import { Alert } from "./ui";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Como useActionState, pero envía con onSubmit para que React no limpie el formulario:
 * si hay un error de validación, el usuario conserva lo que escribió.
 */
export function useFormAction(fn: Action) {
  const [state, action, pending] = useActionState(fn, undefined);
  const [, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => action(fd));
  };
  return { state, pending, onSubmit };
}

export function SubmitButton({ children, busy, pendingText = "Guardando…", className = "btn-primary", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; pendingText?: string }) {
  const status = useFormStatus();
  const pending = busy ?? status.pending;
  return (
    <button type="submit" disabled={pending || rest.disabled} className={className} {...rest}>
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error) return <Alert kind="error">{state.error}</Alert>;
  if (state?.ok) return <Alert kind="success">{state.ok}</Alert>;
  return null;
}

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const msg = state?.fields?.[name];
  return msg ? <p className="mt-1 text-xs font-semibold text-error">{msg}</p> : null;
}

export function Field({ state, name, label, def, type = "text", placeholder, hint, required, ...rest }: {
  state: FormState; name: string; label: string; def?: string | number | null; type?: string; placeholder?: string; hint?: string; required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  const err = state?.fields?.[name];
  return (
    <div>
      <label htmlFor={name} className="label">{label}{required && <span className="text-primary"> *</span>}</label>
      <input id={name} name={name} type={type} defaultValue={def ?? ""} placeholder={placeholder} className="field" aria-invalid={!!err || undefined} {...rest} />
      {err ? <p className="mt-1 text-xs font-semibold text-error">{err}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}
