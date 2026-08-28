import React, { useState, useEffect } from "react";
import { Filter, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../services/api";

export const FiltersPage: React.FC = () => {
  const [filters, setFilters] = useState<any[]>([]);

  const fetchFilters = async () => {
    try {
      const res = await api.get("/filters");
      if (res.data.success) {
        setFilters(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleResetFilter = async (filterId: string) => {
    try {
      await api.post("/filters/update", { filterId, action: "RESET_REPLACE" });
      fetchFilters();
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Filter className="w-6 h-6 text-cyan-400" />
            Filter Health & Predictive Maintenance (RUL)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Usage-based degradation modeling considering total volume processed (L), turbidity exposure, and operating hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filters.map((f) => (
          <div key={f.id} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{f.stageName}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  f.status === "GOOD" ? "bg-emerald-500/20 text-emerald-400" :
                  f.status === "SERVICE_SOON" ? "bg-amber-500/20 text-amber-400" :
                  "bg-rose-500/20 text-rose-400 animate-pulse"
                }`}>
                  {f.status}
                </span>
              </div>

              <p className="text-xs text-slate-400">Node: <strong className="text-slate-200">{f.source?.name} ({f.source?.code})</strong></p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Health State:</span>
                  <span className="font-bold text-cyan-400">{f.healthPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      f.healthPercent > 50 ? "bg-emerald-500" : f.healthPercent > 25 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${f.healthPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono space-y-1 pt-2">
                <p>Volume Processed: <strong className="text-slate-200">{f.volumeProcessedL} L</strong></p>
                <p>Turbidity Exposure: <strong className="text-slate-200">{f.turbidityExposure} NTU</strong></p>
                <p>Estimated RUL: <strong className="text-amber-400">{f.estimatedRulDays} days remaining</strong></p>
              </div>
            </div>

            <button
              onClick={() => handleResetFilter(f.id)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 rounded-lg transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mark Filter Replacement Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
