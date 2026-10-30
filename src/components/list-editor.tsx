"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Field = { key: string; label: string; placeholder?: string; textarea?: boolean; wide?: boolean };

/** Editor de listas (experiencia, proyectos…) que serializa a JSON en un input oculto */
export function ListEditor({ name, fields, initial, addLabel, max = 15 }: { name: string; fields: Field[]; initial: Record<string, string>[]; addLabel: string; max?: number }) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [rows, setRows] = useState<Record<string, string>[]>(initial);
  const set = (i: number, k: string, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r[fields[0].key]?.trim()))} />
      {rows.map((row, i) => (
        <div key={i} className="relative grid gap-3 rounded-2xl border border-line bg-surface-2 p-4 pr-12 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.wide || f.textarea ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-semibold text-ink-2" htmlFor={`${name}-${i}-${f.key}`}>{f.label}</label>
              {f.textarea ? (
                <textarea id={`${name}-${i}-${f.key}`} rows={2} value={row[f.key] ?? ""} onChange={(e) => set(i, f.key, e.target.value)} placeholder={f.placeholder} className="field" />
              ) : (
                <input id={`${name}-${i}-${f.key}`} value={row[f.key] ?? ""} onChange={(e) => set(i, f.key, e.target.value)} placeholder={f.placeholder} className="field" />
              )}
            </div>
          ))}
          <button type="button" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg text-error hover:bg-error-soft" aria-label="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button type="button" onClick={() => setRows((r) => [...r, blank()])} className="btn-outline btn-sm"><Plus size={16} /> {addLabel}</button>
      )}
    </div>
  );
}
