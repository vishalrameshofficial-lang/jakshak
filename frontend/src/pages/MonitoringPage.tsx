import React, { useState, useEffect } from "react";
import { useDemo } from "../context/DemoContext";
import { Sparkline } from "../components/common/Sparkline";
import { StatusBadge } from "../components/common/StatusBadge";
import { Activity, RefreshCw, Cpu, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../services/api";

export const MonitoringPage: React.FC = () => {
  const { sources, selectedSourceId, setSelectedSourceId } = useDemo();
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    const fetchReadings = async () => {
      const activeId = selectedSourceId || (sources[0] ? sources[0].id : "");
      if (activeId) {
        try {
          const res = await api.get(`/sources/${activeId}/readings?limit=30`);
          if (res.data.success) {
            setReadings(res.data.data);
          }
        } catch (e) {}
      }
    };
    fetchReadings();
  }, [selectedSourceId, sources]);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];
  const latest = readings[readings.length - 1] || {
    ph: 6.8, tds: 540, ec: 810, turbidity: 1.3, temperature: 27.2, flowRate: 3.5, waterLevel: 75
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Live Water Quality Telemetry Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time parameter monitoring across pH, TDS, EC, Turbidity, Temperature, Flow Rate, and Water Level.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeSource?.id || ""}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-cyan-300 px-3 py-2 rounded-xl border border-slate-700"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name} ({s.village})
              </option>
            ))}
          </select>
          {activeSource && <StatusBadge status={activeSource.status} />}
        </div>
      </div>

      {/* Live Stream Table */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Recent Ingested Sensor Telemetry Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">pH</th>
                <th className="p-3">TDS (ppm)</th>
                <th className="p-3">EC (µS/cm)</th>
                <th className="p-3">Turbidity (NTU)</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Flow (L/m)</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {readings.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-white">{r.ph}</td>
                  <td className="p-3 text-amber-400">{r.tds}</td>
                  <td className="p-3">{r.ec}</td>
                  <td className="p-3 text-cyan-400">{r.turbidity}</td>
                  <td className="p-3">{r.temperature}</td>
                  <td className="p-3">{r.flowRate}</td>
                  <td className="p-3 font-bold text-amber-400">{r.riskScore}/100</td>
                  <td className="p-3">
                    {r.isAnomaly ? (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">FLAGGED</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold">NORMAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
