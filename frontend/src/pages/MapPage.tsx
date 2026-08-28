import React, { useState } from "react";
import { useDemo } from "../context/DemoContext";
import { InteractiveMap } from "../components/map/InteractiveMap";
import { MapPin, Filter } from "lucide-react";

export const MapPage: React.FC = () => {
  const { sources } = useDemo();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredSources = sources.filter((s) => {
    if (activeFilter === "SAFE") return s.status === "SAFE";
    if (activeFilter === "WATCH") return s.status === "WATCH";
    if (activeFilter === "WARNING") return s.status === "WARNING";
    if (activeFilter === "CRITICAL") return s.status === "CRITICAL";
    if (activeFilter === "MINING") return s.isMiningAffected;
    return true;
  });

  return (
    <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Regional Contamination Risk Map</h1>
            <p className="text-xs text-slate-400">Geospatial monitoring across rural and mining-affected regions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "SAFE", "WATCH", "WARNING", "CRITICAL", "MINING"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                activeFilter === f
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <InteractiveMap sources={filteredSources} />
      </div>
    </div>
  );
};
