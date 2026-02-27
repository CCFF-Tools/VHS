import { stageColorMap } from "@/lib/schema";
import { stageLabel } from "@/lib/stage-label";
import type { Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", stageColorMap[stage])}>
      {stageLabel(stage)}
    </span>
  );
}
