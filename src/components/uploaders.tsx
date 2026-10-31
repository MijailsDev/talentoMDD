"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileText, ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCvUrl } from "@/app/actions/media";
import type { GalleryItem } from "@/lib/types";

const MAX = 5 * 1024 * 1024;
const IMG = ["image/jpeg", "image/png", "image/webp"];

async function upload(bucket: string, folder: string, prefix: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return { path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}

function useUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  const run = async (fn: () => Promise<{ error?: string } | void>) => {
    setBusy(true);
    setError("");
    try {
      const r = await fn();
      if (r && r.error) setError(r.error);
      else start(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? `No se pudo subir el archivo: ${e.message}` : "No se pudo subir el archivo.");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, run };
}

function validateImage(file: File, setError: (s: string) => void) {
  if (!IMG.includes(file.type)) return setError("Usa una imagen JPG, PNG o WebP."), false;
  if (file.size > MAX) return setError("La imagen supera los 5 MB."), false;
  return true;
}

/** Foto circular (perfil, logo, representante) o portada rectangular, con vista previa y arrastrar y soltar */
export function ImageUpload({
  bucket, folder, prefix, current, shape = "circle", label, onSave, fallback,
}: {
  bucket: "avatars" | "company-media";
  folder: string;
  prefix: string;
  current: string | null;
  shape?: "circle" | "rect" | "square";
  label: string;
  onSave: (url: string | null) => Promise<{ error?: string }>;
  fallback?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useUploader();
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const shown = preview ?? current;

  const pick = (file?: File) => {
    if (!file || !validateImage(file, setError)) return;
    setPreview(URL.createObjectURL(file));
    run(async () => {
      const { url } = await upload(bucket, folder, prefix, file);
      const r = await onSave(url);
      if (r.error) setPreview(null);
      return r;
    });
  };

  const box = shape === "rect" ? "aspect-[3/1] w-full rounded-2xl" : shape === "square" ? "h-28 w-28 rounded-2xl" : "h-28 w-28 rounded-full";

  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`group relative grid shrink-0 place-items-center overflow-hidden border-2 border-dashed bg-surface-2 transition ${box} ${drag ? "border-primary bg-primary-soft" : "border-line-strong hover:border-primary"}`}
          aria-label={`${label}: seleccionar o arrastrar imagen`}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={`h-full w-full ${shape === "square" ? "object-contain bg-white" : "object-cover"}`} />
          ) : (
            fallback ?? <ImagePlus className="text-ink-2" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-dark/45 text-white opacity-0 transition group-hover:opacity-100">
            {busy ? <Loader2 className="animate-spin" /> : <Camera />}
          </span>
          {busy && <span className="absolute inset-0 grid place-items-center bg-dark/45 text-white"><Loader2 className="animate-spin" /></span>}
        </button>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-outline btn-sm"><Upload size={16} /> {shown ? "Cambiar" : "Subir"}</button>
          {shown && (
            <button type="button" disabled={busy} onClick={() => { setPreview(null); run(() => onSave(null)); }} className="btn-ghost btn-sm text-error"><Trash2 size={16} /> Quitar</button>
          )}
          <p className="text-xs text-ink-2">JPG, PNG o WebP · máx. 5 MB</p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-error" role="alert">{error}</p>}
      <input ref={input} type="file" accept={IMG.join(",")} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

export function CvUpload({ uid, current, currentName, onSave }: { uid: string; current: string | null; currentName: string | null; onSave: (path: string | null, name: string | null) => Promise<{ error?: string }> }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useUploader();

  const pick = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") return setError("El CV debe ser un archivo PDF.");
    if (file.size > MAX) return setError("El PDF supera los 5 MB.");
    run(async () => {
      const { path } = await upload("cvs", uid, "cv", file);
      return onSave(path, file.name);
    });
  };

  const view = async () => {
    if (!current) return;
    const url = await getCvUrl(current);
    if (url) window.open(url, "_blank", "noopener");
  };

  return (
    <div id="cv">
      <div className={`flex flex-wrap items-center gap-4 rounded-2xl border-2 border-dashed p-4 ${current ? "border-success/40 bg-success-soft/50" : "border-line-strong bg-surface-2"}`}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
        <FileText className={current ? "text-success" : "text-ink-2"} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{current ? currentName ?? "CV.pdf" : "Aún no subes tu CV"}</p>
          <p className="text-xs text-ink-2">PDF · máx. 5 MB · solo lo ven las empresas a las que postulas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {current && <button type="button" onClick={view} className="btn-ghost btn-sm">Ver</button>}
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-primary btn-sm">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {current ? "Reemplazar" : "Subir CV"}
          </button>
          {current && <button type="button" disabled={busy} onClick={() => run(() => onSave(null, null))} className="btn-ghost btn-sm text-error" aria-label="Quitar CV"><Trash2 size={16} /></button>}
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-error" role="alert">{error}</p>}
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

export function CvLink({ path, className = "btn-outline btn-sm" }: { path: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} className={className} onClick={async () => {
      setBusy(true);
      const url = await getCvUrl(path);
      setBusy(false);
      if (url) window.open(url, "_blank", "noopener");
      else alert("No tienes permiso para ver este CV o ya no existe.");
    }}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Ver CV
    </button>
  );
}

export function GalleryUpload({ folder, items, onSave }: { folder: string; items: GalleryItem[]; onSave: (g: GalleryItem[]) => Promise<{ error?: string }> }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useUploader();
  const [labels, setLabels] = useState<Record<string, string>>({});

  const add = (files: FileList | null) => {
    const list = [...(files ?? [])].slice(0, 8 - items.length);
    if (!list.length) return;
    for (const f of list) if (!validateImage(f, setError)) return;
    run(async () => {
      const added: GalleryItem[] = [];
      for (const f of list) {
        const { url } = await upload("company-media", folder, "galeria", f);
        added.push({ label: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 60), url });
      }
      return onSave([...items, ...added]);
    });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((g) => (
          <div key={g.url} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt={g.label} className="h-full w-full object-cover" />
              <button type="button" disabled={busy} onClick={() => run(() => onSave(items.filter((x) => x.url !== g.url)))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-error" aria-label={`Quitar ${g.label}`}><X size={16} /></button>
            </div>
            <input aria-label="Descripción de la foto" value={labels[g.url] ?? g.label} onChange={(e) => setLabels({ ...labels, [g.url]: e.target.value })}
              onBlur={() => labels[g.url] !== undefined && labels[g.url] !== g.label && run(() => onSave(items.map((x) => (x.url === g.url ? { ...x, label: labels[g.url] } : x))))}
              className="w-full border-t border-line px-3 py-2 text-sm outline-none focus:bg-primary-soft" />
          </div>
        ))}
        {items.length < 8 && (
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-line-strong bg-surface-2 text-sm font-semibold text-ink-2 hover:border-primary hover:text-primary">
            <span className="flex flex-col items-center gap-1">{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} Agregar fotos</span>
          </button>
        )}
      </div>
      <p className="hint">Hasta 8 fotos: fachada, instalaciones, equipo de trabajo. Edita la descripción debajo de cada foto.</p>
      {error && <p className="mt-2 text-xs font-semibold text-error" role="alert">{error}</p>}
      <input ref={input} type="file" accept={IMG.join(",")} multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
