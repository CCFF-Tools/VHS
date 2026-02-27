import { CheckCircle2, Circle } from "lucide-react";
import { stageLabel } from "@/lib/stage-label";
import type { Stage } from "@/lib/types";

const stages: Stage[] = ["Intake", "Capture", "Trim", "Combine", "Transfer", "Archived"];

export function StageTimeline({ current }: { current: Stage }) {
  const currentIndex = stages.indexOf(current);

  return (
    <ol className="space-y-3">
      {stages.map((stage, idx) => {
        const done = idx <= currentIndex;
        return (
          <li key={stage} className="flex items-center gap-2 text-sm">
            {done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted" />}
            <span className={done ? "font-semibold" : "text-muted-foreground"}>{stageLabel(stage)}</span>
          </li>
        );
      })}
    </ol>
  );
}
