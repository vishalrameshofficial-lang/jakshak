import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateWaterRisk } from "../services/riskEngine";
import { analyzeReading } from "../services/anomalyEngine";

const prisma = new PrismaClient();

export async function getAllSources(req: Request, res: Response) {
  try {
    const sources = await prisma.waterSource.findMany({
      include: {
        baseline: true,
        device: true,
        filters: true,
        readings: {
          take: 1,
          orderBy: { timestamp: "desc" }
        }
      },
      orderBy: { currentRiskScore: "desc" }
    });

    res.json({ success: true, count: sources.length, data: sources });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSourceById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const source = await prisma.waterSource.findUnique({
      where: { id },
      include: {
        baseline: true,
        device: {
          include: { sensors: true }
        },
        filters: true,
        anomalies: { take: 10, orderBy: { timestamp: "desc" } },
        labSamples: { include: { result: true }, take: 5, orderBy: { collectionDate: "desc" } },
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    if (!source) {
      return res.status(404).json({ success: false, error: "Water source not found" });
    }

    res.json({ success: true, data: source });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSourceReadings(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const readings = await prisma.sensorReading.findMany({
      where: { sourceId: id },
      orderBy: { timestamp: "desc" },
      take: limit
    });

    res.json({ success: true, count: readings.length, data: readings.reverse() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSourceFingerprint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const source = await prisma.waterSource.findUnique({
      where: { id },
      include: {
        baseline: true,
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    if (!source || !source.baseline) {
      return res.status(404).json({ success: false, error: "Baseline fingerprint not found" });
    }

    const latest = source.readings[0] || {
      ph: source.baseline.phMean,
      tds: source.baseline.tdsMean,
      ec: source.baseline.ecMean,
      turbidity: source.baseline.turbidityMean,
      temperature: source.baseline.tempMean
    };

    const anomalyRes = analyzeReading(latest, source.baseline);

    res.json({
      success: true,
      data: {
        sourceId: source.id,
        sourceName: source.name,
        baseline: source.baseline,
        current: latest,
        deviations: anomalyRes.deviations,
        zScores: anomalyRes.zScores,
        anomalyScore: anomalyRes.anomalyScore,
        isAnomaly: anomalyRes.isAnomaly,
        explanation: anomalyRes.explanation
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSourceRisk(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const source = await prisma.waterSource.findUnique({
      where: { id },
      include: {
        baseline: true,
        readings: { take: 1, orderBy: { timestamp: "desc" } }
      }
    });

    if (!source || !source.baseline) {
      return res.status(404).json({ success: false, error: "Source or baseline not found" });
    }

    const latest = source.readings[0] || {
      ph: source.baseline.phMean,
      tds: source.baseline.tdsMean,
      ec: source.baseline.ecMean,
      turbidity: source.baseline.turbidityMean,
      temperature: source.baseline.tempMean
    };

    const riskResult = calculateWaterRisk(latest, source.baseline);

    res.json({ success: true, data: riskResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
