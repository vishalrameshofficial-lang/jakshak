import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting JAL-RAKSHAK database seeding...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.labSample.deleteMany();
  await prisma.sensorHealth.deleteMany();
  await prisma.device.deleteMany();
  await prisma.filterState.deleteMany();
  await prisma.treatmentCycle.deleteMany();
  await prisma.anomalyEvent.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.waterBaseline.deleteMany();
  await prisma.waterSource.deleteMany();
  await prisma.systemThreshold.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const passwordHash = await bcrypt.hash("sih2026demo", 10);
  
  const admin = await prisma.user.create({
    data: {
      email: "admin@jalrakshak.in",
      passwordHash,
      name: "SIH Chief Administrator",
      role: "ADMIN"
    }
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@jalrakshak.in",
      passwordHash,
      name: "Regional Operator (Zone 4)",
      role: "OPERATOR"
    }
  });

  await prisma.user.create({
    data: {
      email: "viewer@jalrakshak.in",
      passwordHash,
      name: "Community Inspector",
      role: "VIEWER"
    }
  });

  console.log("✅ Seeded demo user accounts.");

  // 3. Seed System Standards & Thresholds
  const thresholds = [
    { parameter: "pH", lowerLimit: 6.5, upperLimit: 8.5, warningLimit: 6.0, criticalLimit: 5.5, unit: "pH", standardSource: "IS 10500:2012 Drinking Standard" },
    { parameter: "TDS", lowerLimit: 50.0, upperLimit: 500.0, warningLimit: 1000.0, criticalLimit: 2000.0, unit: "ppm", standardSource: "IS 10500:2012 Drinking Standard" },
    { parameter: "EC", lowerLimit: 100.0, upperLimit: 800.0, warningLimit: 1500.0, criticalLimit: 2500.0, unit: "µS/cm", standardSource: "WHO Water Guidelines" },
    { parameter: "Turbidity", lowerLimit: 0.0, upperLimit: 1.0, warningLimit: 5.0, criticalLimit: 10.0, unit: "NTU", standardSource: "IS 10500:2012 Drinking Standard" },
    { parameter: "Temperature", lowerLimit: 15.0, upperLimit: 35.0, warningLimit: 40.0, criticalLimit: 45.0, unit: "°C", standardSource: "Environmental Safety Standards" }
  ];

  for (const t of thresholds) {
    await prisma.systemThreshold.create({ data: t });
  }

  // 4. Seed 15 Water Sources
  const sampleSources = [
    { code: "KA-014", name: "Mine Zone Borewell B", village: "Kalyanpur Mining Block", district: "Ballari", state: "Karnataka", type: "BOREWELL", isMiningAffected: true, latitude: 15.1424, longitude: 76.9214, status: "SAFE", riskScore: 21 },
    { code: "KA-015", name: "Mine Zone Borewell A", village: "Kalyanpur Mining Block", district: "Ballari", state: "Karnataka", type: "BOREWELL", isMiningAffected: true, latitude: 15.1488, longitude: 76.9288, status: "WARNING", riskScore: 68 },
    { code: "KA-001", name: "Shakti Nagar Well", village: "Shakti Nagar", district: "Raichur", state: "Karnataka", type: "WELL", isMiningAffected: false, latitude: 16.2056, longitude: 77.3556, status: "SAFE", riskScore: 12 },
    { code: "JH-008", name: "Devgaon Hand Pump", village: "Devgaon", district: "Dhanbad", state: "Jharkhand", type: "BOREWELL", isMiningAffected: true, latitude: 23.7957, longitude: 86.4304, status: "WATCH", riskScore: 42 },
    { code: "JH-012", name: "Coalfield Well C-4", village: "Jharia Coal Belt", district: "Dhanbad", state: "Jharkhand", type: "WELL", isMiningAffected: true, latitude: 23.7412, longitude: 86.4189, status: "CRITICAL", riskScore: 84 },
    { code: "CG-003", name: "Rampur Community Tank", village: "Rampur", district: "Korba", state: "Chhattisgarh", type: "COMMUNITY_TANK", isMiningAffected: true, latitude: 22.3595, longitude: 82.7501, status: "WATCH", riskScore: 38 },
    { code: "OR-021", name: "Lakshmi Nagar Borewell", village: "Lakshmi Nagar", district: "Keonjhar", state: "Odisha", type: "BOREWELL", isMiningAffected: true, latitude: 21.6289, longitude: 85.5817, status: "SAFE", riskScore: 18 },
    { code: "MP-009", name: "Greenfield Village Well", village: "Greenfield", district: "Singrauli", state: "Madhya Pradesh", type: "WELL", isMiningAffected: false, latitude: 24.1993, longitude: 82.6645, status: "SAFE", riskScore: 8 },
    { code: "RJ-004", name: "Desert Supply Station 3", village: "Barmer Rural", district: "Barmer", state: "Rajasthan", type: "COMMUNITY_TANK", isMiningAffected: false, latitude: 25.7532, longitude: 71.4181, status: "WATCH", riskScore: 46 },
    { code: "MH-018", name: "Chandrapur River Node 2", village: "Wardha Basin", district: "Chandrapur", state: "Maharashtra", type: "RIVER", isMiningAffected: true, latitude: 19.9615, longitude: 79.2961, status: "WARNING", riskScore: 72 },
    { code: "WB-006", name: "Asansol Borewell 9", village: "Raniganj", district: "Paschim Bardhaman", state: "West Bengal", type: "BOREWELL", isMiningAffected: true, latitude: 23.6833, longitude: 86.9833, status: "SAFE", riskScore: 22 },
    { code: "TG-011", name: "Singareni Well S-1", village: "Godavarikhani", district: "Peddapalli", state: "Telangana", type: "WELL", isMiningAffected: true, latitude: 18.7554, longitude: 79.5167, status: "SAFE", riskScore: 19 },
    { code: "AP-007", name: "Kadapa Mining Well B", village: "Mangampeta", district: "YSR Kadapa", state: "Andhra Pradesh", type: "WELL", isMiningAffected: true, latitude: 14.3333, longitude: 79.1500, status: "WATCH", riskScore: 44 },
    { code: "TN-015", name: "Neyveli Station 4", village: "Neyveli Township", district: "Cuddalore", state: "Tamil Nadu", type: "BOREWELL", isMiningAffected: true, latitude: 11.6000, longitude: 79.4833, status: "SAFE", riskScore: 15 },
    { code: "GA-002", name: "Bicholim River Intake", village: "Bicholim", district: "North Goa", state: "Goa", type: "RIVER", isMiningAffected: true, latitude: 15.5900, longitude: 73.9500, status: "SAFE", riskScore: 24 }
  ];

  for (const s of sampleSources) {
    const createdSource = await prisma.waterSource.create({
      data: {
        code: s.code,
        name: s.name,
        village: s.village,
        district: s.district,
        state: s.state,
        type: s.type,
        isMiningAffected: s.isMiningAffected,
        latitude: s.latitude,
        longitude: s.longitude,
        status: s.status,
        currentRiskScore: s.riskScore
      }
    });

    // 5. Create Baseline for source
    const phMean = s.isMiningAffected ? 6.8 : 7.2;
    const tdsMean = s.isMiningAffected ? 540.0 : 380.0;
    const ecMean = s.isMiningAffected ? 820.0 : 580.0;
    const turbMean = s.isMiningAffected ? 1.4 : 0.8;

    await prisma.waterBaseline.create({
      data: {
        sourceId: createdSource.id,
        phMean,
        phStd: 0.22,
        tdsMean,
        tdsStd: 38.0,
        ecMean,
        ecStd: 55.0,
        turbidityMean: turbMean,
        turbidityStd: 0.18,
        tempMean: 26.8,
        tempStd: 1.1
      }
    });

    // 6. Create Device and Sensor Health
    const device = await prisma.device.create({
      data: {
        deviceCode: `ESP32-${s.code}`,
        sourceId: createdSource.id,
        firmwareVersion: "v2.4.1-sih",
        batteryLevel: Math.floor(82 + Math.random() * 18),
        signalStrength: Math.floor(-75 + Math.random() * 20),
        status: "ONLINE"
      }
    });

    const sensorTypes = ["PH", "TDS", "EC", "TURBIDITY", "TEMP", "FLOW", "LEVEL"];
    for (const st of sensorTypes) {
      await prisma.sensorHealth.create({
        data: {
          deviceId: device.id,
          sensorType: st,
          status: "GOOD",
          message: "Operational & Calibrated"
        }
      });
    }

    // 7. Create Filter Stages
    const stages = [
      { name: "Sediment Filter (V1)", health: 86.0, vul: 2480.0, rul: 62 },
      { name: "Activated Carbon Filter (V2)", health: 91.0, vul: 3120.0, rul: 85 },
      { name: "Specialized Media (V3)", health: 94.0, vul: 1800.0, rul: 110 },
      { name: "RO Membrane (V4)", health: 82.0, vul: 4200.0, rul: 55 },
      { name: "UV Disinfection Chamber (V5)", health: 98.0, vul: 5400.0, rul: 180 }
    ];

    for (const stg of stages) {
      await prisma.filterState.create({
        data: {
          sourceId: createdSource.id,
          stageName: stg.name,
          healthPercent: stg.health,
          volumeProcessedL: stg.vul,
          turbidityExposure: turbMean,
          runtimeHours: Math.round(stg.vul / 40),
          estimatedRulDays: stg.rul,
          status: "GOOD"
        }
      });
    }

    // 8. Generate 30 days of historical readings
    const now = new Date();
    for (let day = 30; day >= 1; day--) {
      const time = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      const isDeviated = s.status === "WARNING" && day < 3;
      const ph = isDeviated ? 5.8 : phMean + (Math.random() - 0.5) * 0.3;
      const tds = isDeviated ? 920 : tdsMean + (Math.random() - 0.5) * 30;
      const ec = isDeviated ? 1450 : ecMean + (Math.random() - 0.5) * 45;
      const turb = isDeviated ? 4.8 : turbMean + (Math.random() - 0.5) * 0.2;

      await prisma.sensorReading.create({
        data: {
          sourceId: createdSource.id,
          timestamp: time,
          ph: Number(ph.toFixed(2)),
          tds: Number(tds.toFixed(0)),
          ec: Number(ec.toFixed(0)),
          turbidity: Number(Math.max(0.3, turb).toFixed(2)),
          temperature: Number((26.5 + (Math.random() - 0.5) * 1.5).toFixed(1)),
          flowRate: 3.5,
          waterLevel: 76.0,
          riskScore: s.riskScore,
          anomalyScore: isDeviated ? 72.0 : 12.0,
          isAnomaly: isDeviated
        }
      });
    }
  }

  // 9. Create initial sample alert for warning sources
  const warningSource = await prisma.waterSource.findFirst({ where: { code: "KA-015" } });
  if (warningSource) {
    await prisma.anomalyEvent.create({
      data: {
        sourceId: warningSource.id,
        eventType: "MULTI_PARAMETER_ANOMALY",
        severity: "CRITICAL",
        priorityScore: 92,
        title: "Potential Contamination Event Detected",
        message: "Significant deviation from source baseline detected across pH, TDS, and EC signatures. Confirmatory water testing recommended.",
        status: "ACTIVE",
        detailsJson: JSON.stringify([
          "pH dropped by 14.7% below baseline standard",
          "TDS increased by 70.3% above historical mean",
          "Conductivity signature correlated spike detected"
        ])
      }
    });
  }

  // 10. Create initial lab sample verification record
  if (warningSource) {
    const labSample = await prisma.labSample.create({
      data: {
        sampleCode: "LAB-2026-KA015",
        sourceId: warningSource.id,
        collectedBy: "Field Tech R. Sharma",
        reason: "Routine Mining Zone Confirmatory Audit",
        status: "VERIFIED",
        verifiedAt: new Date()
      }
    });

    await prisma.labResult.create({
      data: {
        sampleId: labSample.id,
        ph: 6.2,
        tds: 880,
        turbidity: 3.8,
        iron: 0.42,
        manganese: 0.12,
        fluoride: 0.9,
        arsenic: 0.008,
        lead: 0.002,
        nitrate: 18.0,
        testNotes: "Confirmed elevated iron and particulate matter from mining runoff. No toxic heavy metal breach detected.",
        calibrationUsed: true
      }
    });
  }

  // 11. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      action: "SYSTEM_INITIALIZATION",
      target: "JAL-RAKSHAK Kernel",
      details: "Seeded 15 water sources, 30-day temporal baseline, IS 10500 thresholds, and ESP32 telemetry bridges."
    }
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Database seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
