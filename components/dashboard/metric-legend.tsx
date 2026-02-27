import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricLegend({
  runtimeDriftCoveragePercent,
  hasCompletionDates,
}: {
  runtimeDriftCoveragePercent: number;
  hasCompletionDates: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metric Definitions + Meme Scale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="font-semibold">Needs Review (Inferred):</span> derived from heuristics like missing QT file,
          runtime mismatch, or stuck stage transitions. It is not an explicit Airtable field yet.
        </p>
        <p>
          <span className="font-semibold">Avg Runtime Drift (min):</span> average absolute difference between source
          runtime (`Label RT`) and output runtime (`Final Clip Duration`, fallback `QT TRT`). Coverage: {runtimeDriftCoveragePercent}% of tapes.
        </p>
        <p>
          <span className="font-semibold">Transferred to NAS (%):</span> share of tapes where `Transferred to NAS` is
          checked.
        </p>
        <p>
          <span className="font-semibold">Meme Scale:</span> `This is fine` = healthy queue, `This is fine (but monitor)`
          = risk rising, `Elmo with flames` = high blocked ratio or long-wait outliers.
        </p>
        {!hasCompletionDates && (
          <p className="rounded-md bg-amber-50 p-2 text-amber-900">
            Completion timestamp field not configured, so completion-over-time and backlog-over-time are intentionally
            limited to avoid misleading dates.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
