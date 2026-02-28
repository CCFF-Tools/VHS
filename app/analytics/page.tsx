"use client";

import { format, parseISO, startOfWeek, subWeeks } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";
import { formatDurationHMSFromMinutes } from "@/lib/runtime-format";
import type { Stage, TapeRecord } from "@/lib/types";

const STAGES: Stage[] = ["Intake", "Capture", "Trim", "Combine", "Transfer", "Archived"];

function runtimeForTape(tape: TapeRecord): number | null {
  const value = tape.labelRuntimeMinutes ?? tape.qtRuntimeMinutes ?? tape.finalClipDurationMinutes;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function runtimeScatterData(tapes: TapeRecord[]) {
  return tapes
    .map((tape) => {
      const runtime = runtimeForTape(tape);
      const date = tape.acquisitionAt ?? tape.receivedDate;
      if (runtime == null || !date) return null;
      const ts = parseISO(date).getTime();
      if (Number.isNaN(ts)) return null;
      return { ts, runtime, stage: tape.stage };
    })
    .filter((item): item is { ts: number; runtime: number; stage: Stage } => Boolean(item));
}

function cdfData(tapes: TapeRecord[]) {
  const runtimes = tapes
    .map((tape) => runtimeForTape(tape))
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => a - b);

  return runtimes.map((runtime, index) => ({
    runtime,
    pct: Number((((index + 1) / runtimes.length) * 100).toFixed(2)),
  }));
}

function stageBoxData(tapes: TapeRecord[]) {
  return STAGES.map((stage) => {
    const values = tapes
      .filter((tape) => tape.stage === stage)
      .map((tape) => runtimeForTape(tape))
      .filter((value): value is number => typeof value === "number")
      .sort((a, b) => a - b);

    if (!values.length) {
      return {
        stage,
        label: stageLabel(stage),
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        lower: 0,
        iqr: 0,
        count: 0,
      };
    }

    const min = values[0];
    const max = values[values.length - 1];
    const q1 = percentile(values, 0.25);
    const median = percentile(values, 0.5);
    const q3 = percentile(values, 0.75);

    return {
      stage,
      label: stageLabel(stage),
      min: Number(min.toFixed(1)),
      q1: Number(q1.toFixed(1)),
      median: Number(median.toFixed(1)),
      q3: Number(q3.toFixed(1)),
      max: Number(max.toFixed(1)),
      lower: Number(q1.toFixed(1)),
      iqr: Number((q3 - q1).toFixed(1)),
      count: values.length,
    };
  });
}

function stageRidgelineData(tapes: TapeRecord[]) {
  const bins: Array<{ key: string; min: number; max: number }> = [
    { key: "0-15", min: 0, max: 15 },
    { key: "16-30", min: 16, max: 30 },
    { key: "31-45", min: 31, max: 45 },
    { key: "46-60", min: 46, max: 60 },
    { key: "61-90", min: 61, max: 90 },
    { key: "91-120", min: 91, max: 120 },
    { key: "121-150", min: 121, max: 150 },
    { key: "151-180", min: 151, max: 180 },
    { key: "181+", min: 181, max: Number.POSITIVE_INFINITY },
  ];

  return STAGES.map((stage) => {
    const values = tapes
      .filter((tape) => tape.stage === stage)
      .map((tape) => runtimeForTape(tape))
      .filter((value): value is number => typeof value === "number");

    const counts = bins.map((bin) => ({
      bucket: bin.key,
      count: values.filter((value) => value >= bin.min && value <= bin.max).length,
    }));
    const max = Math.max(1, ...counts.map((item) => item.count));
    const points = counts.map((item) => ({ bucket: item.bucket, density: item.count / max }));
    return { stage, label: stageLabel(stage), points };
  });
}

function runtimeDensityGrid(tapes: TapeRecord[]) {
  const runtimeBins: Array<{ key: string; min: number; max: number }> = [
    { key: "0-15", min: 0, max: 15 },
    { key: "16-30", min: 16, max: 30 },
    { key: "31-45", min: 31, max: 45 },
    { key: "46-60", min: 46, max: 60 },
    { key: "61-90", min: 61, max: 90 },
    { key: "91-120", min: 91, max: 120 },
    { key: "121-150", min: 121, max: 150 },
    { key: "151-180", min: 151, max: 180 },
    { key: "181+", min: 181, max: Number.POSITIVE_INFINITY },
  ];

  // Always show a continuous weekly range so columns are predictable.
  const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekKeys = Array.from({ length: 12 }, (_, idx) =>
    format(subWeeks(currentWeek, 11 - idx), "yyyy-MM-dd")
  );

  const grid = runtimeBins.map((runtime) => ({
    runtime: runtime.key,
    cells: weekKeys.map((week) => {
      const count = tapes.filter((tape) => {
        const runtimeValue = runtimeForTape(tape);
        const dateValue = tape.acquisitionAt ?? tape.receivedDate;
        if (runtimeValue == null || !dateValue) return false;
        const weekValue = format(startOfWeek(parseISO(dateValue), { weekStartsOn: 1 }), "yyyy-MM-dd");
        return weekValue === week && runtimeValue >= runtime.min && runtimeValue <= runtime.max;
      }).length;
      return { week, count };
    }),
  }));

  const maxCount = Math.max(1, ...grid.flatMap((row) => row.cells.map((cell) => cell.count)));
  return { weekKeys, grid, maxCount };
}

function densityColor(count: number, max: number) {
  const intensity = count / max;
  const alpha = 0.08 + intensity * 0.92;
  return `rgba(13, 148, 136, ${alpha.toFixed(3)})`;
}

export default function AnalyticsPage() {
  const { data, error, isLoading } = useOpsSummary();

  const scatter = data ? runtimeScatterData(data.tapes) : [];
  const cdf = data ? cdfData(data.tapes) : [];
  const box = data ? stageBoxData(data.tapes) : [];
  const ridges = data ? stageRidgelineData(data.tapes) : [];
  const density = data ? runtimeDensityGrid(data.tapes) : null;

  return (
    <div>
      <Topbar
        title="Runtime Analytics"
        subtitle="Scatter, box, ridgeline, CDF, and density views of tape runtime behavior."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-sm text-danger">{error.message}</p>}

      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.labelRuntime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QT Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.qtRuntime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Final Runtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <HistogramChart data={data.runtimeHistograms.finalRuntime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Progress Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Awaiting Capture</p>
                  <p className="text-2xl font-semibold">{data.kpis.awaitingCaptureCount}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Captured</p>
                  <p className="text-2xl font-semibold">{data.kpis.capturedCount}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Trimmed</p>
                  <p className="text-2xl font-semibold">{data.kpis.trimmedCount}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Combined</p>
                  <p className="text-2xl font-semibold">{data.kpis.combinedCount}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Transferred</p>
                  <p className="text-2xl font-semibold">{data.kpis.transferredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Runtime Averages (HH:MM:SS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Label RT</p>
                  <p className="text-2xl font-semibold">{formatDurationHMSFromMinutes(data.runtimeStats.labelAverage)}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">QT RT</p>
                  <p className="text-2xl font-semibold">{formatDurationHMSFromMinutes(data.runtimeStats.qtAverage)}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Final RT</p>
                  <p className="text-2xl font-semibold">{formatDurationHMSFromMinutes(data.runtimeStats.finalAverage)}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Runtime Drift</p>
                  <p className="text-2xl font-semibold">{formatDurationHMSFromMinutes(data.runtimeStats.driftAverage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Runtime Scatter (Cataloged Date vs Runtime)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 10, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" />
                    <XAxis
                      type="number"
                      dataKey="ts"
                      tickFormatter={(value) => format(new Date(value), "yyyy-MM-dd")}
                      domain={["dataMin", "dataMax"]}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis type="number" dataKey="runtime" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, key) =>
                        key === "runtime" ? `${Number(value).toFixed(1)} min` : value
                      }
                      labelFormatter={(value) => format(new Date(Number(value)), "MMM d, yyyy")}
                    />
                    <Scatter data={scatter} fill="hsl(171 45% 34%)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stage Runtime Box Plot (Approx)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer>
                  <ComposedChart data={box} margin={{ top: 10, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} height={55} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area dataKey="lower" fill="transparent" stroke="transparent" />
                    <Area dataKey="iqr" fill="hsl(171 45% 34% / 0.35)" stroke="hsl(171 45% 34%)" />
                    <Scatter dataKey="min" fill="hsl(16 85% 52%)" />
                    <Scatter dataKey="median" fill="hsl(45 93% 47%)" />
                    <Scatter dataKey="max" fill="hsl(197 72% 44%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Runtime CDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={cdf} margin={{ top: 10, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35 18% 83%)" />
                    <XAxis dataKey="runtime" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="pct" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number, key) => (key === "pct" ? `${value.toFixed(1)}%` : value)} />
                    <Area dataKey="pct" stroke="hsl(171 45% 34%)" fill="hsl(171 45% 34% / 0.24)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stage Ridgeline-Style Runtime Curves</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ridges.map((ridge) => (
                <div key={ridge.stage} className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <p className="text-xs font-medium text-muted-foreground">{ridge.label}</p>
                  <div className="h-[58px] w-full">
                    <ResponsiveContainer>
                      <AreaChart data={ridge.points} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                        <Area
                          dataKey="density"
                          stroke="hsl(171 45% 34%)"
                          fill="hsl(171 45% 34% / 0.24)"
                          strokeWidth={1.5}
                          type="monotone"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Runtime Density Heatmap (Hexbin-Style)</CardTitle>
            </CardHeader>
            <CardContent>
              {density && density.weekKeys.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-1 pr-2">Runtime</th>
                        {density.weekKeys.map((week) => (
                          <th key={week} className="px-1 py-1 text-center font-mono">
                            {week}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {density.grid.map((row) => (
                        <tr key={row.runtime} className="border-t">
                          <td className="pr-2 py-1 font-medium">{row.runtime}</td>
                          {row.cells.map((cell) => (
                            <td key={`${row.runtime}-${cell.week}`} className="px-1 py-1">
                              <div
                                className="mx-auto h-5 w-5 rounded-sm border border-white/40"
                                style={{ backgroundColor: densityColor(cell.count, density.maxCount) }}
                                title={`${row.runtime} / ${cell.week}: ${cell.count}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough dated runtime points to build density yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
