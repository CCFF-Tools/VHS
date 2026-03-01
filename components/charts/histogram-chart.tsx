"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type BucketDatum = { bucket: string; count: number };

export function HistogramChart({
  data,
  onBarClick,
  activeBucket,
}: {
  data: BucketDatum[];
  onBarClick?: (datum: BucketDatum) => void;
  activeBucket?: string;
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" vertical={false} />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            cursor={onBarClick ? "pointer" : "default"}
            onClick={(entry) => onBarClick?.(entry.payload as BucketDatum)}
          >
            {data.map((row) => (
              <Cell
                key={`${row.bucket}-${row.count}`}
                fill={activeBucket === row.bucket ? "hsl(171 45% 34%)" : "hsl(38 84% 57%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
