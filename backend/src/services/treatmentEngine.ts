import { WaterReadingInput } from "./anomalyEngine";

export interface TreatmentStageRecommendation {
  stageId: "sediment" | "carbon" | "media" | "ro" | "uv";
  stageName: string;
  required: boolean;
  reason: string;
  valveId: string; // V1 .. V5
}

export interface TreatmentRecommendationResult {
  stages: TreatmentStageRecommendation[];
  minimumTreatmentSummary: string;
  recommendedPumpSpeed: number; // % (e.g. 80%)
}

export interface PostTreatmentCheckResult {
  passed: boolean;
  finalPh: number;
  finalTds: number;
  finalTurbidity: number;
  message: string;
  recirculationRecommended: boolean;
}

export function recommendTreatment(reading: WaterReadingInput): TreatmentRecommendationResult {
  const stages: TreatmentStageRecommendation[] = [];

  // Stage 1: Sediment Filter
  const highTurbidity = reading.turbidity > 1.5;
  stages.push({
    stageId: "sediment",
    stageName: "Sediment Filtration (V1)",
    required: highTurbidity,
    reason: highTurbidity 
      ? `Turbidity (${reading.turbidity.toFixed(1)} NTU) exceeds pre-filter threshold (1.5 NTU).`
      : "Standard particulate clearance; raw turbidity is low.",
    valveId: "V1"
  });

  // Stage 2: Activated Carbon
  const highOrganicInd = reading.tds > 350 || Math.abs(reading.ph - 7.0) > 0.6;
  stages.push({
    stageId: "carbon",
    stageName: "Activated Carbon Filter (V2)",
    required: highOrganicInd,
    reason: highOrganicInd
      ? "Adsorption needed for potential organics, odor, or chemical residue indicator."
      : "Baseline adsorption; low organic signature.",
    valveId: "V2"
  });

  // Stage 3: Specialized Media Filter (Heavy Ion / Spec Media)
  const specMediaReq = reading.ec > 1000 || reading.ph < 6.0;
  stages.push({
    stageId: "media",
    stageName: "Specialized Ion-Exchange Media (V3)",
    required: specMediaReq,
    reason: specMediaReq
      ? "Conductivity (>1000 µS/cm) or low pH requires ion stabilization media."
      : "Ion media bypass recommended; conductivity within normal range.",
    valveId: "V3"
  });

  // Stage 4: Reverse Osmosis (RO)
  const highTdsRO = reading.tds > 500 || reading.ec > 900;
  stages.push({
    stageId: "ro",
    stageName: "Reverse Osmosis Membrane (V4)",
    required: highTdsRO,
    reason: highTdsRO
      ? `High dissolved solids (${reading.tds.toFixed(0)} ppm) requires RO desalinization membrane.`
      : "TDS is below 500 ppm; RO bypass active to optimize water recovery.",
    valveId: "V4"
  });

  // Stage 5: UV / Disinfection
  stages.push({
    stageId: "uv",
    stageName: "UV / Disinfection Chamber (V5)",
    required: true, // Always required for pathogen clearance
    reason: "Final bio-safety disinfection step (mandatory for all drinking streams).",
    valveId: "V5"
  });

  const activeCount = stages.filter(s => s.required).length;
  const minimumTreatmentSummary = `Adaptive matrix selected ${activeCount} of 5 treatment stages for optimal purification & energy recovery.`;

  return {
    stages,
    minimumTreatmentSummary,
    recommendedPumpSpeed: highTdsRO ? 90 : 70
  };
}

export function simulatePostTreatmentVerification(
  inputReading: WaterReadingInput,
  stagesActive: string[],
  attemptCount: number = 1
): PostTreatmentCheckResult {
  let ph = inputReading.ph;
  let tds = inputReading.tds;
  let turb = inputReading.turbidity;

  // Apply purification reduction for active stages
  if (stagesActive.includes("sediment") || stagesActive.includes("V1")) {
    turb = Math.max(0.2, turb * 0.15); // 85% turbidity reduction
  }
  if (stagesActive.includes("carbon") || stagesActive.includes("V2")) {
    ph = 7.0 + (ph - 7.0) * 0.4; // Stabilize pH
  }
  if (stagesActive.includes("ro") || stagesActive.includes("V4")) {
    tds = Math.max(45, tds * 0.12); // 88% TDS reduction
    turb = Math.max(0.1, turb * 0.5);
    ph = 7.0 + (ph - 7.0) * 0.2;
  }
  if (stagesActive.includes("media") || stagesActive.includes("V3")) {
    ph = 7.1;
  }

  // Second-chance attempt correction
  if (attemptCount > 1) {
    tds = Math.max(35, tds * 0.7);
    turb = Math.max(0.1, turb * 0.5);
    ph = 7.0;
  }

  const passed = ph >= 6.5 && ph <= 8.5 && tds <= 500 && turb <= 1.0;
  const message = passed 
    ? "Treatment verification successful. Treated water meets drinking water quality standards."
    : "Treatment verification failed. Parameters remain outside safe limits.";

  return {
    passed,
    finalPh: Number(ph.toFixed(2)),
    finalTds: Number(tds.toFixed(0)),
    finalTurbidity: Number(turb.toFixed(2)),
    message,
    recirculationRecommended: !passed
  };
}

export function calculateWaterRecovery(
  rawInputL: number,
  isRoActive: boolean,
  recirculationCycles: number
): { treatedL: number; recoveredL: number; rejectedL: number; recoveryRatioPct: number } {
  // Standard recovery: Without RO: 96%, With RO: 85% single pass, with recirculation: 91.6%
  let baseRatio = isRoActive ? 0.85 : 0.96;
  if (isRoActive && recirculationCycles > 0) {
    baseRatio = 0.916; // 91.6% recovery on second chance recirculation
  }

  const recoveredL = Math.round(rawInputL * baseRatio * 10) / 10;
  const rejectedL = Math.round((rawInputL - recoveredL) * 10) / 10;
  const ratioPct = Math.round((recoveredL / rawInputL) * 1000) / 10;

  return {
    treatedL: rawInputL,
    recoveredL,
    rejectedL,
    recoveryRatioPct: ratioPct
  };
}
