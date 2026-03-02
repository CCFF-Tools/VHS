"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

type StageBarDatum = { stage: string; count: number; stageRaw?: string };

export function PipelineFlowChart({
  data,
  onBarClick,
  activeStageRaw,
  theme = "default",
  className,
}: {
  data: StageBarDatum[];
  onBarClick?: (datum: StageBarDatum) => void;
  activeStageRaw?: string;
  theme?: "default" | "mission";
  className?: string;
}) {
  const mission = theme === "mission";
  const tickStyle = mission ? { fontSize: 11, fill: "hsl(190 82% 84%)" } : { fontSize: 11 };
  const gridStroke = mission ? "hsl(196 63% 30% / 0.55)" : "hsl(35 18% 83%)";
  const activeFill = mission ? "hsl(41 95% 61%)" : "hsl(33 92% 52%)";
  const defaultFill = mission ? "hsl(190 81% 48%)" : "hsl(171 45% 34%)";
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
    <div className={cn("h-[250px] w-full", className)}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" tick={tickStyle} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="stage" tick={tickStyle} tickLine={false} axisLine={false} width={140} />
          <Tooltip {...tooltipStyles} />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(entry) => onBarClick?.(entry.payload as StageBarDatum)}
          >
            {data.map((row) => {
              const isActive = Boolean(activeStageRaw && (row.stageRaw ?? row.stage) === activeStageRaw);
              return (
                <Cell
                  key={`${row.stage}-${row.count}`}
                  fill={isActive ? activeFill : defaultFill}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
