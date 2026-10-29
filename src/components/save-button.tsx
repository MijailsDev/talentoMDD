"use client";
import { useOptimistic, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toggleSave } from "@/app/actions/student";

export function SaveButton({ offerId, saved, variant = "icon" }: { offerId: string; saved: boolean; variant?: "icon" | "full" }) {
  const path = usePathname();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [pending, start] = useTransition();
  const label = optimistic ? "Quitar de guardados" : "Guardar oferta";

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      setOptimistic(!optimistic);
      const r = await toggleSave(offerId, path);
      if (r && "error" in r && r.error) alert(r.error);
    });
  };

  if (variant === "full") {
    return (
      <button type="button" onClick={onClick} disabled={pending} aria-pressed={optimistic} className="btn-outline">
        <Bookmark size={18} fill={optimistic ? "currentColor" : "none"} className={optimistic ? "text-primary" : ""} />
        {optimistic ? "Guardada" : "Guardar oferta"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={label}
      title={label}
      className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface transition hover:bg-hover ${optimistic ? "text-primary" : "text-ink-2"}`}
    >
      <Bookmark size={18} fill={optimistic ? "currentColor" : "none"} />
    </button>
  );
}
