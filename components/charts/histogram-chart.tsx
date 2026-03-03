"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

type BucketDatum = { bucket: string; count: number };

export function HistogramChart({
  data,
  onBarClick,
  activeBucket,
  theme = "default",
  className,
}: {
  data: BucketDatum[];
  onBarClick?: (datum: BucketDatum) => void;
  activeBucket?: string;
  theme?: "default" | "mission";
  className?: string;
}) {
  const mission = theme === "mission";
  const xTickStyle = mission ? { fontSize: 14, fill: "hsl(190 82% 84%)" } : { fontSize: 11 };
  const yTickStyle = mission ? { fontSize: 14, fill: "hsl(190 82% 84%)" } : { fontSize: 11 };
  const denseBuckets = data.length > 9;
  const gridStroke = mission ? "hsl(196 63% 30% / 0.55)" : "hsl(35 18% 83%)";
  const activeFill = mission ? "hsl(41 95% 61%)" : "hsl(171 45% 34%)";
  const defaultFill = mission ? "hsl(190 81% 48%)" : "hsl(38 84% 57%)";
  const tooltipStyles = mission
    ? {
        contentStyle: {
          background: "hsl(223 47% 11% / 0.95)",
          border: "1px solid hsl(195 73% 43% / 0.45)",
          borderRadius: "10px",
          color: "hsl(192 89% 92%)",
        },
        labelStyle: { color: "hsl(41 96% 77%)" },
      }
    : {};

  return (
    <div className={cn("h-[260px] w-full", className)}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={xTickStyle}
            tickLine={false}
            axisLine={false}
            angle={mission && denseBuckets ? -28 : 0}
            textAnchor={mission && denseBuckets ? "end" : "middle"}
            height={mission && denseBuckets ? 60 : 32}
          />
          <YAxis tick={yTickStyle} tickLine={false} axisLine={false} width={mission ? 36 : 28} />
          <Tooltip {...tooltipStyles} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(entry) => onBarClick?.(entry.payload as BucketDatum)}
          >
            {data.map((row) => (
              <Cell
                key={`${row.bucket}-${row.count}`}
                fill={activeBucket === row.bucket ? activeFill : defaultFill}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
