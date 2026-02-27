"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BacklogAreaChart({ data }: { data: Array<{ date: string; backlog: number }> }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="backlogGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(188 62% 45%)" stopOpacity={0.65} />
              <stop offset="95%" stopColor="hsl(188 62% 45%)" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area dataKey="backlog" stroke="hsl(188 62% 33%)" fill="url(#backlogGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
