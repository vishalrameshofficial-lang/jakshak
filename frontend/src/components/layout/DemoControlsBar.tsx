import React from "react";
import { useDemo } from "../../context/DemoContext";
import { DemoScenario } from "../../types";
import { Sliders, Zap } from "lucide-react";

export const DemoControlsBar: React.FC = () => {
  const { activeScenario, setScenario } = useDemo();

  const scenarios: { id: DemoScenario; label: string; color: string }[] = [
    { id: "NORMAL", label: "NORMAL", color: "hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/40" },
    { id: "HIGH_TURBIDITY", label: "HIGH TURBIDITY", color: "hover:bg-amber-600/30 text-amber-400 border-amber-500/40" },
    { id: "HIGH_TDS", label: "HIGH TDS", color: "hover:bg-orange-600/30 text-orange-400 border-orange-500/40" },
    { id: "CONTAMINATION_EVENT", label: "CONTAMINATION EVENT", color: "hover:bg-rose-600/30 text-rose-400 border-rose-500/40" },
    { id: "TREATMENT_FAILURE", label: "TREATMENT FAILURE", color: "hover:bg-purple-600/30 text-purple-400 border-purple-500/40" },
    { id: "FILTER_DEGRADATION", label: "FILTER DEGRADATION", color: "hover:bg-cyan-600/30 text-cyan-400 border-cyan-500/40" },
    { id: "DEVICE_OFFLINE", label: "DEVICE OFFLINE", color: "hover:bg-slate-600/30 text-slate-400 border-slate-500/40" }
  ];

  return (
    <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
        <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
        <span>SIH DEMO SCENARIO CONTROLS:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {scenarios.map((sc) => {
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                isActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-extrabold"
                  : `bg-slate-900/80 ${sc.color}`
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
