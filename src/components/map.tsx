"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = { lat: number; lng: number; title: string; subtitle?: string; href?: string };

const PIN = '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#A1002C;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.3)"></div>';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function OfferMap({ points, height = 380, className = "" }: { points: MapPoint[]; height?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(points);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      const icon = L.divIcon({ className: "", html: PIN, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
      const pts: MapPoint[] = JSON.parse(key);
      pts.forEach((p) => {
        const html = `<strong>${esc(p.title)}</strong>${p.subtitle ? `<br><span style="color:#4F4A5C">${esc(p.subtitle)}</span>` : ""}${p.href ? `<br><a href="${esc(p.href)}" style="color:#C80036;font-weight:700">Ver detalle →</a>` : ""}`;
        L.marker([p.lat, p.lng], { icon, title: p.title }).addTo(map!).bindPopup(html);
      });
      if (pts.length === 1) map.setView([pts[0].lat, pts[0].lng], 16);
      else if (pts.length) map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number])).pad(0.25));
      else map.setView([-12.5933, -69.1891], 13);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [key]);

  return <div ref={ref} style={{ height }} className={`w-full overflow-hidden rounded-[18px] border border-line bg-hover ${className}`} role="region" aria-label="Mapa de ubicación" />;
}
