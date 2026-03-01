"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DateBarDatum = { date: string; count: number };

export function AcquisitionChart({
  data,
  onBarClick,
  activeDate,
}: {
  data: DateBarDatum[];
  onBarClick?: (datum: DateBarDatum) => void;
  activeDate?: string;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(entry) => onBarClick?.(entry.payload as DateBarDatum)}
          >
            {data.map((row) => (
              <Cell
                key={`${row.date}-${row.count}`}
                fill={activeDate === row.date ? "hsl(33 92% 52%)" : "hsl(171 45% 34%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
