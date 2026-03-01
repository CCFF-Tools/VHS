"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type StageBarDatum = { stage: string; count: number; stageRaw?: string };

export function PipelineFlowChart({
  data,
  onBarClick,
  activeStageRaw,
}: {
  data: StageBarDatum[];
  onBarClick?: (datum: StageBarDatum) => void;
  activeStageRaw?: string;
}) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
          <Tooltip />
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
                  fill={isActive ? "hsl(33 92% 52%)" : "hsl(171 45% 34%)"}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
