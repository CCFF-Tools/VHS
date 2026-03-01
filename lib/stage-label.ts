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

export function stageFromLabel(label: string): Stage | undefined {
  const normalized = label.trim().toLowerCase();
  const entry = (Object.entries(LABELS) as Array<[Stage, string]>).find(
    ([stage, display]) => stage.toLowerCase() === normalized || display.toLowerCase() === normalized
  );
  return entry?.[0];
}
