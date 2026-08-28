import React, { useState, useEffect } from "react";
import { useDemo } from "../context/DemoContext";
import { WaterRiskGauge } from "../components/common/WaterRiskGauge";
import { FingerprintRadarChart } from "../components/fingerprint/FingerprintRadarChart";
import { StatusBadge } from "../components/common/StatusBadge";
import { Sparkline } from "../components/common/Sparkline";
import { DemoControlsBar } from "../components/layout/DemoControlsBar";
import { Activity, ShieldCheck, AlertTriangle, Droplet, RefreshCw, Cpu, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../services/api";
import { WaterSource } from "../types";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const { sources, selectedSourceId, setSelectedSourceId, setPresentationModeActive } = useDemo();
  const [sourceDetail, setSourceDetail] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const idToFetch = selectedSourceId || (sources[0] ? sources[0].id : "");
      if (idToFetch) {
        try {
          const res = await api.get(`/sources/${idToFetch}`);
          if (res.data.success) {
            setSourceDetail(res.data.data);
          }
        } catch (e) {}
      }
    };
    fetchDetail();
  }, [selectedSourceId, sources]);

  const activeSource: WaterSource = sourceDetail || sources[0] || {
    id: "demo-id",
    code: "KA-014",
    name: "Mine Zone Borewell B",
    village: "Kalyanpur Mining Block",
    district: "Ballari",
    state: "Karnataka",
    type: "BOREWELL",
    isMiningAffected: true,
    latitude: 15.1424,
    longitude: 76.9214,
    status: "SAFE",
    currentRiskScore: 21,
    lastUpdate: new Date().toISOString()
  };

  const baseline = activeSource.baseline || {
    id: "base-id", phMean: 7.1, phStd: 0.2, tdsMean: 450, tdsStd: 35, ecMean: 680, ecStd: 45, turbidityMean: 1.1, turbidityStd: 0.15, tempMean: 26.5, tempStd: 1.2, sampleCount: 500
  };

  const latestReading = activeSource.readings && activeSource.readings[0] ? activeSource.readings[0] : {
    id: "read-id", sourceId: activeSource.id || "demo-id", timestamp: new Date().toISOString(), ph: 6.8, tds: 542, ec: 810, turbidity: 1.3, temperature: 27.2, flowRate: 3.5, waterLevel: 75, riskScore: activeSource.currentRiskScore || 21, anomalyScore: 12, isAnomaly: false
  };

  // Aggregated KPI counts
  const totalCount = sources.length || 24;
  const safeCount = sources.filter(s => s.status === "SAFE").length || 17;
  const watchCount = sources.filter(s => s.status === "WATCH").length || 4;
  const warningCount = sources.filter(s => s.status === "WARNING").length || 2;
  const criticalCount = sources.filter(s => s.status === "CRITICAL").length || 1;

  return (
    <div className="space-y-6">
      {/* Demo Controls Bar */}
      <DemoControlsBar />

      <div className="px-6 space-y-6">
        {/* Header Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              JAL-RAKSHAK Water Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time water quality, adaptive treatment and contamination early-warning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPresentationModeActive(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20"
            >
              <Award className="w-4 h-4" />
              SIH PRESENTATION WALKTHROUGH
            </button>
          </div>
        </div>

        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sources</span>
              <span className="text-2xl font-mono font-extrabold text-white mt-1 block">{totalCount}</span>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <span className="text-emerald-400 font-bold">{safeCount} Safe</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">{watchCount} Watch</span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400 font-bold">{criticalCount} Crit</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Water Processed</span>
              <span className="text-2xl font-mono font-extrabold text-cyan-400 mt-1 block">4,280 L</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Today's Total Volume</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Water Recovered</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-400 mt-1 block">3,920 L</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">+8.4% Efficiency</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Recovery Rate</span>
              <span className="text-2xl font-mono font-extrabold text-amber-400 mt-1 block">91.6%</span>
              <span className="text-[10px] text-slate-400 mt-1 block">WRR Closed-Loop Ratio</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Source Selector Dropdown Bar */}
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Active Node:</span>
            <select
              value={activeSource.id}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className="bg-slate-950 text-xs font-semibold text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name} ({s.village}) [{s.status}]
                </option>
              ))}
            </select>
          </div>

          <StatusBadge status={activeSource.status} />
        </div>

        {/* Live Water Quality Panel & Risk Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Parameter Telemetry Grid (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Sensor Telemetry ({activeSource.name})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Updated 3s ago</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* pH */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>pH</span>
                  <span className="text-[10px] text-emerald-400">Range: 6.5 - 8.5</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-white">{latestReading.ph.toFixed(2)}</span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" /> 0.2
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[7.1, 7.0, 6.9, 6.8, 6.8]} color="#10b981" />
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Normal
                  </span>
                </div>
              </div>

              {/* TDS */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>TDS</span>
                  <span className="text-[10px] text-amber-400">Limit: 500 ppm</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-amber-400">{latestReading.tds.toFixed(0)} <span className="text-xs font-normal text-slate-400">ppm</span></span>
                  <span className="text-xs font-mono text-amber-400 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 8%
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[420, 450, 480, 510, 542]} color="#f59e0b" />
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Watch
                  </span>
                </div>
              </div>

              {/* Turbidity */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Turbidity</span>
                  <span className="text-[10px] text-cyan-400">Limit: 1.0 NTU</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-white">{latestReading.turbidity.toFixed(1)} <span className="text-xs font-normal text-slate-400">NTU</span></span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" /> 12%
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[1.8, 1.6, 1.5, 1.4, 1.3]} color="#0284c7" />
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Safe
                  </span>
                </div>
              </div>

              {/* EC */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>EC</span>
                  <span className="text-[10px] text-slate-400">µS/cm</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-white">{latestReading.ec.toFixed(0)}</span>
                  <span className="text-xs font-mono text-amber-400 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 4%
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[750, 780, 790, 800, 810]} color="#38bdf8" />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Stable
                  </span>
                </div>
              </div>

              {/* Temperature */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Temperature</span>
                  <span className="text-[10px] text-slate-400">°C</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-white">{latestReading.temperature.toFixed(1)}</span>
                  <span className="text-xs font-mono text-slate-400">Stable</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[27.1, 27.2, 27.2, 27.2, 27.2]} color="#94a3b8" />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Normal
                  </span>
                </div>
              </div>

              {/* Flow Rate */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Flow Rate</span>
                  <span className="text-[10px] text-slate-400">L/min</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-mono font-extrabold text-cyan-400">{latestReading.flowRate.toFixed(1)}</span>
                  <span className="text-xs font-mono text-cyan-400">3.5 L/m</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Sparkline data={[3.4, 3.5, 3.5, 3.5, 3.5]} color="#0284c7" />
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Water Risk Score Card (1 col) */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Water Risk Score
              </h3>
              <span className="text-[10px] font-mono text-slate-400">0 - 100 Gauge</span>
            </div>

            <WaterRiskGauge
              score={latestReading.riskScore}
              size="lg"
              summary={
                latestReading.riskScore <= 24
                  ? "Water parameters strictly adhere to standard baseline limits."
                  : "Abnormal water quality signature detected — confirmatory testing recommended."
              }
              factors={[
                { parameter: "TDS Deviation", points: 7, reason: "TDS level elevated by 8% above baseline standard." },
                { parameter: "pH Shift", points: 4, reason: "pH value slight shift from historical mean." }
              ]}
            />

            <Link
              to="/treatment"
              className="w-full text-center py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition block shadow-lg shadow-cyan-600/20"
            >
              Open Adaptive Treatment Matrix
            </Link>
          </div>
        </div>

        {/* Water Fingerprint Radar Chart */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Water Fingerprint (Current vs Baseline)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-dimensional statistical fingerprint signature comparing normal source baseline vs current telemetry.
              </p>
            </div>
            <Link to={`/sources/${activeSource.id}`} className="text-xs font-bold text-cyan-400 hover:underline">
              View Detailed Source Intelligence &rarr;
            </Link>
          </div>

          <FingerprintRadarChart baseline={baseline} current={latestReading} />
        </div>
      </div>
    </div>
  );
};
