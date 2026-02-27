import type { Stage } from "@/lib/types";

const LABELS: Record<Stage, string> = {
  Intake: "Awaiting Capture",
  Capture: "Captured",
  Trim: "Trimmed",
  Combine: "Combined",
  Transfer: "Transferred",
  Archived: "Archived",
  Blocked: "Blocked",
};

export function stageLabel(stage: Stage | string) {
  return LABELS[stage as Stage] ?? String(stage);
}
