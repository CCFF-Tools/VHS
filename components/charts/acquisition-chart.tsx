"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DateBarDatum = { date: string; count: number };

export function AcquisitionChart({
  data,
  onBarClick,
  activeDate,
  theme = "default",
}: {
  data: DateBarDatum[];
  onBarClick?: (datum: DateBarDatum) => void;
  activeDate?: string;
  theme?: "default" | "mission";
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
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyles} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(entry) => onBarClick?.(entry.payload as DateBarDatum)}
          >
            {data.map((row) => (
              <Cell
                key={`${row.date}-${row.count}`}
                fill={activeDate === row.date ? activeFill : defaultFill}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
