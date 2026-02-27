"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ThroughputChart({ data }: { data: Array<{ date: string; completed: number; received: number }> }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="received" stroke="hsl(38 78% 48%)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="completed" stroke="hsl(170 54% 34%)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
