"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/layout/topbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { AcquisitionChart } from "@/components/charts/acquisition-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { stageLabel } from "@/lib/stage-label";

function formatDateTime(value?: string) {
  if (!value) return "n/a";
  try {
    return format(parseISO(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
}

export default function HomePage() {
  const { data, isLoading, error } = useOpsSummary();

  return (
    <div>
      <Topbar
        title="VHS Operations Snapshot"
        subtitle="Captured, trimmed, combined, transferred, acquisition timeline, and runtime distributions."
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-5 text-sm text-danger">Failed to load dashboard: {error.message}</CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          <KpiGrid kpis={data.kpis} />

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Stage Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineFlowChart
                  data={data.stageCounts.map((s) => ({ stage: stageLabel(s.stage), count: s.count }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acquisitions Per Day (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <AcquisitionChart data={data.acquisitionDaily} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Captures Per Day (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.capturedDateCoveragePercent > 0 ? (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Capture date coverage: {data.capturedDateCoveragePercent}%
                  </p>
                  <AcquisitionChart data={data.capturedDaily} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No captured timestamp data yet. Set `AIRTABLE_CAPTURED_AT_FIELD` to your imported movie file
                  creation-time field when available.
                </p>
              )}
            </CardContent>
          </Card>

          <section className="grid gap-4 lg:grid-cols-3">
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
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Recent Acquisitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                <p>Avg Label RT: <span className="font-semibold text-foreground">{data.runtimeStats.labelAverage}m</span></p>
                <p>Avg QT RT: <span className="font-semibold text-foreground">{data.runtimeStats.qtAverage}m</span></p>
                <p>Avg Final RT: <span className="font-semibold text-foreground">{data.runtimeStats.finalAverage}m</span></p>
                <p>Avg Drift: <span className="font-semibold text-foreground">{data.runtimeStats.driftAverage}m</span></p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">📼 Sticker</th>
                      <th>Tape Name</th>
                      <th>Acquired At</th>
                      <th>Rec Date</th>
                      <th>Label</th>
                      <th>QT</th>
                      <th>Final</th>
                      <th>C/T/Cmb/NAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAcquisitions.map((tape) => (
                      <tr key={tape.id} className="border-t">
                        <td className="py-2 font-mono text-xs">{tape.tapeId}</td>
                        <td className="font-medium">{tape.tapeName}</td>
                        <td>{formatDateTime(tape.acquisitionAt)}</td>
                        <td>{formatDateTime(tape.receivedDate)}</td>
                        <td>{tape.labelRuntimeMinutes ?? "-"}</td>
                        <td>{tape.qtRuntimeMinutes ?? "-"}</td>
                        <td>{tape.finalClipDurationMinutes ?? "-"}</td>
                        <td className="font-mono text-xs">
                          {tape.captured ? "Y" : "N"}/{tape.trimmed ? "Y" : "N"}/{tape.combined ? "Y" : "N"}/
                          {tape.transferredToNas ? "Y" : "N"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
