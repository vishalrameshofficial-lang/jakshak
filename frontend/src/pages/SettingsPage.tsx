import React, { useState, useEffect } from "react";
import { Settings, Save, Shield } from "lucide-react";
import api from "../services/api";

export const SettingsPage: React.FC = () => {
  const [thresholds, setThresholds] = useState<any[]>([]);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const res = await api.get("/admin/thresholds");
        if (res.data.success) {
          setThresholds(res.data.data);
        }
      } catch (e) {}
    };
    fetchThresholds();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Water Quality Standards & Threshold Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configurable parameter limits according to IS 10500:2012 Indian Drinking Water Standards.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Active Water Quality Threshold Limits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thresholds.map((t) => (
            <div key={t.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{t.parameter} ({t.unit})</span>
                <span className="text-[10px] text-cyan-400 font-mono">{t.standardSource}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div>Safe Upper: <strong className="text-emerald-400">{t.upperLimit}</strong></div>
                <div>Warning Limit: <strong className="text-amber-400">{t.warningLimit}</strong></div>
                <div>Critical Limit: <strong className="text-rose-400">{t.criticalLimit}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
