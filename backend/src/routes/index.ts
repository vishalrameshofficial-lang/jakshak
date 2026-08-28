import { Router } from "express";
import * as sources from "../controllers/sourceController";
import * as ingestion from "../controllers/ingestionController";
import * as treatment from "../controllers/treatmentController";
import * as alerts from "../controllers/alertController";
import * as demo from "../controllers/demoController";
import * as filters from "../controllers/filterController";
import * as lab from "../controllers/labController";
import * as devices from "../controllers/deviceController";
import * as auth from "../controllers/authController";
import * as admin from "../controllers/adminController";

const router = Router();

// Auth routes
router.post("/auth/login", auth.login);
router.get("/auth/me", auth.getCurrentUser);

// Water Source routes
router.get("/sources", sources.getAllSources);
router.get("/sources/:id", sources.getSourceById);
router.get("/sources/:id/readings", sources.getSourceReadings);
router.get("/sources/:id/fingerprint", sources.getSourceFingerprint);
router.get("/sources/:id/risk", sources.getSourceRisk);

// Sensor telemetry ingestion (ESP32 compatible)
router.post("/readings", ingestion.ingestSensorReading);

// Adaptive treatment & verification routes
router.get("/treatment/:sourceId", treatment.getTreatmentStatus);
router.post("/treatment/start", treatment.startTreatment);
router.post("/treatment/stop", treatment.stopTreatment);
router.post("/treatment/emergency-stop", treatment.emergencyStop);
router.post("/treatment/verify", treatment.verifyPostTreatment);

// Alert center routes
router.get("/alerts", alerts.getAlerts);
router.post("/alerts/:id/acknowledge", alerts.acknowledgeAlert);
router.post("/alerts/:id/resolve", alerts.resolveAlert);

// Demo scenario routes
router.post("/demo/scenario", demo.setScenario);
router.get("/demo/scenario", demo.getScenario);

// Filter management routes
router.get("/filters", filters.getFilters);
router.post("/filters/update", filters.updateFilter);

// Lab verification & ground truth routes
router.get("/lab/samples", lab.getLabSamples);
router.post("/lab/samples", lab.createLabSample);
router.post("/lab/results", lab.addLabResult);

// Device management & sensor health routes
router.get("/devices", devices.getDevices);
router.post("/devices/heartbeat", devices.deviceHeartbeat);
router.post("/devices/calibrate", devices.calibrateSensor);

// Admin routes
router.get("/admin/audit-logs", admin.getAuditLogs);
router.get("/admin/thresholds", admin.getThresholds);
router.put("/admin/thresholds/:id", admin.updateThreshold);

export default router;
