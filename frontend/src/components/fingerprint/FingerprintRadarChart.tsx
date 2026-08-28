import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { WaterBaseline, SensorReading } from "../../types";

interface FingerprintRadarProps {
  baseline: WaterBaseline;
  current: SensorReading;
}

export const FingerprintRadarChart: React.FC<FingerprintRadarProps> = ({ baseline, current }) => {
  // Normalize parameters to a 0-100 relative index for clear visual comparison
  const data = [
    {
      parameter: "pH",
      baseline: 70,
      current: Math.min(100, Math.max(0, (current.ph / 10) * 100)),
      rawBaseline: `${baseline.phMean.toFixed(2)} pH`,
      rawCurrent: `${current.ph.toFixed(2)} pH`
    },
    {
      parameter: "TDS",
      baseline: 40,
      current: Math.min(100, (current.tds / 1200) * 100),
      rawBaseline: `${baseline.tdsMean.toFixed(0)} ppm`,
      rawCurrent: `${current.tds.toFixed(0)} ppm`
    },
    {
      parameter: "EC",
      baseline: 40,
      current: Math.min(100, (current.ec / 2000) * 100),
      rawBaseline: `${baseline.ecMean.toFixed(0)} µS/cm`,
      rawCurrent: `${current.ec.toFixed(0)} µS/cm`
    },
    {
      parameter: "Turbidity",
      baseline: 20,
      current: Math.min(100, (current.turbidity / 10) * 100),
      rawBaseline: `${baseline.turbidityMean.toFixed(1)} NTU`,
      rawCurrent: `${current.turbidity.toFixed(1)} NTU`
    },
    {
      parameter: "Temp",
      baseline: 50,
      current: Math.min(100, (current.temperature / 50) * 100),
      rawBaseline: `${baseline.tempMean.toFixed(1)} °C`,
      rawCurrent: `${current.temperature.toFixed(1)} °C`
    }
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="parameter" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar name="Source Baseline" dataKey="baseline" stroke="#0284c7" fill="#0284c7" fillOpacity={0.3} />
          <Radar name="Current Telemetry" dataKey="current" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
            formatter={(val: any, name: any, item: any) => {
              const raw = name === "Source Baseline" ? item.payload.rawBaseline : item.payload.rawCurrent;
              return [`${raw}`, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", color: "#cbd5e1" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
