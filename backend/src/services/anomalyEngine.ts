export interface WaterReadingInput {
  ph: number;
  tds: number;
  ec: number;
  turbidity: number;
  temperature: number;
  flowRate?: number;
  waterLevel?: number;
}

export interface BaselineStats {
  phMean: number;
  phStd: number;
  tdsMean: number;
  tdsStd: number;
  ecMean: number;
  ecStd: number;
  turbidityMean: number;
  turbidityStd: number;
  tempMean: number;
  tempStd: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  anomalyScore: number;
  zScores: {
    ph: number;
    tds: number;
    ec: number;
    turbidity: number;
    temperature: number;
  };
  deviations: {
    phPercent: number;
    tdsPercent: number;
    ecPercent: number;
    turbidityPercent: number;
    tempPercent: number;
  };
  eventTypes: string[];
  isSensorFault: boolean;
  explanation: string[];
}

export function calculateZScore(value: number, mean: number, std: number): number {
  if (std <= 0.0001) return 0;
  return (value - mean) / std;
}

export function analyzeReading(reading: WaterReadingInput, baseline: BaselineStats): AnomalyResult {
  // Safe zero-handling for stddev
  const phStd = Math.max(baseline.phStd, 0.05);
  const tdsStd = Math.max(baseline.tdsStd, 5.0);
  const ecStd = Math.max(baseline.ecStd, 8.0);
  const turbStd = Math.max(baseline.turbidityStd, 0.05);
  const tempStd = Math.max(baseline.tempStd, 0.2);

  const zPh = calculateZScore(reading.ph, baseline.phMean, phStd);
  const zTds = calculateZScore(reading.tds, baseline.tdsMean, tdsStd);
  const zEc = calculateZScore(reading.ec, baseline.ecMean, ecStd);
  const zTurb = calculateZScore(reading.turbidity, baseline.turbidityMean, turbStd);
  const zTemp = calculateZScore(reading.temperature, baseline.tempMean, tempStd);

  const devPhPct = baseline.phMean !== 0 ? ((reading.ph - baseline.phMean) / baseline.phMean) * 100 : 0;
  const devTdsPct = baseline.tdsMean !== 0 ? ((reading.tds - baseline.tdsMean) / baseline.tdsMean) * 100 : 0;
  const devEcPct = baseline.ecMean !== 0 ? ((reading.ec - baseline.ecMean) / baseline.ecMean) * 100 : 0;
  const devTurbPct = baseline.turbidityMean !== 0 ? ((reading.turbidity - baseline.turbidityMean) / baseline.turbidityMean) * 100 : 0;
  const devTempPct = baseline.tempMean !== 0 ? ((reading.temperature - baseline.tempMean) / baseline.tempMean) * 100 : 0;

  // Weighted anomaly calculation
  // pH weight: 0.25, TDS: 0.25, EC: 0.2, Turbidity: 0.2, Temp: 0.1
  const weightedZ = 0.25 * Math.abs(zPh) + 0.25 * Math.abs(zTds) + 0.20 * Math.abs(zEc) + 0.20 * Math.abs(zTurb) + 0.10 * Math.abs(zTemp);
  const anomalyScore = Math.min(100, Math.round(weightedZ * 20));

  const eventTypes: string[] = [];
  const explanation: string[] = [];

  // Check for basic sensor fault (impossible values or static unphysical ranges)
  let isSensorFault = false;
  if (reading.ph < 0 || reading.ph > 14 || reading.tds < 0 || reading.turbidity < 0) {
    isSensorFault = true;
    eventTypes.push("SENSOR_FAULT");
    explanation.push("Physical out-of-range sensor output detected (potential calibration failure).");
  }

  // Detect specific signature events
  if (Math.abs(zPh) >= 2.5) {
    eventTypes.push("SUDDEN_PH_CHANGE");
    explanation.push(`pH deviated by ${devPhPct >= 0 ? "+" : ""}${devPhPct.toFixed(1)}% (${zPh.toFixed(1)} Z-score).`);
  }
  if (zTds >= 2.5) {
    eventTypes.push("HIGH_TDS");
    explanation.push(`TDS is ${devTdsPct >= 0 ? "+" : ""}${devTdsPct.toFixed(1)}% above baseline.`);
  }
  if (zTurb >= 2.5) {
    eventTypes.push("HIGH_TURBIDITY");
    explanation.push(`Turbidity elevated by ${devTurbPct.toFixed(1)}% above baseline standard.`);
  }
  if (zEc >= 2.5) {
    eventTypes.push("HIGH_EC");
    explanation.push(`Electrical conductivity elevated by ${devEcPct.toFixed(1)}%.`);
  }

  // Multi-parameter anomaly detection rule
  const highZCount = [Math.abs(zPh), Math.abs(zTds), Math.abs(zEc), Math.abs(zTurb)].filter(z => z >= 2.0).length;
  if (highZCount >= 3) {
    eventTypes.push("MULTI_PARAMETER_ANOMALY");
    explanation.unshift("Correlated multi-parameter water signature anomaly detected across pH, TDS, EC, and Turbidity.");
  }

  const isAnomaly = anomalyScore >= 35 || eventTypes.length > 0;

  return {
    isAnomaly,
    anomalyScore,
    zScores: {
      ph: zPh,
      tds: zTds,
      ec: zEc,
      turbidity: zTurb,
      temperature: zTemp
    },
    deviations: {
      phPercent: devPhPct,
      tdsPercent: devTdsPct,
      ecPercent: devEcPct,
      turbidityPercent: devTurbPct,
      tempPercent: devTempPct
    },
    eventTypes,
    isSensorFault,
    explanation
  };
}
