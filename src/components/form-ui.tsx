"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
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
  const form = useRef<HTMLFormElement | null>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.current = e.currentTarget;
    const fd = new FormData(e.currentTarget);
    start(() => action(fd));
  };

  // Tras un envío con errores: marca cada campo inválido, lo enlaza a su mensaje y lleva el foco al primero
  useEffect(() => {
    const el = form.current;
    if (!el) return;
    const fields = state?.fields ?? {};
    let first: HTMLElement | null = null;
    for (const input of el.querySelectorAll<HTMLElement>("input[name], select[name], textarea[name]")) {
      const name = input.getAttribute("name")!;
      const errId = `${name}-error`;
      const ids = (input.getAttribute("aria-describedby") ?? "").split(" ").filter((id) => id && id !== errId);
      if (fields[name]) {
        input.setAttribute("aria-invalid", "true");
        if (document.getElementById(errId)) ids.push(errId);
        if (!first && input.getAttribute("type") !== "hidden") first = input;
      } else {
        input.removeAttribute("aria-invalid");
      }
      if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
      else input.removeAttribute("aria-describedby");
    }
    first?.focus();
  }, [state]);

  return { state, pending, onSubmit };
}

export function SubmitButton({ children, busy, pendingText = "Guardando…", className = "btn-primary", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; pendingText?: string }) {
  const status = useFormStatus();
  const pending = busy ?? status.pending;
  return (
    <button type="submit" className={className} {...rest} disabled={pending || rest.disabled}>
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
  return msg ? <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-error">{msg}</p> : null;
}

export function Field({ state, name, label, def, type = "text", placeholder, hint, required, ...rest }: {
  state: FormState; name: string; label: string; def?: string | number | null; type?: string; placeholder?: string; hint?: string; required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  const err = state?.fields?.[name];
  return (
    <div>
      <label htmlFor={name} className="label">{label}{required && <span className="text-primary"> *</span>}</label>
      <input id={name} name={name} type={type} defaultValue={def ?? ""} placeholder={placeholder} className="field" aria-invalid={!!err || undefined} aria-describedby={err ? `${name}-error` : hint ? `${name}-hint` : undefined} {...rest} />
      {err ? <p id={`${name}-error`} className="mt-1 text-xs font-semibold text-error">{err}</p> : hint ? <p id={`${name}-hint`} className="hint">{hint}</p> : null}
    </div>
  );
}
