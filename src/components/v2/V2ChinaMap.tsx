"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * V2ChinaMap — vraie carte interactive Leaflet/OpenStreetMap.
 *
 * Pas d'API key (tuiles OSM en CDN). Zoomable, draggable, mobile-friendly.
 * Affiche 4 hubs avec markers personnalisés + popups au clic.
 *
 * Important : ce composant ne fonctionne QUE côté client (Leaflet touche
 * window/document). Toujours l'importer via `dynamic(() => ..., { ssr: false })`.
 */

type Hub = {
  name: string;
  province: string;
  lat: number;
  lng: number;
  specialty: string;
  agents: number;
};

const HUBS: Hub[] = [
  {
    name: "Shanghai",
    province: "Shanghai",
    lat: 31.2304,
    lng: 121.4737,
    specialty: "Cosméto, mode, luxe",
    agents: 4,
  },
  {
    name: "Yiwu",
    province: "Zhejiang",
    lat: 29.3097,
    lng: 120.0742,
    specialty: "Accessoires, gadgets, goodies",
    agents: 3,
  },
  {
    name: "Guangzhou",
    province: "Guangdong",
    lat: 23.1291,
    lng: 113.2644,
    specialty: "Textile, maroquinerie, électro grand public",
    agents: 4,
  },
  {
    name: "Shenzhen",
    province: "Guangdong",
    lat: 22.5429,
    lng: 114.0596,
    specialty: "Électronique, tech, IoT",
    agents: 3,
  },
];

/** Marker custom (pas l'icône par défaut de Leaflet qui est cassée avec webpack/next) */
function createMarkerIcon(label: string) {
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(180deg, #3B82F6, #1D4ED8);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow:
            0 2px 6px rgba(15, 23, 42, 0.25),
            0 0 0 1px rgba(29, 78, 216, 0.4);
          color: white;
          font-weight: 700;
          font-size: 12px;
          font-family: ui-sans-serif, system-ui, sans-serif;
        ">
          ${label[0]}
        </div>
        <div style="
          width: 0;
          height: 0;
          margin-top: -2px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #1D4ED8;
        "></div>
      </div>
    `,
  });
}

export function V2ChinaMap() {
  // Avoid hydration mismatch — only render after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="aspect-[5/4] w-full animate-pulse rounded-2xl bg-neutral-100" />
    );
  }

  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
      <MapContainer
        center={[28, 117]} // centered between Shanghai and Guangzhou
        zoom={4}
        minZoom={3}
        maxZoom={8}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "#EFF6FF" }}
        attributionControl={false}
      >
        {/* CartoDB Positron — light, clean style that matches our DA */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <ZoomControl position="bottomright" />

        {HUBS.map((hub) => (
          <Marker
            key={hub.name}
            position={[hub.lat, hub.lng]}
            icon={createMarkerIcon(hub.name)}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 2,
                  }}
                >
                  {hub.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    marginBottom: 8,
                  }}
                >
                  {hub.province}, Chine
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    marginBottom: 8,
                  }}
                >
                  {hub.agents} agents
                </div>
                <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.4 }}>
                  Spécialité&nbsp;: {hub.specialty}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay label top-left */}
      <div className="pointer-events-none absolute left-4 top-4 z-[400] inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-600 shadow-sm backdrop-blur-sm">
        Chine · 4 hubs principaux
      </div>

      {/* Subtle gradient fade on edges for blend */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[300] rounded-2xl ring-1 ring-inset ring-white/20"
        style={{
          boxShadow: "inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      />
    </div>
  );
}
