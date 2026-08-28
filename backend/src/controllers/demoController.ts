import { Request, Response } from "express";
import { setDemoScenario, getDemoScenario, DemoScenario } from "../services/simulatorService";
import { PrismaClient } from "@prisma/client";
import { generateNextReading } from "../services/simulatorService";
import { analyzeReading } from "../services/anomalyEngine";
import { calculateWaterRisk } from "../services/riskEngine";
import { broadcastSensorUpdate, broadcastScenarioChange } from "../websocket";

const prisma = new PrismaClient();

export async function setScenario(req: Request, res: Response) {
  try {
    const { scenario } = req.body as { scenario: DemoScenario };
    if (!scenario) {
      return res.status(400).json({ success: false, error: "Missing scenario parameter" });
    }

    setDemoScenario(scenario);

    // Apply scenario changes immediately to "Mine Zone Borewell B" (KA-014) or "Mine Zone Borewell A" (KA-015)
    const targetSource = await prisma.waterSource.findFirst({
      where: { code: "KA-014" },
      include: { baseline: true }
    });

    if (targetSource && targetSource.baseline) {
      const readingInput = generateNextReading(targetSource.id, targetSource.baseline);
      const anomalyRes = analyzeReading(readingInput, targetSource.baseline);
      const riskRes = calculateWaterRisk(readingInput, targetSource.baseline);

      let newStatus: string = "SAFE";
      if (riskRes.classification === "WATCH") newStatus = "WATCH";
      if (riskRes.classification === "WARNING") newStatus = "WARNING";
      if (riskRes.classification === "CRITICAL") newStatus = "CRITICAL";
      if (scenario === "DEVICE_OFFLINE") newStatus = "OFFLINE";

      // Update source
      await prisma.waterSource.update({
        where: { id: targetSource.id },
        data: {
          status: newStatus,
          currentRiskScore: riskRes.riskScore,
          lastUpdate: new Date()
        }
      });

      // Save reading
      const savedReading = await prisma.sensorReading.create({
        data: {
          sourceId: targetSource.id,
          timestamp: new Date(),
          ph: readingInput.ph,
          tds: readingInput.tds,
          ec: readingInput.ec,
          turbidity: readingInput.turbidity,
          temperature: readingInput.temperature,
          flowRate: readingInput.flowRate,
          waterLevel: readingInput.waterLevel,
          riskScore: riskRes.riskScore,
          anomalyScore: anomalyRes.anomalyScore,
          isAnomaly: anomalyRes.isAnomaly
        }
      });

      // Broadcast scenario update to frontends
      broadcastScenarioChange(scenario);
      broadcastSensorUpdate({
        sourceId: targetSource.id,
        sourceCode: targetSource.code,
        reading: savedReading,
        risk: riskRes,
        anomaly: anomalyRes
      });
    }

    res.json({ success: true, activeScenario: getDemoScenario(), message: `Demo scenario updated to '${scenario}'` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function getScenario(req: Request, res: Response) {
  res.json({ success: true, activeScenario: getDemoScenario() });
}
