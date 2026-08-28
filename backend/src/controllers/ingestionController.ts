import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { analyzeReading } from "../services/anomalyEngine";
import { calculateWaterRisk } from "../services/riskEngine";
import { broadcastSensorUpdate } from "../websocket";

const prisma = new PrismaClient();

export async function ingestSensorReading(req: Request, res: Response) {
  try {
    const { deviceId, timestamp, pH, tds, ec, turbidity, temperature, flowRate, waterLevel } = req.body;

    if (!deviceId || pH === undefined || tds === undefined) {
      return res.status(400).json({ success: false, error: "Missing required payload parameters (deviceId, pH, tds)" });
    }

    // Locate device & water source
    const device = await prisma.device.findUnique({
      where: { deviceCode: deviceId },
      include: { source: { include: { baseline: true } } }
    });

    if (!device || !device.source) {
      return res.status(404).json({ success: false, error: `Device '${deviceId}' not registered` });
    }

    const source = device.source;
    const baseline = source.baseline || {
      phMean: 7.1, phStd: 0.2, tdsMean: 450.0, tdsStd: 35.0,
      ecMean: 680.0, ecStd: 45.0, turbidityMean: 1.1, turbidityStd: 0.15,
      tempMean: 26.5, tempStd: 1.2
    };

    const readingInput = {
      ph: Number(pH),
      tds: Number(tds),
      ec: ec !== undefined ? Number(ec) : Number(tds) * 1.5,
      turbidity: Number(turbidity || 1.0),
      temperature: Number(temperature || 26.5),
      flowRate: Number(flowRate || 3.5),
      waterLevel: Number(waterLevel || 75.0)
    };

    const anomalyRes = analyzeReading(readingInput, baseline);
    const riskRes = calculateWaterRisk(readingInput, baseline);

    // 1. Save reading
    const newReading = await prisma.sensorReading.create({
      data: {
        sourceId: source.id,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
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

    // 2. Update Water Source Status & Risk Score
    let newStatus: string = "SAFE";
    if (riskRes.classification === "WATCH") newStatus = "WATCH";
    if (riskRes.classification === "WARNING") newStatus = "WARNING";
    if (riskRes.classification === "CRITICAL") newStatus = "CRITICAL";

    await prisma.waterSource.update({
      where: { id: source.id },
      data: {
        status: newStatus,
        currentRiskScore: riskRes.riskScore,
        lastUpdate: new Date()
      }
    });

    // 3. Generate Anomaly Alert if Critical or Multi-Parameter
    if (anomalyRes.isAnomaly && riskRes.riskScore >= 45) {
      const primaryEvent = anomalyRes.eventTypes[0] || "HIGH_TDS";
      const isCritical = riskRes.riskScore >= 75 || anomalyRes.eventTypes.includes("MULTI_PARAMETER_ANOMALY");

      await prisma.anomalyEvent.create({
        data: {
          sourceId: source.id,
          eventType: primaryEvent as any,
          severity: isCritical ? "CRITICAL" : "WARNING",
          priorityScore: Math.min(100, riskRes.riskScore + 15),
          title: isCritical ? "Potential Contamination Event Detected" : "Abnormal Water Signature Flagged",
          message: `${riskRes.summaryMessage} (Risk Score: ${riskRes.riskScore}/100)`,
          status: "ACTIVE",
          detailsJson: JSON.stringify(anomalyRes.explanation)
        }
      });
    }

    // 4. Update Device Heartbeat
    await prisma.device.update({
      where: { id: device.id },
      data: { lastHeartbeat: new Date(), status: "ONLINE" }
    });

    // 5. Broadcast live WebSocket message to connected clients
    broadcastSensorUpdate({
      sourceId: source.id,
      sourceCode: source.code,
      reading: newReading,
      risk: riskRes,
      anomaly: anomalyRes
    });

    res.json({
      success: true,
      data: {
        readingId: newReading.id,
        riskScore: riskRes.riskScore,
        classification: riskRes.classification,
        isAnomaly: anomalyRes.isAnomaly,
        explanation: anomalyRes.explanation
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
