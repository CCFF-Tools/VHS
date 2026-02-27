"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PipelineFlowChart({
  data,
}: {
  data: Array<{ stage: string; count: number }>;
}) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(171 45% 34%)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
