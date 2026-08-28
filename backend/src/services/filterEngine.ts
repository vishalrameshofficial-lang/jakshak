export interface FilterStatusUpdate {
  stageName: string;
  healthPercent: number;
  volumeProcessedL: number;
  turbidityExposure: number;
  runtimeHours: number;
  estimatedRulDays: number;
  status: "GOOD" | "SERVICE_SOON" | "REPLACE_NOW";
}

export function updateFilterHealth(
  currentHealth: number,
  volumeProcessedL: number,
  addedVolumeL: number,
  avgTurbidity: number,
  addedHours: number,
  stageName: string
): FilterStatusUpdate {
  // Usage degradation factors:
  // Base lifespan capacity (L): Sediment = 10,000L, Carbon = 15,000L, Media = 20,000L, RO = 25,000L, UV = 50,000L (or 3,000 hrs)
  let maxCapacityL = 15000;
  if (stageName.toLowerCase().includes("sediment")) maxCapacityL = 10000;
  if (stageName.toLowerCase().includes("carbon")) maxCapacityL = 15000;
  if (stageName.toLowerCase().includes("media")) maxCapacityL = 20000;
  if (stageName.toLowerCase().includes("ro")) maxCapacityL = 25000;
  if (stageName.toLowerCase().includes("uv")) maxCapacityL = 40000;

  const newVolume = volumeProcessedL + addedVolumeL;
  const newHours = addedHours;
  const newTurbidityExp = avgTurbidity;

  // Turbidity penalty for sediment/carbon filters
  const turbMultiplier = avgTurbidity > 2.0 ? 1.5 : 1.0;
  const healthLossPct = ((addedVolumeL * turbMultiplier) / maxCapacityL) * 100;
  const newHealth = Math.max(0, Math.min(100, currentHealth - healthLossPct));

  // Predictive RUL calculation (estimated remaining useful life in days)
  // Assuming average daily consumption of 150L per source node
  const remainingL = (newHealth / 100) * maxCapacityL;
  const estimatedRulDays = Math.max(0, Math.round(remainingL / 150));

  let status: "GOOD" | "SERVICE_SOON" | "REPLACE_NOW" = "GOOD";
  if (newHealth <= 20) {
    status = "REPLACE_NOW";
  } else if (newHealth <= 45) {
    status = "SERVICE_SOON";
  }

  return {
    stageName,
    healthPercent: Math.round(newHealth * 10) / 10,
    volumeProcessedL: Math.round(newVolume),
    turbidityExposure: Math.round(newTurbidityExp * 10) / 10,
    runtimeHours: Math.round(newHours * 10) / 10,
    estimatedRulDays,
    status
  };
}
