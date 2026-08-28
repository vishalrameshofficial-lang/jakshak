import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100
    });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getThresholds(req: Request, res: Response) {
  try {
    const thresholds = await prisma.systemThreshold.findMany();
    res.json({ success: true, count: thresholds.length, data: thresholds });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateThreshold(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { warningLimit, criticalLimit, standardSource } = req.body;

    const threshold = await prisma.systemThreshold.update({
      where: { id },
      data: {
        warningLimit: warningLimit !== undefined ? Number(warningLimit) : undefined,
        criticalLimit: criticalLimit !== undefined ? Number(criticalLimit) : undefined,
        standardSource: standardSource || undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: "Administrator",
        action: "UPDATE_THRESHOLD",
        target: threshold.parameter,
        details: `Updated ${threshold.parameter} thresholds (Warning: ${threshold.warningLimit}, Critical: ${threshold.criticalLimit})`
      }
    });

    res.json({ success: true, data: threshold });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
