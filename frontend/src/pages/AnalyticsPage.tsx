import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useDemo } from "../context/DemoContext";
import { BarChart3, Calendar, Download } from "lucide-react";
import api from "../services/api";

export const AnalyticsPage: React.FC = () => {
  const { sources, selectedSourceId, setSelectedSourceId } = useDemo();
  const [readings, setReadings] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<string>("7D");

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  useEffect(() => {
    const fetchHistory = async () => {
      if (activeSource) {
        try {
          const res = await api.get(`/sources/${activeSource.id}/readings?limit=50`);
          if (res.data.success) {
            setReadings(res.data.data);
          }
        } catch (e) {}
      }
    };
    fetchHistory();
  }, [activeSource]);

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
    ph: r.ph,
    tds: r.tds,
    turbidity: r.turbidity,
    risk: r.riskScore
  }));

  const handleExportCSV = () => {
    const headers = "Timestamp,pH,TDS,EC,Turbidity,Temperature,RiskScore\n";
    const rows = readings.map(r => `${r.timestamp},${r.ph},${r.tds},${r.ec},${r.turbidity},${r.temperature},${r.riskScore}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JAL_RAKSHAK_${activeSource?.code || "REPORT"}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Historical Telemetry & Seasonal Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive multi-parameter historical trend charts and seasonal baseline correlation.
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
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* TDS History Chart */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">TDS (Total Dissolved Solids) Trend (ppm)</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="tds" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* pH History Chart */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">pH Levels over Time</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[5, 9]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="ph" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
