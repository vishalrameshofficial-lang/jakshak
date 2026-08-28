import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { recommendTreatment, simulatePostTreatmentVerification, calculateWaterRecovery } from "../services/treatmentEngine";
import { updateFilterHealth } from "../services/filterEngine";

const prisma = new PrismaClient();

// Active treatment state simulation in memory per source
const activeTreatments: Record<string, {
  startTime: Date;
  inputVolumeL: number;
  stagesActive: string[];
  status: "RUNNING" | "STOPPED" | "VERIFIED_PASS" | "VERIFIED_FAIL";
  attemptCount: number;
  recirculationCount: number;
}> = {};

export async function getTreatmentStatus(req: Request, res: Response) {
  try {
    const { sourceId } = req.params;
    const source = await prisma.waterSource.findUnique({
      where: { id: sourceId },
      include: {
        baseline: true,
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    if (!source || !source.baseline) {
      return res.status(404).json({ success: false, error: "Source not found" });
    }

    const latest = source.readings[0] || {
      ph: source.baseline.phMean,
      tds: source.baseline.tdsMean,
      ec: source.baseline.ecMean,
      turbidity: source.baseline.turbidityMean,
      temperature: source.baseline.tempMean
    };

    const recommendation = recommendTreatment(latest);
    const currentState = activeTreatments[sourceId] || {
      startTime: new Date(),
      inputVolumeL: 1000,
      stagesActive: recommendation.stages.filter(s => s.required).map(s => s.valveId),
      status: "STOPPED",
      attemptCount: 1,
      recirculationCount: 0
    };

    res.json({
      success: true,
      data: {
        sourceId: source.id,
        sourceName: source.name,
        recommendation,
        currentState,
        valves: [
          { id: "V1", name: "Sediment Filter", active: currentState.stagesActive.includes("V1") || currentState.stagesActive.includes("sediment") },
          { id: "V2", name: "Activated Carbon Filter", active: currentState.stagesActive.includes("V2") || currentState.stagesActive.includes("carbon") },
          { id: "V3", name: "Specialized Media Filter", active: currentState.stagesActive.includes("V3") || currentState.stagesActive.includes("media") },
          { id: "V4", name: "RO Membrane", active: currentState.stagesActive.includes("V4") || currentState.stagesActive.includes("ro") },
          { id: "V5", name: "UV Disinfection", active: currentState.stagesActive.includes("V5") || currentState.stagesActive.includes("uv") }
        ],
        pumps: [
          { id: "P1", name: "Raw Water Pump", active: currentState.status === "RUNNING", flowRateLpm: 12.5 },
          { id: "P2", name: "Treatment Booster Pump", active: currentState.status === "RUNNING", flowRateLpm: 10.2 }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function startTreatment(req: Request, res: Response) {
  try {
    const { sourceId, inputVolumeL, stagesActive } = req.body;
    if (!sourceId) return res.status(400).json({ success: false, error: "Missing sourceId" });

    activeTreatments[sourceId] = {
      startTime: new Date(),
      inputVolumeL: inputVolumeL || 1000,
      stagesActive: stagesActive || ["V1", "V2", "V4", "V5"],
      status: "RUNNING",
      attemptCount: 1,
      recirculationCount: 0
    };

    await prisma.auditLog.create({
      data: {
        userName: "Operator",
        action: "START_TREATMENT",
        target: sourceId,
        details: `Initiated treatment cycle with active valves: ${activeTreatments[sourceId].stagesActive.join(", ")}`
      }
    });

    res.json({ success: true, message: "Treatment sequence started successfully", state: activeTreatments[sourceId] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function stopTreatment(req: Request, res: Response) {
  try {
    const { sourceId } = req.body;
    if (activeTreatments[sourceId]) {
      activeTreatments[sourceId].status = "STOPPED";
    }

    await prisma.auditLog.create({
      data: {
        userName: "Operator",
        action: "STOP_TREATMENT",
        target: sourceId,
        details: "Treatment sequence safely stopped."
      }
    });

    res.json({ success: true, message: "Treatment sequence stopped." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function emergencyStop(req: Request, res: Response) {
  try {
    const { sourceId } = req.body;
    if (sourceId) {
      activeTreatments[sourceId] = {
        startTime: new Date(),
        inputVolumeL: 0,
        stagesActive: [],
        status: "STOPPED",
        attemptCount: 1,
        recirculationCount: 0
      };
    }

    await prisma.auditLog.create({
      data: {
        userName: "Operator",
        action: "EMERGENCY_STOP",
        target: sourceId || "ALL_SYSTEMS",
        details: "CRITICAL: Emergency Stop Triggered by Operator!"
      }
    });

    res.json({ success: true, message: "🚨 Emergency stop executed. All valves closed and pumps shut down." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifyPostTreatment(req: Request, res: Response) {
  try {
    const { sourceId, attemptCount, forceFailure } = req.body;
    const source = await prisma.waterSource.findUnique({
      where: { id: sourceId },
      include: {
        baseline: true,
        filters: true,
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    if (!source || !source.baseline) {
      return res.status(404).json({ success: false, error: "Source not found" });
    }

    const latest = source.readings[0] || {
      ph: 5.4, tds: 1480, ec: 2300, turbidity: 6.8, temperature: 27.5
    };

    const currentTreatment = activeTreatments[sourceId] || {
      startTime: new Date(),
      inputVolumeL: 1000,
      stagesActive: ["V1", "V2", "V4", "V5"],
      status: "RUNNING",
      attemptCount: attemptCount || 1,
      recirculationCount: (attemptCount || 1) > 1 ? 1 : 0
    };

    let verifyResult = simulatePostTreatmentVerification(
      latest,
      currentTreatment.stagesActive,
      attemptCount || currentTreatment.attemptCount
    );

    if (forceFailure) {
      verifyResult = {
        passed: false,
        finalPh: 5.9,
        finalTds: 620,
        finalTurbidity: 2.1,
        message: "Post-treatment verification failed. High residual dissolved solids detected.",
        recirculationRecommended: true
      };
    }

    const isRoActive = currentTreatment.stagesActive.includes("V4") || currentTreatment.stagesActive.includes("ro");
    const recoveryStats = calculateWaterRecovery(
      currentTreatment.inputVolumeL,
      isRoActive,
      currentTreatment.recirculationCount
    );

    // Save treatment cycle record to database
    await prisma.treatmentCycle.create({
      data: {
        sourceId: source.id,
        startTime: currentTreatment.startTime,
        endTime: new Date(),
        inputVolumeL: recoveryStats.treatedL,
        treatedVolumeL: recoveryStats.treatedL,
        recoveredVolumeL: recoveryStats.recoveredL,
        rejectedVolumeL: recoveryStats.rejectedL,
        recoveryRatio: recoveryStats.recoveryRatioPct,
        status: verifyResult.passed ? "SUCCESS" : "FAILED_RECIRCULATING",
        stagesActiveJson: JSON.stringify(currentTreatment.stagesActive),
        failureReason: verifyResult.passed ? null : verifyResult.message
      }
    });

    // Update filter health with volume processed
    for (const filter of source.filters) {
      const updated = updateFilterHealth(
        filter.healthPercent,
        filter.volumeProcessedL,
        recoveryStats.treatedL / 5, // distributed per stage
        latest.turbidity,
        1.5,
        filter.stageName
      );

      await prisma.filterState.update({
        where: { id: filter.id },
        data: {
          healthPercent: updated.healthPercent,
          volumeProcessedL: updated.volumeProcessedL,
          estimatedRulDays: updated.estimatedRulDays,
          status: updated.status as any
        }
      });
    }

    if (verifyResult.passed) {
      activeTreatments[sourceId].status = "VERIFIED_PASS";
    } else {
      activeTreatments[sourceId].status = "VERIFIED_FAIL";
      activeTreatments[sourceId].recirculationCount += 1;
    }

    res.json({
      success: true,
      verification: verifyResult,
      recovery: recoveryStats,
      attemptCount: attemptCount || currentTreatment.attemptCount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
