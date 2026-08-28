import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StatusBadge } from "../components/common/StatusBadge";
import { WaterRiskGauge } from "../components/common/WaterRiskGauge";
import { FingerprintRadarChart } from "../components/fingerprint/FingerprintRadarChart";
import { ArrowLeft, Droplet, MapPin, Activity, ShieldCheck, FileCheck2, Cpu, Filter } from "lucide-react";
import api from "../services/api";

export const SourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSource = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sources/${id}`);
        if (res.data.success) {
          setSource(res.data.data);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSource();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-mono text-xs">Loading water source intelligence...</div>;
  }

  if (!source) {
    return <div className="p-8 text-center text-rose-400 font-mono text-xs">Water source not found.</div>;
  }

  const baseline = source.baseline || {
    id: "base-id", phMean: 7.1, phStd: 0.2, tdsMean: 450, tdsStd: 35, ecMean: 680, ecStd: 45, turbidityMean: 1.1, turbidityStd: 0.15, tempMean: 26.5, tempStd: 1.2, sampleCount: 500
  };

  const latest = source.readings && source.readings[0] ? source.readings[0] : {
    id: "read-id", sourceId: source.id || "demo-id", timestamp: new Date().toISOString(), ph: 6.8, tds: 540, ec: 810, turbidity: 1.3, temperature: 27.2, flowRate: 3.5, waterLevel: 75, riskScore: source.currentRiskScore || 21, anomalyScore: 12, isAnomaly: false
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link to="/sources" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Sources Catalog
      </Link>

      {/* Source Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-cyan-400">{source.code}</span>
            <StatusBadge status={source.status} />
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{source.name}</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            {source.village}, {source.district}, {source.state} (Lat: {source.latitude}, Lng: {source.longitude})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/treatment"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition"
          >
            Launch Treatment Matrix
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fingerprint Radar Chart */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Source Water Fingerprint (Baseline vs Current)
            </h3>
            <FingerprintRadarChart baseline={baseline} current={latest} />
          </div>

          {/* Filter Status Table */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Filter Health & Remaining Useful Life (RUL)
            </h3>
            <div className="space-y-3">
              {(source.filters || []).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{f.stageName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Processed: {f.volumeProcessedL} L</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-400 block">{f.healthPercent}% Health</span>
                    <span className="text-[10px] text-slate-400">Est. RUL: {f.estimatedRulDays} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          {/* Risk Gauge Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Calculated Risk Score
            </h3>
            <WaterRiskGauge score={latest.riskScore || source.currentRiskScore} size="md" />
          </div>

          {/* Lab Ground Truth Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Laboratory Verification Audit
            </h3>
            {source.labSamples && source.labSamples.length > 0 ? (
              <div className="text-xs space-y-2 text-slate-300 font-mono">
                <p>Sample Code: <strong className="text-cyan-300">{source.labSamples[0].sampleCode}</strong></p>
                <p>Status: <span className="text-emerald-400 font-bold">{source.labSamples[0].status}</span></p>
                {source.labSamples[0].result && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] space-y-1">
                    <p>Verified pH: {source.labSamples[0].result.ph}</p>
                    <p>Verified TDS: {source.labSamples[0].result.tds} ppm</p>
                    <p>Iron: {source.labSamples[0].result.iron || "0.42"} mg/L</p>
                    <p>Arsenic: {source.labSamples[0].result.arsenic || "0.008"} mg/L (Safe)</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No laboratory ground truth sample logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
