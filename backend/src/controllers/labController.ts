import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getLabSamples(req: Request, res: Response) {
  try {
    const samples = await prisma.labSample.findMany({
      include: {
        source: { select: { id: true, code: true, name: true, village: true } },
        result: true
      },
      orderBy: { collectionDate: "desc" }
    });

    res.json({ success: true, count: samples.length, data: samples });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createLabSample(req: Request, res: Response) {
  try {
    const { sourceId, sampleCode, collectedBy, reason } = req.body;
    if (!sourceId || !collectedBy) {
      return res.status(400).json({ success: false, error: "Missing required parameters (sourceId, collectedBy)" });
    }

    const code = sampleCode || `LAB-${Date.now().toString().slice(-6)}`;
    const sample = await prisma.labSample.create({
      data: {
        sampleCode: code,
        sourceId,
        collectedBy,
        reason: reason || "Routine Water Quality Ground Truth Audit",
        status: "PENDING"
      }
    });

    res.json({ success: true, data: sample });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addLabResult(req: Request, res: Response) {
  try {
    const { sampleId, ph, tds, turbidity, iron, manganese, fluoride, arsenic, lead, nitrate, testNotes, updateBaselineModel } = req.body;

    if (!sampleId || ph === undefined || tds === undefined) {
      return res.status(400).json({ success: false, error: "Missing required lab values (sampleId, ph, tds)" });
    }

    const sample = await prisma.labSample.findUnique({
      where: { id: sampleId },
      include: { source: { include: { baseline: true } } }
    });

    if (!sample) {
      return res.status(404).json({ success: false, error: "Lab sample not found" });
    }

    // Save lab result
    const result = await prisma.labResult.create({
      data: {
        sampleId,
        ph: Number(ph),
        tds: Number(tds),
        turbidity: Number(turbidity || 1.0),
        iron: iron !== undefined ? Number(iron) : null,
        manganese: manganese !== undefined ? Number(manganese) : null,
        fluoride: fluoride !== undefined ? Number(fluoride) : null,
        arsenic: arsenic !== undefined ? Number(arsenic) : null,
        lead: lead !== undefined ? Number(lead) : null,
        nitrate: nitrate !== undefined ? Number(nitrate) : null,
        testNotes: testNotes || "Laboratory chemical confirmatory testing completed.",
        calibrationUsed: Boolean(updateBaselineModel)
      }
    });

    // Mark sample as VERIFIED
    await prisma.labSample.update({
      where: { id: sampleId },
      data: { status: "VERIFIED", verifiedAt: new Date() }
    });

    // Model Feedback: If operator explicitly chose to update the source baseline using verified ground truth
    if (updateBaselineModel && sample.source.baseline) {
      const currentBaseline = sample.source.baseline;
      const n = currentBaseline.sampleCount;
      
      // Compute updated running mean using verified laboratory ground truth
      const newPhMean = (currentBaseline.phMean * n + Number(ph)) / (n + 1);
      const newTdsMean = (currentBaseline.tdsMean * n + Number(tds)) / (n + 1);

      await prisma.waterBaseline.update({
        where: { id: currentBaseline.id },
        data: {
          phMean: Number(newPhMean.toFixed(2)),
          tdsMean: Number(newTdsMean.toFixed(1)),
          sampleCount: n + 1
        }
      });

      await prisma.auditLog.create({
        data: {
          userName: "Operator",
          action: "RECALIBRATE_BASELINE_MODEL",
          target: sample.source.id,
          details: `Updated source baseline model using verified laboratory result (${sample.sampleCode}). New pH baseline: ${newPhMean.toFixed(2)}, TDS: ${newTdsMean.toFixed(1)} ppm.`
        }
      });
    }

    res.json({ success: true, data: result, baselineCalibrated: Boolean(updateBaselineModel) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
