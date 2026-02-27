import type { Stage } from "@/lib/types";

const LABELS: Record<Stage, string> = {
  Intake: "Awaiting Capture",
  Capture: "Capture",
  Trim: "Trim",
  Combine: "Combine",
  Transfer: "Transfer",
  Archived: "Archived",
  Blocked: "Blocked",
};

export function stageLabel(stage: Stage | string) {
  return LABELS[stage as Stage] ?? String(stage);
}
