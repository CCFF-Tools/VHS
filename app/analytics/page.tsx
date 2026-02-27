"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";

export default function AnalyticsPage() {
  const { data, error, isLoading } = useOpsSummary();

  return (
    <div>
      <Topbar
        title="Runtime Analytics"
        subtitle="Focus on runtime behavior and current workflow distribution."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-sm text-danger">{error.message}</p>}

      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Label Runtime Distribution</CardTitle>
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
              <CardTitle>Runtime Averages (minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Label RT</p>
                  <p className="text-2xl font-semibold">{data.runtimeStats.labelAverage}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">QT RT</p>
                  <p className="text-2xl font-semibold">{data.runtimeStats.qtAverage}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Final RT</p>
                  <p className="text-2xl font-semibold">{data.runtimeStats.finalAverage}</p>
                </div>
                <div className="rounded-md border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Runtime Drift</p>
                  <p className="text-2xl font-semibold">{data.runtimeStats.driftAverage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
