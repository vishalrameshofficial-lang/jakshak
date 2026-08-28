import { WaterReadingInput, BaselineStats, analyzeReading } from "./anomalyEngine";

export interface RiskFactor {
  parameter: string;
  points: number;
  reason: string;
}

export interface WaterRiskResult {
  riskScore: number; // 0-100
  classification: "SAFE" | "WATCH" | "WARNING" | "CRITICAL";
  riskFactors: RiskFactor[];
  summaryMessage: string;
}

export function calculateWaterRisk(reading: WaterReadingInput, baseline: BaselineStats): WaterRiskResult {
  const anomalyRes = analyzeReading(reading, baseline);
  const factors: RiskFactor[] = [];
  let score = 5; // Base minimum baseline risk

  // 1. pH deviation factor
  if (reading.ph < 6.5 || reading.ph > 8.5) {
    const phDiff = reading.ph < 6.5 ? 6.5 - reading.ph : reading.ph - 8.5;
    const points = Math.min(30, Math.round(phDiff * 20));
    score += points;
    factors.push({
      parameter: "pH Limit",
      points,
      reason: `pH value ${reading.ph.toFixed(2)} outside safe range (6.5 - 8.5)`
    });
  } else if (Math.abs(anomalyRes.zScores.ph) >= 2.0) {
    const points = Math.round(Math.abs(anomalyRes.zScores.ph) * 5);
    score += points;
    factors.push({
      parameter: "pH Baseline Shift",
      points,
      reason: `pH shifted by ${anomalyRes.deviations.phPercent.toFixed(1)}% relative to source fingerprint`
    });
  }

  // 2. TDS factor
  if (reading.tds > 500) {
    const points = Math.min(35, Math.round(((reading.tds - 500) / 500) * 25));
    score += points;
    factors.push({
      parameter: "TDS Threshold",
      points,
      reason: `TDS at ${reading.tds.toFixed(0)} ppm exceeds desirable limit (500 ppm)`
    });
  } else if (anomalyRes.zScores.tds >= 2.0) {
    const points = Math.round(anomalyRes.zScores.tds * 5);
    score += points;
    factors.push({
      parameter: "TDS Deviation",
      points,
      reason: `TDS is ${anomalyRes.deviations.tdsPercent.toFixed(1)}% above local baseline`
    });
  }

  // 3. Turbidity factor
  if (reading.turbidity > 1.0) {
    const points = Math.min(25, Math.round((reading.turbidity - 1.0) * 8));
    score += points;
    factors.push({
      parameter: "Turbidity Elevation",
      points,
      reason: `Turbidity of ${reading.turbidity.toFixed(1)} NTU exceeds standard 1.0 NTU baseline`
    });
  }

  // 4. Anomaly score boost
  if (anomalyRes.eventTypes.includes("MULTI_PARAMETER_ANOMALY")) {
    score += 25;
    factors.push({
      parameter: "Multi-Parameter Correlation",
      points: 25,
      reason: "Simultaneous deviation across pH, TDS, EC, and Turbidity signatures"
    });
  }

  // Cap risk score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  let classification: "SAFE" | "WATCH" | "WARNING" | "CRITICAL";
  if (finalScore <= 24) {
    classification = "SAFE";
  } else if (finalScore <= 49) {
    classification = "WATCH";
  } else if (finalScore <= 74) {
    classification = "WARNING";
  } else {
    classification = "CRITICAL";
  }

  let summaryMessage = "";
  if (classification === "SAFE") {
    summaryMessage = "Water quality parameters are within normal baseline limits.";
  } else if (classification === "WATCH") {
    summaryMessage = "Minor parameter shifts observed; active monitoring recommended.";
  } else if (classification === "WARNING") {
    summaryMessage = "Moderate water anomaly signature detected. Pre-treatment required.";
  } else {
    summaryMessage = "Potential contamination signature detected — confirmatory laboratory testing recommended.";
  }

  return {
    riskScore: finalScore,
    classification,
    riskFactors: factors,
    summaryMessage
  };
}
