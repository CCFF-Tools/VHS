"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/layout/topbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { ThroughputChart } from "@/components/charts/throughput-chart";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { BacklogAreaChart } from "@/components/charts/backlog-area-chart";
import { BottleneckCallouts } from "@/components/dashboard/bottleneck-callouts";
import { useOpsSummary } from "@/lib/hooks/use-api";

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
          <KpiGrid kpis={data.kpis} />
          <BottleneckCallouts summary={data} />

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Throughput (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <ThroughputChart data={data.throughputDaily} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineFlowChart data={data.stageCounts} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Backlog Size Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <BacklogAreaChart data={data.backlogTrend} />
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
        </div>
      )}
    </div>
  );
}
