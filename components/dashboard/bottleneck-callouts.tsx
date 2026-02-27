import Link from "next/link";
import { AlertTriangle, Clock3, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OpsSummaryResponse } from "@/lib/types";

export function BottleneckCallouts({ summary }: { summary: OpsSummaryResponse }) {
  return (
    <section className="grid gap-3 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Layers className="h-4 w-4" /> Largest Queue Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{summary.largestQueueStage?.stage ?? "n/a"}</p>
          <p className="text-sm text-muted-foreground">{summary.largestQueueStage?.count ?? 0} tapes waiting in this step</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Clock3 className="h-4 w-4" /> Oldest Waiting Tape
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.oldestWaiting ? (
            <>
              <Link href={`/tapes/${summary.oldestWaiting.id}`} className="text-lg font-semibold hover:underline">
                {summary.oldestWaiting.tapeId}
              </Link>
              <p className="text-sm text-muted-foreground">
                {summary.oldestWaiting.ageInStageDays} days parked in {summary.oldestWaiting.stage}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No waiting tapes. This is fine.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <AlertTriangle className="h-4 w-4" /> Common Issue Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.issueTagCounts.length ? (
            <div className="space-y-1">
              {summary.issueTagCounts.slice(0, 3).map((tag) => (
                <p key={tag.tag} className="text-sm">
                  <span className="font-semibold">{tag.tag}</span>
                  <span className="text-muted-foreground"> · {tag.count}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No issue tags inferred.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
