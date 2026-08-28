import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFilters(req: Request, res: Response) {
  try {
    const filters = await prisma.filterState.findMany({
      include: {
        source: {
          select: { id: true, code: true, name: true, village: true }
        }
      },
      orderBy: { healthPercent: "asc" }
    });

    res.json({ success: true, count: filters.length, data: filters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateFilter(req: Request, res: Response) {
  try {
    const { filterId, healthPercent, action } = req.body;

    let updatedHealth = healthPercent !== undefined ? Number(healthPercent) : 100.0;
    if (action === "RESET_REPLACE") {
      updatedHealth = 100.0;
    }

    const filter = await prisma.filterState.update({
      where: { id: filterId },
      data: {
        healthPercent: updatedHealth,
        status: updatedHealth <= 20 ? "REPLACE_NOW" : updatedHealth <= 45 ? "SERVICE_SOON" : "GOOD",
        volumeProcessedL: action === "RESET_REPLACE" ? 0.0 : undefined,
        estimatedRulDays: Math.round((updatedHealth / 100) * 90)
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: "Operator",
        action: action === "RESET_REPLACE" ? "REPLACE_FILTER" : "UPDATE_FILTER_HEALTH",
        target: filterId,
        details: `Filter '${filter.stageName}' state updated to ${updatedHealth}% health.`
      }
    });

    res.json({ success: true, data: filter });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
