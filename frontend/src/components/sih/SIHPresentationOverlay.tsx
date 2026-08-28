import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Award, Play, RotateCcw, X } from "lucide-react";
import { useDemo } from "../../context/DemoContext";
import api from "../../services/api";

export const SIHPresentationOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setScenario, setPresentationModeActive, refreshSources } = useDemo();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      title: "Step 1: Baseline Water Source Selection",
      description: "Select 'Mine Zone Borewell B' (Code KA-014). Initial baseline status is SAFE (Water Risk Score: 21/100).",
      actionText: "Initialize Baseline Source",
      action: async () => {
        setIsBusy(true);
        await setScenario("NORMAL");
        setIsBusy(false);
      }
    },
    {
      step: 2,
      title: "Step 2: Simulate Mining Runoff Contamination Event",
      description: "Trigger a multi-parameter runoff anomaly in the catchment area. Sensor telemetry begins gradual parameter shift.",
      actionText: "Trigger Contamination Event",
      action: async () => {
        setIsBusy(true);
        await setScenario("CONTAMINATION_EVENT");
        setIsBusy(false);
      }
    },
    {
      step: 3,
      title: "Step 3: Real-Time Anomaly & Fingerprint Shift",
      description: "Sensors report pH dropping (7.1 → 5.4), TDS rising (420 → 1480 ppm), EC spiking (650 → 2300 µS/cm), and Turbidity climbing (1.1 → 6.8 NTU).",
      actionText: "Observe Telemetry Shift",
      action: async () => {
        await refreshSources();
      }
    },
    {
      step: 4,
      title: "Step 4: Explainable Water Risk Score Escalation",
      description: "JAL-RAKSHAK risk engine dynamically recalculates Risk Score: 21 → 43 → 68 → 82 (CRITICAL).",
      actionText: "Compute Risk Breakdown",
      action: async () => {}
    },
    {
      step: 5,
      title: "Step 5: Smart Alert Center Priority Dispatch",
      description: "Critical alert generated: 'Potential contamination signature detected — confirmatory lab testing recommended.' Priority score: 94/100.",
      actionText: "View Priority Alert",
      action: async () => {}
    },
    {
      step: 6,
      title: "Step 6: Adaptive Treatment Matrix Recommendation",
      description: "Adaptive matrix selects minimum required stages: Sediment (V1) + Carbon (V2) + RO (V4) + UV (V5). Bypass unused media to optimize energy.",
      actionText: "Compute Treatment Matrix",
      action: async () => {}
    },
    {
      step: 7,
      title: "Step 7: Start Purification Control Execution",
      description: "Operator initiates treatment pipeline. Raw water pump P1 and treatment booster P2 spin up.",
      actionText: "Start Purification Valves",
      action: async () => {
        setIsBusy(true);
        await api.post("/treatment/start", { sourceId: "ka-014-id", inputVolumeL: 1000 });
        setIsBusy(false);
      }
    },
    {
      step: 8,
      title: "Step 8: Post-Treatment Verification Attempt 1 (FAIL)",
      description: "First verification attempt post-treatment detects residual dissolved solids due to extreme initial raw TDS.",
      actionText: "Run Post-Check 1 (Simulate Fail)",
      action: async () => {
        setIsBusy(true);
        await api.post("/treatment/verify", { sourceId: "ka-014-id", forceFailure: true });
        setIsBusy(false);
      }
    },
    {
      step: 9,
      title: "Step 9: Second-Chance Recirculation Loop",
      description: "System recommends second-chance recirculation cycle rather than discarding rejected volume.",
      actionText: "Trigger Recirculation Loop",
      action: async () => {}
    },
    {
      step: 10,
      title: "Step 10: Final Verification PASS & 91.6% Water Recovery",
      description: "Second treatment pass verification succeeds! Water Recovery Ratio achieves 91.6% usable drinking water output.",
      actionText: "Verify Final PASS",
      action: async () => {
        setIsBusy(true);
        await api.post("/treatment/verify", { sourceId: "ka-014-id", attemptCount: 2 });
        setIsBusy(false);
      }
    },
    {
      step: 11,
      title: "Step 11: Predictive Filter Life Update",
      description: "Filter health engine updates degradation based on 1,000L processed under high turbidity exposure. Sediment filter health: 86%.",
      actionText: "Update Filter Health",
      action: async () => {}
    },
    {
      step: 12,
      title: "Step 12: Regional Contamination Map Neutralization",
      description: "Source status returns to SAFE as treated water quality stabilizes. Regional risk map marker updates from RED → YELLOW → GREEN.",
      actionText: "Complete SIH Story Walkthrough",
      action: async () => {
        setIsBusy(true);
        await setScenario("NORMAL");
        setIsBusy(false);
      }
    }
  ];

  const activeStep = steps.find((s) => s.step === currentStep) || steps[0];

  const handleNext = async () => {
    if (activeStep.action) {
      await activeStep.action();
    }
    if (currentStep < 12) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setPresentationModeActive(false);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Smart India Hackathon Presentation Mode</h3>
            <p className="text-xs text-cyan-400 font-mono">12-Step Guided Prototype Demonstrator</p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Progress: Step {currentStep} of 12</span>
            <span>{Math.round((currentStep / 12) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / 12) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card Content */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-base font-bold text-cyan-300">{activeStep.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{activeStep.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || isBusy}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setCurrentStep(1);
                await setScenario("NORMAL");
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>

            <button
              onClick={handleNext}
              disabled={isBusy}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-cyan-600/20"
            >
              {isBusy ? "Executing..." : activeStep.actionText}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
