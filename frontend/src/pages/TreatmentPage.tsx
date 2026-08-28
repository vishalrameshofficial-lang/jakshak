import React, { useState, useEffect } from "react";
import { useDemo } from "../context/DemoContext";
import { TreatmentPipeline } from "../components/treatment/TreatmentPipeline";
import { Sliders, RefreshCw, CheckCircle2, AlertOctagon } from "lucide-react";
import api from "../services/api";

export const TreatmentPage: React.FC = () => {
  const { sources, selectedSourceId, setSelectedSourceId } = useDemo();
  const [treatmentData, setTreatmentData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [recirculationCycles, setRecirculationCycles] = useState<number>(0);
  const [recoveryRatio, setRecoveryRatio] = useState<number>(91.6);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  const fetchTreatment = async () => {
    if (activeSource) {
      try {
        const res = await api.get(`/treatment/${activeSource.id}`);
        if (res.data.success) {
          setTreatmentData(res.data.data);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchTreatment();
  }, [activeSource]);

  const stages = treatmentData?.recommendation?.stages?.map((s: any) => ({
    id: s.stageId,
    name: s.stageName,
    active: treatmentData?.currentState?.stagesActive?.includes(s.valveId) || treatmentData?.currentState?.stagesActive?.includes(s.stageId),
    required: s.required,
    reason: s.reason,
    valveId: s.valveId
  })) || [
    { id: "sediment", name: "Sediment Filtration (V1)", active: true, required: true, reason: "Particulate clearance required", valveId: "V1" },
    { id: "carbon", name: "Activated Carbon Filter (V2)", active: true, required: true, reason: "Adsorption needed", valveId: "V2" },
    { id: "media", name: "Specialized Media Filter (V3)", active: false, required: false, reason: "Normal ion range", valveId: "V3" },
    { id: "ro", name: "Reverse Osmosis Membrane (V4)", active: true, required: true, reason: "High TDS desalinization", valveId: "V4" },
    { id: "uv", name: "UV Disinfection (V5)", active: true, required: true, reason: "Bio-safety mandatory clearance", valveId: "V5" }
  ];

  const handleToggleValve = (valveId: string) => {
    if (!treatmentData) return;
    const currentValves = treatmentData.currentState.stagesActive || [];
    const nextValves = currentValves.includes(valveId)
      ? currentValves.filter((v: string) => v !== valveId)
      : [...currentValves, valveId];

    setTreatmentData({
      ...treatmentData,
      currentState: { ...treatmentData.currentState, stagesActive: nextValves }
    });
  };

  const handleStart = async () => {
    if (!activeSource) return;
    try {
      await api.post("/treatment/start", {
        sourceId: activeSource.id,
        inputVolumeL: 1000,
        stagesActive: stages.filter((s: any) => s.active).map((s: any) => s.valveId)
      });
      fetchTreatment();
    } catch (e) {}
  };

  const handleStop = async () => {
    if (!activeSource) return;
    try {
      await api.post("/treatment/stop", { sourceId: activeSource.id });
      fetchTreatment();
    } catch (e) {}
  };

  const handleEmergencyStop = async () => {
    if (!activeSource) return;
    try {
      await api.post("/treatment/emergency-stop", { sourceId: activeSource.id });
      fetchTreatment();
    } catch (e) {}
  };

  const handleVerify = async () => {
    if (!activeSource) return;
    try {
      const res = await api.post("/treatment/verify", {
        sourceId: activeSource.id,
        attemptCount: recirculationCycles + 1
      });
      if (res.data.success) {
        setVerificationResult(res.data.verification);
        setRecoveryRatio(res.data.recovery.recoveryRatioPct);
      }
    } catch (e) {}
  };

  const handleRecirculate = async () => {
    setRecirculationCycles((prev) => prev + 1);
    if (!activeSource) return;
    try {
      const res = await api.post("/treatment/verify", {
        sourceId: activeSource.id,
        attemptCount: recirculationCycles + 2
      });
      if (res.data.success) {
        setVerificationResult(res.data.verification);
        setRecoveryRatio(res.data.recovery.recoveryRatioPct);
      }
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            Adaptive Purification & Second-Chance Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic stage selection, valve control simulation, post-treatment verification, and recirculation recovery tracking.
          </p>
        </div>

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
      </div>

      {/* Main Pipeline Component */}
      <TreatmentPipeline
        stages={stages}
        status={treatmentData?.currentState?.status || "STOPPED"}
        onToggleValve={handleToggleValve}
        onStart={handleStart}
        onStop={handleStop}
        onEmergencyStop={handleEmergencyStop}
        onVerify={handleVerify}
        onRecirculate={handleRecirculate}
        verificationResult={verificationResult}
        waterRecoveryRatio={recoveryRatio}
      />
    </div>
  );
};
