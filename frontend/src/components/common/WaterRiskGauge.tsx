import React from "react";
import { AlertTriangle, ShieldCheck, AlertOctagon, Info } from "lucide-react";

interface RiskFactor {
  parameter: string;
  points: number;
  reason: string;
}

interface WaterRiskGaugeProps {
  score: number; // 0-100
  factors?: RiskFactor[];
  summary?: string;
  size?: "sm" | "md" | "lg";
}

export const WaterRiskGauge: React.FC<WaterRiskGaugeProps> = ({ score, factors = [], summary, size = "md" }) => {
  let classification = "SAFE";
  let strokeColor = "#10b981"; // Green
  let textColor = "text-emerald-400";
  let bgGlow = "shadow-emerald-500/20";
  let Icon = ShieldCheck;

  if (score >= 25 && score < 50) {
    classification = "WATCH";
    strokeColor = "#f59e0b";
    textColor = "text-amber-400";
    bgGlow = "shadow-amber-500/20";
    Icon = Info;
  } else if (score >= 50 && score < 75) {
    classification = "WARNING";
    strokeColor = "#f97316";
    textColor = "text-orange-400";
    bgGlow = "shadow-orange-500/20";
    Icon = AlertTriangle;
  } else if (score >= 75) {
    classification = "CRITICAL";
    strokeColor = "#ef4444";
    textColor = "text-rose-400";
    bgGlow = "shadow-rose-500/20 animate-pulse";
    Icon = AlertOctagon;
  }

  // SVG Circle stroke dash calculations
  const radius = size === "lg" ? 68 : size === "sm" ? 36 : 54;
  const strokeWidth = size === "lg" ? 10 : size === "sm" ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const svgDim = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex items-center justify-center rounded-full ${bgGlow}`}>
        <svg width={svgDim} height={svgDim} className="transform -rotate-90">
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-extrabold ${size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl"} ${textColor}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">/ 100</span>
          <span className={`text-[11px] font-bold tracking-wide ${textColor} uppercase flex items-center gap-1 mt-0.5`}>
            <Icon className="w-3 h-3" />
            {classification}
          </span>
        </div>
      </div>

      {summary && (
        <p className="mt-3 text-xs text-slate-300 text-center max-w-xs leading-relaxed font-medium">
          {summary}
        </p>
      )}

      {factors.length > 0 && (
        <div className="w-full mt-4 space-y-1.5 border-t border-slate-800 pt-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Risk Contributor Factors:
          </span>
          {factors.map((f, idx) => (
            <div key={idx} className="flex items-start justify-between text-xs bg-slate-800/40 p-2 rounded border border-slate-700/50">
              <div className="flex-1 pr-2">
                <span className="font-semibold text-slate-200 block">{f.parameter}</span>
                <span className="text-[11px] text-slate-400">{f.reason}</span>
              </div>
              <span className="font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[11px]">
                +{f.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
