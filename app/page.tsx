"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/layout/topbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { ThroughputChart } from "@/components/charts/throughput-chart";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { BacklogAreaChart } from "@/components/charts/backlog-area-chart";
import { BottleneckCallouts } from "@/components/dashboard/bottleneck-callouts";
import { MemeAlert } from "@/components/dashboard/meme-alert";
import { MetricLegend } from "@/components/dashboard/metric-legend";
import { useOpsSummary } from "@/lib/hooks/use-api";

function queueMood(args: { blockedQueue: number; intakeQueue: number; captureQueue: number; processingQueue: number; transferQueue: number; oldestDays: number }) {
  const queueTotal = args.intakeQueue + args.captureQueue + args.processingQueue + args.transferQueue;
  const blockedRate = queueTotal ? args.blockedQueue / queueTotal : 0;

  if (blockedRate >= 0.28 || args.oldestDays >= 18) return "flames" as const;
  if (blockedRate >= 0.14 || args.oldestDays >= 10) return "watch" as const;
  return "fine" as const;
}

export default function HomePage() {
  const { data, isLoading, error } = useOpsSummary();

  return (
    <div>
      <Topbar title="Operations Dashboard" subtitle="Live pulse of intake, capture, quality, and delivery." />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      )}

      {error && <Card><CardContent className="pt-5 text-sm text-danger">Failed to load dashboard: {error.message}</CardContent></Card>}

      {data && (
        <div className="space-y-4">
          <MemeAlert
            mode={queueMood({
              blockedQueue: data.kpis.blockedQueue,
              intakeQueue: data.kpis.intakeQueue,
              captureQueue: data.kpis.captureQueue,
              processingQueue: data.kpis.processingQueue,
              transferQueue: data.kpis.transferQueue,
              oldestDays: data.oldestWaiting?.ageInStageDays ?? 0,
            })}
            title="Queue health at a glance"
            description="This banner reacts to blocked ratio and oldest waiting tape age so you can spot fire-drill days immediately."
            right={
              <div className="space-y-1">
                <p>Blocked queue: {data.kpis.blockedQueue}</p>
                <p>Oldest waiting: {data.oldestWaiting?.ageInStageDays ?? 0}d</p>
              </div>
            }
          />
          <KpiGrid kpis={data.kpis} />
          <BottleneckCallouts summary={data} />

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Intake vs Archived Output (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <ThroughputChart data={data.throughputDaily} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Where Tapes Are Right Now</CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineFlowChart data={data.stageCounts} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Backlog Pressure (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.backlogTrend.length > 0 ? (
                <BacklogAreaChart data={data.backlogTrend} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Backlog trend needs a real completion date field in Airtable to avoid fake time-series.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sequence Completion Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Sequence</th>
                      <th>Expected</th>
                      <th>Captured</th>
                      <th>Archived</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sequenceProgress.slice(0, 8).map((row) => (
                      <tr key={row.sequence} className="border-t">
                        <td className="py-2 font-medium">{row.sequence}</td>
                        <td>{row.expected}</td>
                        <td>{row.captured}</td>
                        <td>{row.archived}</td>
                        <td>{row.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <MetricLegend
            runtimeDriftCoveragePercent={data.dataReadiness.runtimeDriftCoveragePercent}
            hasCompletionDates={data.dataReadiness.hasCompletionDates}
          />
        </div>
      )}
    </div>
  );
}
