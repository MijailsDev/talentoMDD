"use client";

/** Botón de formulario que pide confirmación antes de una acción irreversible */
export function ConfirmButton({ action, fields, message, children, className, title }: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  message: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={className} title={title} aria-label={title}>{children}</button>
    </form>
  );
}
