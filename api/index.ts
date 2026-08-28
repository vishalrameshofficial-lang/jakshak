import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const dbPath = path.resolve(process.cwd(), "backend", "prisma", "dev.db");
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${dbPath}`;

dotenv.config();

import apiRoutes from "../backend/src/routes";

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    platform: "JAL-RAKSHAK Smart Water Intelligence Platform",
    version: "1.0.0-sih",
    environment: "Vercel Serverless",
    dbConfigured: !!process.env.DATABASE_URL
  });
});

export default app;
