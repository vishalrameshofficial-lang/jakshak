export type Role = "ADMIN" | "OPERATOR" | "VIEWER";
export type SourceStatus = "SAFE" | "WATCH" | "WARNING" | "CRITICAL" | "OFFLINE";
export type SourceType = "BOREWELL" | "COMMUNITY_TANK" | "WELL" | "RIVER";
export type Severity = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type FilterStatus = "GOOD" | "SERVICE_SOON" | "REPLACE_NOW";
export type DeviceStatus = "ONLINE" | "DEGRADED" | "OFFLINE" | "SENSOR_ERROR";

export type DemoScenario = 
  | "NORMAL"
  | "HIGH_TURBIDITY"
  | "HIGH_TDS"
  | "CONTAMINATION_EVENT"
  | "TREATMENT_FAILURE"
  | "FILTER_DEGRADATION"
  | "DEVICE_OFFLINE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface WaterBaseline {
  id: string;
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
  sampleCount: number;
}

export interface SensorReading {
  id: string;
  sourceId: string;
  timestamp: string;
  ph: number;
  tds: number;
  ec: number;
  turbidity: number;
  temperature: number;
  flowRate: number;
  waterLevel: number;
  riskScore: number;
  anomalyScore: number;
  isAnomaly: boolean;
}

export interface WaterSource {
  id: string;
  code: string;
  name: string;
  village: string;
  district: string;
  state: string;
  type: SourceType;
  isMiningAffected: boolean;
  latitude: number;
  longitude: number;
  status: SourceStatus;
  currentRiskScore: number;
  lastUpdate: string;
  baseline?: WaterBaseline;
  readings?: SensorReading[];
  filters?: FilterState[];
  device?: Device;
}

export interface AnomalyEvent {
  id: string;
  sourceId: string;
  source?: {
    id: string;
    code: string;
    name: string;
    village: string;
    currentRiskScore: number;
  };
  timestamp: string;
  eventType: string;
  severity: Severity;
  priorityScore: number;
  title: string;
  message: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  resolvedAt?: string;
  detailsJson?: string;
}

export interface FilterState {
  id: string;
  sourceId: string;
  source?: {
    id: string;
    code: string;
    name: string;
    village: string;
  };
  stageName: string;
  healthPercent: number;
  volumeProcessedL: number;
  turbidityExposure: number;
  runtimeHours: number;
  estimatedRulDays: number;
  status: FilterStatus;
}

export interface LabSample {
  id: string;
  sampleCode: string;
  sourceId: string;
  source?: {
    id: string;
    code: string;
    name: string;
    village: string;
  };
  collectionDate: string;
  collectedBy: string;
  reason: string;
  status: "PENDING" | "VERIFIED";
  verifiedAt?: string;
  result?: LabResult;
}

export interface LabResult {
  id: string;
  sampleId: string;
  ph: number;
  tds: number;
  turbidity: number;
  iron?: number;
  manganese?: number;
  fluoride?: number;
  arsenic?: number;
  lead?: number;
  nitrate?: number;
  testNotes?: string;
  calibrationUsed: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  deviceCode: string;
  sourceId: string;
  source?: {
    id: string;
    code: string;
    name: string;
    village: string;
  };
  firmwareVersion: string;
  batteryLevel: number;
  signalStrength: number;
  status: DeviceStatus;
  lastHeartbeat: string;
  sensors?: {
    id: string;
    sensorType: string;
    status: "GOOD" | "WARNING" | "FAULT";
    message: string;
  }[];
}
