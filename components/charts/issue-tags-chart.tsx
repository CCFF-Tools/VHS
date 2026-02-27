"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0f766e", "#f59e0b", "#be185d", "#4f46e5", "#0ea5e9", "#84cc16", "#7c3aed"];

export function IssueTagsChart({ data }: { data: Array<{ tag: string; count: number }> }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Pie data={data} dataKey="count" nameKey="tag" outerRadius={90} innerRadius={42} paddingAngle={3}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
