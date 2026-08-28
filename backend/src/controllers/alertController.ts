import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAlerts(req: Request, res: Response) {
  try {
    const status = req.query.status as string;
    const whereClause = status ? { status } : {};

    const alerts = await prisma.anomalyEvent.findMany({
      where: whereClause,
      include: {
        source: {
          select: { id: true, code: true, name: true, village: true, currentRiskScore: true }
        }
      },
      orderBy: [
        { priorityScore: "desc" },
        { timestamp: "desc" }
      ]
    });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function acknowledgeAlert(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userName } = req.body;

    const alert = await prisma.anomalyEvent.update({
      where: { id },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedBy: userName || "Operator"
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: userName || "Operator",
        action: "ACKNOWLEDGE_ALERT",
        target: id,
        details: `Acknowledged alert: ${alert.title}`
      }
    });

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function resolveAlert(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userName } = req.body;

    const alert = await prisma.anomalyEvent.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: userName || "Operator",
        action: "RESOLVE_ALERT",
        target: id,
        details: `Resolved alert: ${alert.title}`
      }
    });

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
