import Link from "next/link";
import { AlertCircle, CalendarClock } from "lucide-react";
import type { TapeRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { StageBadge } from "@/components/board/stage-badge";

export function KanbanCard({ tape }: { tape: TapeRecord }) {
  return (
    <Link
      href={`/tapes/${tape.id}`}
      className="block rounded-md border bg-white p-3 text-sm transition-transform hover:-translate-y-0.5"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{tape.tapeId}</p>
          <p className="line-clamp-1 text-sm font-semibold">{tape.tapeName}</p>
        </div>
        <StageBadge stage={tape.stage} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge>{tape.priority}</Badge>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" /> {tape.ageInStageDays}d in stage
        </span>
      </div>

      {tape.issueTags.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5" /> {tape.issueTags.join(", ")}
        </div>
      )}
    </Link>
  );
}
