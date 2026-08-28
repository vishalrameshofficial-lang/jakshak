import { WaterReadingInput, BaselineStats } from "./anomalyEngine";

export type DemoScenario = 
  | "NORMAL"
  | "HIGH_TURBIDITY"
  | "HIGH_TDS"
  | "CONTAMINATION_EVENT"
  | "TREATMENT_FAILURE"
  | "FILTER_DEGRADATION"
  | "DEVICE_OFFLINE";

export interface SimulatedState {
  currentScenario: DemoScenario;
  targetReadings: Record<string, WaterReadingInput>;
  currentReadings: Record<string, WaterReadingInput>;
  stepIndex: number;
}

// In-memory simulator state store
const activeScenario: { mode: DemoScenario; progress: number } = {
  mode: "NORMAL",
  progress: 0
};

export function setDemoScenario(scenario: DemoScenario) {
  activeScenario.mode = scenario;
  activeScenario.progress = 0;
}

export function getDemoScenario(): DemoScenario {
  return activeScenario.mode;
}

export function generateNextReading(
  sourceId: string,
  baseline: BaselineStats,
  previousReading?: WaterReadingInput
): WaterReadingInput {
  const mode = activeScenario.mode;
  activeScenario.progress = Math.min(1.0, activeScenario.progress + 0.1);
  const p = activeScenario.progress;

  let basePh = baseline.phMean;
  let baseTds = baseline.tdsMean;
  let baseEc = baseline.ecMean;
  let baseTurb = baseline.turbidityMean;
  let baseTemp = baseline.tempMean;

  if (mode === "NORMAL") {
    // Slight random walk around baseline
    const noisePh = (Math.random() - 0.5) * 0.08;
    const noiseTds = (Math.random() - 0.5) * 6.0;
    const noiseEc = (Math.random() - 0.5) * 10.0;
    const noiseTurb = (Math.random() - 0.5) * 0.05;

    return {
      ph: Number((basePh + noisePh).toFixed(2)),
      tds: Number((baseTds + noiseTds).toFixed(0)),
      ec: Number((baseEc + noiseEc).toFixed(0)),
      turbidity: Number((Math.max(0.4, baseTurb + noiseTurb)).toFixed(2)),
      temperature: Number((baseTemp + (Math.random() - 0.5) * 0.2).toFixed(1)),
      flowRate: Number((3.5 + (Math.random() - 0.5) * 0.2).toFixed(1)),
      waterLevel: Number((78.0 + (Math.random() - 0.5) * 0.5).toFixed(1))
    };
  }

  if (mode === "HIGH_TURBIDITY") {
    // Turbidity rises significantly up to 8.5 NTU
    const targetTurb = 8.5;
    const currTurb = previousReading ? previousReading.turbidity : baseTurb;
    const nextTurb = currTurb + (targetTurb - currTurb) * 0.2;

    return {
      ph: Number((basePh + (Math.random() - 0.5) * 0.1).toFixed(2)),
      tds: Number((baseTds + (Math.random() - 0.5) * 8.0).toFixed(0)),
      ec: Number((baseEc + (Math.random() - 0.5) * 12.0).toFixed(0)),
      turbidity: Number((Math.min(9.5, nextTurb)).toFixed(2)),
      temperature: Number((baseTemp + 0.2).toFixed(1)),
      flowRate: 3.2,
      waterLevel: 75.0
    };
  }

  if (mode === "HIGH_TDS") {
    // TDS and EC rise together up to 1250 ppm and 1950 uS/cm
    const targetTds = 1250;
    const targetEc = 1950;
    const currTds = previousReading ? previousReading.tds : baseTds;
    const currEc = previousReading ? previousReading.ec : baseEc;

    return {
      ph: Number((basePh - 0.3 * p).toFixed(2)),
      tds: Number((currTds + (targetTds - currTds) * 0.25).toFixed(0)),
      ec: Number((currEc + (targetEc - currEc) * 0.25).toFixed(0)),
      turbidity: Number((baseTurb + 0.5 * p).toFixed(2)),
      temperature: Number((baseTemp + 0.4).toFixed(1)),
      flowRate: 3.0,
      waterLevel: 72.0
    };
  }

  if (mode === "CONTAMINATION_EVENT") {
    // pH drops rapidly to 5.4, TDS jumps to 1480 ppm, EC jumps to 2300 uS/cm, Turbidity jumps to 6.8 NTU
    const targetPh = 5.4;
    const targetTds = 1480;
    const targetEc = 2300;
    const targetTurb = 6.8;

    const prevPh = previousReading ? previousReading.ph : basePh;
    const prevTds = previousReading ? previousReading.tds : baseTds;
    const prevEc = previousReading ? previousReading.ec : baseEc;
    const prevTurb = previousReading ? previousReading.turbidity : baseTurb;

    return {
      ph: Number((prevPh + (targetPh - prevPh) * 0.3).toFixed(2)),
      tds: Number((prevTds + (targetTds - prevTds) * 0.3).toFixed(0)),
      ec: Number((prevEc + (targetEc - prevEc) * 0.3).toFixed(0)),
      turbidity: Number((prevTurb + (targetTurb - prevTurb) * 0.3).toFixed(2)),
      temperature: Number((baseTemp + 0.8 * p).toFixed(1)),
      flowRate: 2.8,
      waterLevel: 68.0
    };
  }

  if (mode === "TREATMENT_FAILURE") {
    // Extreme TDS 1850 ppm & pH 4.8 that causes treatment verification failure on single pass
    return {
      ph: 4.8,
      tds: 1850,
      ec: 2850,
      turbidity: 9.2,
      temperature: 28.5,
      flowRate: 2.4,
      waterLevel: 65.0
    };
  }

  if (mode === "FILTER_DEGRADATION") {
    // High turbidity continuous exposure
    return {
      ph: 6.8,
      tds: 580,
      ec: 890,
      turbidity: 4.5,
      temperature: 27.0,
      flowRate: 2.1, // Reduced flow rate due to clogged filter
      waterLevel: 70.0
    };
  }

  if (mode === "DEVICE_OFFLINE") {
    // Last cached reading before offline drop
    return {
      ph: basePh,
      tds: baseTds,
      ec: baseEc,
      turbidity: baseTurb,
      temperature: baseTemp,
      flowRate: 0.0,
      waterLevel: 75.0
    };
  }

  return {
    ph: basePh,
    tds: baseTds,
    ec: baseEc,
    turbidity: baseTurb,
    temperature: baseTemp,
    flowRate: 3.5,
    waterLevel: 75.0
  };
}
