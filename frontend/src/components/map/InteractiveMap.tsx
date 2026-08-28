import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { WaterSource } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { Link } from "react-router-dom";

// Custom Leaflet marker icons based on water status
const createCustomIcon = (status: string) => {
  let color = "#10b981"; // Safe Green
  if (status === "WATCH") color = "#f59e0b"; // Watch Yellow
  if (status === "WARNING") color = "#f97316"; // Warning Orange
  if (status === "CRITICAL") color = "#ef4444"; // Critical Red
  if (status === "OFFLINE") color = "#64748b"; // Offline Gray

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

interface InteractiveMapProps {
  sources: WaterSource[];
  selectedSourceId?: string;
  onSelectSource?: (source: WaterSource) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ sources, onSelectSource }) => {
  // Default center coordinates set to Central India (Ballari / Dhanbad region center)
  const defaultCenter: [number, number] = [18.5, 78.5];

  return (
    <div className="w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {sources.map((source) => {
          const icon = createCustomIcon(source.status);

          return (
            <Marker
              key={source.id}
              position={[source.latitude, source.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSource && onSelectSource(source)
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-slate-100 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2">
                    <span className="font-bold text-sm text-cyan-400">{source.name}</span>
                    <StatusBadge status={source.status} />
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <p><span className="text-slate-400">Village:</span> {source.village}</p>
                    <p><span className="text-slate-400">District:</span> {source.district}, {source.state}</p>
                    <p><span className="text-slate-400">Type:</span> {source.type}</p>
                    <p><span className="text-slate-400">Mining Zone:</span> {source.isMiningAffected ? "Yes" : "No"}</p>
                    <p><span className="text-slate-400">Risk Score:</span> <strong className="text-amber-400">{source.currentRiskScore} / 100</strong></p>
                  </div>

                  <div className="pt-1">
                    <Link
                      to={`/sources/${source.id}`}
                      className="block text-center text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white py-1.5 rounded transition"
                    >
                      View Source Intelligence
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
