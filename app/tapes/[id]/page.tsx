import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageTimeline } from "@/components/detail/stage-timeline";
import { ActionPanel } from "@/components/detail/action-panel";
import { getTapes } from "@/lib/data";

export default async function TapeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tapes = await getTapes();
  const tape = tapes.find((t) => t.id === id);
  if (!tape) notFound();

  const related = tapes.filter((t) => t.id !== tape.id && t.tapeSequence && t.tapeSequence === tape.tapeSequence);

  return (
    <div>
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Tape Detail</p>
        <h2 className="text-3xl font-semibold tracking-tight">{tape.tapeName}</h2>
        <p className="text-sm text-muted-foreground">{tape.tapeId}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stage Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StageTimeline current={tape.stage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Stage: <Badge className="ml-2">{tape.stage}</Badge>
            </p>
            <p>Received: {tape.receivedDate ? new Date(tape.receivedDate).toLocaleDateString() : "n/a"}</p>
            <p>Label Runtime: {tape.labelRuntimeMinutes ?? "n/a"} min</p>
            <p>QT Runtime: {tape.qtRuntimeMinutes ?? "n/a"} min</p>
            <p>QT Filename: {tape.qtFilename ?? "n/a"}</p>
            <p>Archival Filename: {tape.archivalFilename ?? "n/a"}</p>
            <p>Final Duration: {tape.finalClipDurationMinutes ?? "n/a"} min</p>
            <p>Priority: {tape.priority}</p>
            {tape.issueTags.length > 0 && <p>Issues: {tape.issueTags.join(", ")}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionPanel tapeId={tape.id} defaultStage={tape.stage} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Related Tapes</CardTitle>
        </CardHeader>
        <CardContent>
          {related.length ? (
            <div className="space-y-2">
              {related.map((item) => (
                <Link key={item.id} href={`/tapes/${item.id}`} className="block rounded-md border p-3 hover:bg-muted">
                  <p className="font-semibold">{item.tapeName}</p>
                  <p className="text-xs text-muted-foreground">{item.tapeId}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No related tapes found for this sequence.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
