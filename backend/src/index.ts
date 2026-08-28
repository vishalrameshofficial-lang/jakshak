import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { initWebSocketServer, broadcastSensorUpdate } from "./websocket";
import { PrismaClient } from "@prisma/client";
type SourceStatus = string;
import { generateNextReading } from "./services/simulatorService";
import { analyzeReading } from "./services/anomalyEngine";
import { calculateWaterRisk } from "./services/riskEngine";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://jakshak-git-main-imperium15.vercel.app",
    "https://jakshak.vercel.app",
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", platform: "JAL-RAKSHAK Smart Water Intelligence Platform", version: "1.0.0-sih" });
});

const server = http.createServer(app);
initWebSocketServer(server);

const prisma = new PrismaClient();

// Background Demo Mode Simulation Interval (generates realistic gradual updates every 3 seconds)
setInterval(async () => {
  try {
    const activeSources = await prisma.waterSource.findMany({
      take: 5,
      include: {
        baseline: true,
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    for (const source of activeSources) {
      if (!source.baseline) continue;

      const prevReading = source.readings[0] ? {
        ph: source.readings[0].ph,
        tds: source.readings[0].tds,
        ec: source.readings[0].ec,
        turbidity: source.readings[0].turbidity,
        temperature: source.readings[0].temperature,
        flowRate: source.readings[0].flowRate,
        waterLevel: source.readings[0].waterLevel
      } : undefined;

      const nextReading = generateNextReading(source.id, source.baseline, prevReading);
      const anomalyRes = analyzeReading(nextReading, source.baseline);
      const riskRes = calculateWaterRisk(nextReading, source.baseline);

      let newStatus: string = "SAFE";
      if (riskRes.classification === "WATCH") newStatus = "WATCH";
      if (riskRes.classification === "WARNING") newStatus = "WARNING";
      if (riskRes.classification === "CRITICAL") newStatus = "CRITICAL";

      // Update source
      await prisma.waterSource.update({
        where: { id: source.id },
        data: {
          status: newStatus,
          currentRiskScore: riskRes.riskScore,
          lastUpdate: new Date()
        }
      });

      // Save reading
      const savedReading = await prisma.sensorReading.create({
        data: {
          sourceId: source.id,
          timestamp: new Date(),
          ph: nextReading.ph,
          tds: nextReading.tds,
          ec: nextReading.ec,
          turbidity: nextReading.turbidity,
          temperature: nextReading.temperature,
          flowRate: nextReading.flowRate,
          waterLevel: nextReading.waterLevel,
          riskScore: riskRes.riskScore,
          anomalyScore: anomalyRes.anomalyScore,
          isAnomaly: anomalyRes.isAnomaly
        }
      });

      // Broadcast live telemetry
      broadcastSensorUpdate({
        sourceId: source.id,
        sourceCode: source.code,
        reading: savedReading,
        risk: riskRes,
        anomaly: anomalyRes
      });
    }
  } catch (err) {
    // Ignore background loop error during seed or startup
  }
}, 3000);

server.listen(PORT, () => {
  console.log(`🚀 JAL-RAKSHAK Server listening on http://localhost:${PORT}`);
  console.log(`🔌 Live WebSocket Server active on ws://localhost:${PORT}/ws`);
});
