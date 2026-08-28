# JAL-RAKSHAK: Adaptive Water Treatment, Quality Monitoring & Contamination Early-Warning Platform

> **“DON’T JUST MEASURE WATER. UNDERSTAND IT.”**

**JAL-RAKSHAK** is an adaptive water intelligence platform engineered for rural and mining-affected areas (Smart India Hackathon 2026 prototype).

---

## 🌊 System Architecture

$$\text{SENSE} \longrightarrow \text{FINGERPRINT} \longrightarrow \text{DETECT} \longrightarrow \text{PREDICT} \longrightarrow \text{DECIDE} \longrightarrow \text{PURIFY} \longrightarrow \text{VERIFY} \longrightarrow \text{LEARN}$$

1. **Sense**: Real-time telemetry ingestion via ESP32 REST API (`POST /api/readings`) & WebSocket streaming (`ws://localhost:5000/ws`).
2. **Fingerprint**: Statistical Z-Score, EWMA, and baseline mean/stddev learning per water source.
3. **Detect**: Signature anomaly detection for sudden pH shifts, TDS spikes, turbidity elevation, and correlated multi-parameter contamination signatures.
4. **Predict**: Dynamic 0–100 Water Risk Score with explainable itemized contributor breakdown.
5. **Decide**: Adaptive stage matrix selecting minimum required purification stages ($\text{Sediment} \rightarrow \text{Carbon} \rightarrow \text{Media} \rightarrow \text{RO} \rightarrow \text{UV}$) while bypassing unnecessary stages to conserve energy.
6. **Purify**: Interactive valve ($V_1..V_5$) and pump ($P_1, P_2$) controls with animated flow visualizer.
7. **Verify**: Closed-loop post-treatment verification check and second-chance recirculation loop tracking Water Recovery Ratio ($\text{WRR} = 91.6\%$).
8. **Learn**: Confirmatory laboratory ground-truth sample entry (Arsenic, Lead, Fluoride, Iron) with baseline recalibration audit logging.

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 🏆 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Operator** | `operator@jalrakshak.in` | `sih2026demo` |
| **Admin** | `admin@jalrakshak.in` | `sih2026demo` |
| **Viewer** | `viewer@jalrakshak.in` | `sih2026demo` |

---

## 📜 Scientific Wording Compliance
All notifications strictly follow environmental safety guidelines: parameter anomalies are flagged as *"Abnormal water signature detected — confirmatory laboratory testing recommended"* rather than claiming direct heavy metal identification without laboratory ground truth verification.
