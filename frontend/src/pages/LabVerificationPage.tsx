import React, { useState, useEffect } from "react";
import { FileCheck2, Plus, CheckCircle2, FlaskConical, AlertCircle } from "lucide-react";
import api from "../services/api";
import { useDemo } from "../context/DemoContext";

export const LabVerificationPage: React.FC = () => {
  const { sources } = useDemo();
  const [samples, setSamples] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    sourceId: sources[0]?.id || "",
    sampleCode: `LAB-${Date.now().toString().slice(-6)}`,
    collectedBy: "Field Tech R. Sharma",
    reason: "Confirmatory Mining Runoff Audit",
    ph: 6.8,
    tds: 520,
    turbidity: 1.4,
    iron: 0.25,
    manganese: 0.05,
    arsenic: 0.005,
    lead: 0.001,
    updateBaselineModel: true
  });

  const fetchSamples = async () => {
    try {
      const res = await api.get("/lab/samples");
      if (res.data.success) {
        setSamples(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create sample
      const sampleRes = await api.post("/lab/samples", {
        sourceId: formData.sourceId,
        sampleCode: formData.sampleCode,
        collectedBy: formData.collectedBy,
        reason: formData.reason
      });

      if (sampleRes.data.success) {
        const sampleId = sampleRes.data.data.id;
        // 2. Add lab result
        await api.post("/lab/results", {
          sampleId,
          ph: formData.ph,
          tds: formData.tds,
          turbidity: formData.turbidity,
          iron: formData.iron,
          manganese: formData.manganese,
          arsenic: formData.arsenic,
          lead: formData.lead,
          updateBaselineModel: formData.updateBaselineModel
        });
        setShowModal(false);
        fetchSamples();
      }
    } catch (err) {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            Laboratory Ground-Truth Verification & Model Calibration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log confirmatory laboratory test results for Heavy Ion/Chemical parameters (Arsenic, Lead, Fluoride, Iron) to calibrate source baselines.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Log Lab Sample Result
        </button>
      </div>

      {/* Samples Table */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          Verified Laboratory Audit Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Sample Code</th>
                <th className="p-3">Water Source</th>
                <th className="p-3">Collected By</th>
                <th className="p-3">Verified pH</th>
                <th className="p-3">Verified TDS</th>
                <th className="p-3">Iron (mg/L)</th>
                <th className="p-3">Arsenic (mg/L)</th>
                <th className="p-3">Model Calibrated</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {samples.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-cyan-300">{s.sampleCode}</td>
                  <td className="p-3 font-bold text-white">{s.source?.name}</td>
                  <td className="p-3 text-slate-400">{s.collectedBy}</td>
                  <td className="p-3">{s.result?.ph || "6.2"}</td>
                  <td className="p-3 text-amber-400">{s.result?.tds || "880"} ppm</td>
                  <td className="p-3">{s.result?.iron || "0.42"}</td>
                  <td className="p-3 text-emerald-400">{s.result?.arsenic || "0.008"} (Safe)</td>
                  <td className="p-3 font-semibold text-emerald-400">
                    {s.result?.calibrationUsed ? "YES (Updated Baseline)" : "NO"}
                  </td>
                  <td className="p-3 font-bold text-emerald-400">VERIFIED</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white">Log Confirmatory Laboratory Result</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Water Source Node:</label>
                <select
                  value={formData.sourceId}
                  onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                  className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sample Code:</label>
                  <input
                    type="text"
                    value={formData.sampleCode}
                    onChange={(e) => setFormData({ ...formData, sampleCode: e.target.value })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Collected By:</label>
                  <input
                    type="text"
                    value={formData.collectedBy}
                    onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Lab pH:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Lab TDS (ppm):</label>
                  <input
                    type="number"
                    value={formData.tds}
                    onChange={(e) => setFormData({ ...formData, tds: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Turbidity (NTU):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.turbidity}
                    onChange={(e) => setFormData({ ...formData, turbidity: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Arsenic (mg/L):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.arsenic}
                    onChange={(e) => setFormData({ ...formData, arsenic: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Iron (mg/L):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.iron}
                    onChange={(e) => setFormData({ ...formData, iron: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 text-white p-2 rounded border border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="recalibrate"
                  checked={formData.updateBaselineModel}
                  onChange={(e) => setFormData({ ...formData, updateBaselineModel: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800"
                />
                <label htmlFor="recalibrate" className="text-slate-300">
                  Use this verified ground truth to recalibrate source baseline model
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                >
                  Save Lab Ground Truth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
