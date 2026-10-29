"use client";
import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";

const PIN = '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#C80036;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.3)"></div>';
const CENTER: [number, number] = [-12.5933, -69.1891]; // Puerto Maldonado

/** Mapa para marcar la ubicación de la empresa; guarda lat/lng en inputs ocultos */
export function LocationPicker({ lat, lng }: { lat: number | null; lng: number | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<[number, number] | null>(lat != null && lng != null ? [lat, lng] : null);
  const marker = useRef<import("leaflet").Marker | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      const icon = L.divIcon({ className: "", html: PIN, iconSize: [30, 30], iconAnchor: [15, 30] });
      map = L.map(ref.current, { scrollWheelZoom: false }).setView(pos ?? CENTER, pos ? 16 : 13);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      const place = (p: [number, number]) => {
        if (marker.current) marker.current.setLatLng(p);
        else marker.current = L.marker(p, { icon, draggable: true }).addTo(map!).on("dragend", (e) => {
          const ll = (e.target as import("leaflet").Marker).getLatLng();
          setPos([+ll.lat.toFixed(6), +ll.lng.toFixed(6)]);
        });
        setPos([+p[0].toFixed(6), +p[1].toFixed(6)]);
      };
      if (pos) place(pos);
      map.on("click", (e) => place([e.latlng.lat, e.latlng.lng]));
    })();
    return () => {
      cancelled = true;
      marker.current = null;
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locate = () =>
    navigator.geolocation?.getCurrentPosition((g) => {
      const p: [number, number] = [+g.coords.latitude.toFixed(6), +g.coords.longitude.toFixed(6)];
      setPos(p);
      marker.current?.setLatLng(p);
      mapRef.current?.setView(p, 17);
    });

  return (
    <div>
      <input type="hidden" name="lat" value={pos?.[0] ?? ""} />
      <input type="hidden" name="lng" value={pos?.[1] ?? ""} />
      <div ref={ref} className="h-72 w-full rounded-[18px] border border-line" role="application" aria-label="Mapa: haz clic para marcar la ubicación" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
        <span>{pos ? `Ubicación marcada: ${pos[0]}, ${pos[1]}` : "Haz clic en el mapa para marcar tu dirección (puedes arrastrar el marcador)."}</span>
        <span className="flex gap-2">
          <button type="button" onClick={locate} className="btn-ghost btn-sm"><LocateFixed size={15} /> Usar mi ubicación</button>
          {pos && <button type="button" onClick={() => { setPos(null); marker.current?.remove(); marker.current = null; }} className="btn-ghost btn-sm text-error">Quitar</button>}
        </span>
      </div>
    </div>
  );
}
