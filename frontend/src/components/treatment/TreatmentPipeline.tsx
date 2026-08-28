import React from "react";
import { CheckCircle2, XCircle, Play, Square, AlertOctagon, Activity, RefreshCw } from "lucide-react";

interface TreatmentStage {
  id: string;
  name: string;
  active: boolean;
  required: boolean;
  reason: string;
  valveId: string;
}

interface TreatmentPipelineProps {
  stages: TreatmentStage[];
  status: "RUNNING" | "STOPPED" | "VERIFIED_PASS" | "VERIFIED_FAIL";
  onToggleValve: (valveId: string) => void;
  onStart: () => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  onVerify: () => void;
  onRecirculate?: () => void;
  verificationResult?: {
    passed: boolean;
    finalPh: number;
    finalTds: number;
    finalTurbidity: number;
    message: string;
  } | null;
  waterRecoveryRatio?: number;
}

export const TreatmentPipeline: React.FC<TreatmentPipelineProps> = ({
  stages,
  status,
  onToggleValve,
  onStart,
  onStop,
  onEmergencyStop,
  onVerify,
  onRecirculate,
  verificationResult,
  waterRecoveryRatio = 91.6
}) => {
  const isRunning = status === "RUNNING";

  return (
    <div className="space-y-6">
      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System State:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isRunning ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse" :
            status === "VERIFIED_PASS" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            status === "VERIFIED_FAIL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
            "bg-slate-800 text-slate-400 border border-slate-700"
          }`}>
            <Activity className="w-3.5 h-3.5" />
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-cyan-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              START ADAPTIVE TREATMENT
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              PAUSE PURIFICATION
            </button>
          )}

          <button
            onClick={onVerify}
            disabled={!isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFY QUALITY
          </button>

          <button
            onClick={onEmergencyStop}
            className="flex items-center gap-2 px-3 py-2 bg-rose-950/80 border border-rose-600/50 text-rose-300 hover:bg-rose-900 rounded-lg text-xs font-bold transition"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            EMERGENCY STOP
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stage Flow */}
      <div className="relative glass-panel p-6 rounded-xl border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">

          {/* Raw Water Ingest */}
          <div className="flex flex-col items-center text-center w-28">
            <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-inner">
              RAW
            </div>
            <span className="text-[11px] font-bold text-slate-300 mt-2">Raw Water</span>
            <span className="text-[10px] text-slate-500">Pump P1</span>
          </div>

          {/* Animated Pipe Connector */}
          <div className="flex-1 h-1 bg-slate-800 relative overflow-hidden">
            {isRunning && <div className="absolute inset-0 bg-cyan-400/80 animate-pulse" />}
          </div>

          {/* Treatment Stage Cards */}
          {stages.map((stg) => {
            const isActive = stg.active;
            const isReq = stg.required;

            return (
              <React.Fragment key={stg.id}>
                <div
                  onClick={() => onToggleValve(stg.valveId)}
                  className={`cursor-pointer flex flex-col items-center text-center p-3 rounded-lg border transition-all w-32 ${
                    isActive
                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 mb-1">
                    <span>{stg.valveId}</span>
                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-cyan-400 animate-ping" : "bg-slate-700"}`} />
                  </div>

                  <span className="text-xs font-bold line-clamp-1">{stg.name}</span>
                  
                  <span className={`mt-2 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isReq ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-800 text-slate-500"
                  }`}>
                    {isReq ? "REQUIRED" : "OPTIONAL"}
                  </span>
                </div>

                <div className="flex-1 h-1 bg-slate-800 relative">
                  {isRunning && isActive && <div className="absolute inset-0 bg-cyan-400/80 animate-pulse" />}
                </div>
              </React.Fragment>
            );
          })}

          {/* Safe Water Output */}
          <div className="flex flex-col items-center text-center w-28">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs font-bold shadow-inner ${
              verificationResult?.passed
                ? "bg-emerald-950 border-emerald-500/60 text-emerald-400"
                : verificationResult?.passed === false
                ? "bg-rose-950 border-rose-500/60 text-rose-400"
                : "bg-slate-900 border-slate-700 text-slate-500"
            }`}>
              VERIFY
            </div>
            <span className="text-[11px] font-bold text-slate-300 mt-2">Post-Check</span>
            <span className="text-[10px] text-slate-500">Sensor Chamber</span>
          </div>
        </div>
      </div>

      {/* Post-Treatment Verification Result Box */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          verificationResult.passed
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
            : "bg-rose-950/40 border-rose-500/40 text-rose-300"
        }`}>
          <div className="flex items-start gap-3">
            {verificationResult.passed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                {verificationResult.passed ? "Treatment Verification Passed" : "Treatment Verification Failed"}
              </h4>
              <p className="text-xs mt-1 text-slate-300">{verificationResult.message}</p>
              <div className="flex items-center gap-4 mt-2 font-mono text-xs text-slate-300">
                <span>Final pH: <strong className="text-white">{verificationResult.finalPh}</strong></span>
                <span>Final TDS: <strong className="text-white">{verificationResult.finalTds} ppm</strong></span>
                <span>Turbidity: <strong className="text-white">{verificationResult.finalTurbidity} NTU</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Water Recovery Ratio (WRR):</span>
            <span className="text-lg font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded border border-cyan-800">
              {waterRecoveryRatio}%
            </span>

            {!verificationResult.passed && onRecirculate && (
              <button
                onClick={onRecirculate}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Initiate Recirculation Cycle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
