"use client";

import { format, getISOWeek, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { HistogramChart } from "@/components/charts/histogram-chart";
import { IssueTagsChart } from "@/components/charts/issue-tags-chart";
import { PipelineFlowChart } from "@/components/charts/pipeline-flow-chart";
import { useOpsSummary } from "@/lib/hooks/use-api";
import { MemeAlert } from "@/components/dashboard/meme-alert";

function cohortData(dates: string[]) {
  const map = new Map<string, number>();
  for (const date of dates) {
    const d = parseISO(date);
    const key = `${format(d, "yyyy")}-W${getISOWeek(d)}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => a.stage.localeCompare(b.stage));
}

function stageAgingHeatmapInput(
  tapes: Array<{ stage: string; ageInStageDays: number }>
): Array<{ stage: string; "0-2": number; "3-5": number; "6-10": number; "11+": number }> {
  const buckets = [
    { key: "0-2", min: 0, max: 2 },
    { key: "3-5", min: 3, max: 5 },
    { key: "6-10", min: 6, max: 10 },
    { key: "11+", min: 11, max: Number.POSITIVE_INFINITY },
  ] as const;

  const stages = [...new Set(tapes.map((t) => t.stage))];
  return stages.map((stage) => {
    const row = { stage, "0-2": 0, "3-5": 0, "6-10": 0, "11+": 0 };
    for (const tape of tapes.filter((t) => t.stage === stage)) {
      const b = buckets.find((x) => tape.ageInStageDays >= x.min && tape.ageInStageDays <= x.max);
      if (b) row[b.key] += 1;
    }
    return row;
  });
}

export default function AnalyticsPage() {
  const { data, error, isLoading } = useOpsSummary();

  const analyticsMood = (() => {
    if (!data) return "fine" as const;
    const highDrift = data.runtimeDriftHistogram.find((b) => b.bucket === "11m+")?.count ?? 0;
    const total = data.tapes.length || 1;
    const highDriftRate = highDrift / total;

    if (highDriftRate >= 0.24) return "flames" as const;
    if (highDriftRate >= 0.1) return "watch" as const;
    return "fine" as const;
  })();

  return (
    <div>
      <Topbar
        title="Analytics Deep Dive"
        subtitle="Runtime drift, stage aging, weekly cohorts, and sequence completion health."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-sm text-danger">{error.message}</p>}

      {data && (
        <div>
          <MemeAlert
            mode={analyticsMood}
            title="Quality signal"
            description="This mode is driven by high runtime drift incidence. If Elmo appears, prioritize QC and recapture checks."
            right={
              <p>
                Avg runtime drift: <span className="font-semibold text-foreground">{data.kpis.avgRuntimeDriftMinutes} min</span>
              </p>
            }
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Runtime Drift Histogram</CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart data={data.runtimeDriftHistogram} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Issue Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <IssueTagsChart data={data.issueTagCounts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohorts by Week Received</CardTitle>
              </CardHeader>
              <CardContent>
                <PipelineFlowChart
                  data={cohortData(data.tapes.map((t) => t.receivedDate).filter((d): d is string => Boolean(d)))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Aging Heatmap (table)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-2">Stage</th>
                        <th>0-2d</th>
                        <th>3-5d</th>
                        <th>6-10d</th>
                        <th>11+d</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stageAgingHeatmapInput(data.tapes).map((row) => (
                        <tr key={row.stage} className="border-t">
                          <td className="py-2 font-medium">{row.stage}</td>
                          <td>{row["0-2"]}</td>
                          <td>{row["3-5"]}</td>
                          <td>{row["6-10"]}</td>
                          <td>{row["11+"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sequence Progress</CardTitle>
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
                        <th>Complete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sequenceProgress.map((row) => (
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
        </div>
      )}
    </div>
  );
}
