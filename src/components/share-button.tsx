"use client";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {
      // El usuario canceló
    }
  };
  return (
    <button type="button" onClick={share} className="btn-ghost w-full">
      {done ? <Check size={18} /> : <Share2 size={18} />} {done ? "Enlace copiado" : "Compartir oferta"}
    </button>
  );
}
