import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDevices(req: Request, res: Response) {
  try {
    const devices = await prisma.device.findMany({
      include: {
        source: { select: { id: true, code: true, name: true, village: true } },
        sensors: true
      },
      orderBy: { lastHeartbeat: "desc" }
    });

    res.json({ success: true, count: devices.length, data: devices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deviceHeartbeat(req: Request, res: Response) {
  try {
    const { deviceCode, batteryLevel, signalStrength, status } = req.body;
    if (!deviceCode) {
      return res.status(400).json({ success: false, error: "Missing deviceCode parameter" });
    }

    const device = await prisma.device.update({
      where: { deviceCode },
      data: {
        lastHeartbeat: new Date(),
        batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : undefined,
        signalStrength: signalStrength !== undefined ? Number(signalStrength) : undefined,
        status: status || "ONLINE"
      }
    });

    res.json({ success: true, data: device });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function calibrateSensor(req: Request, res: Response) {
  try {
    const { sensorId, status, message } = req.body;

    const sensor = await prisma.sensorHealth.update({
      where: { id: sensorId },
      data: {
        status: status || "GOOD",
        message: message || "Calibrated & Verified",
        lastCalibratedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: "Field Technician",
        action: "CALIBRATE_SENSOR",
        target: sensorId,
        details: `Calibrated sensor type: ${sensor.sensorType}`
      }
    });

    res.json({ success: true, data: sensor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
