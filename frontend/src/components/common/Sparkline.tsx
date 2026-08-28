import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = "#0284c7", height = 36 }) => {
  const chartData = data.map((val, idx) => ({ idx, val }));

  return (
    <div style={{ height }} className="w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
