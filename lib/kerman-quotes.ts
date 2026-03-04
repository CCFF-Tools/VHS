import type { MissionState } from "@/lib/types";

export type KermanQuoteTheme = "status" | "tasks" | "wisdom";

export interface KermanQuote {
  speaker: string;
  line: string;
  theme: KermanQuoteTheme;
  tags: readonly string[];
}

export const KERMAN_QUOTE_BANK: readonly KermanQuote[] = [
  {
    speaker: "Genev Kerman",
    line: "Flight Director log: launch window is open. Keep capture feeding archiving.",
    theme: "status",
    tags: ["general", "launch_ready", "capture_push", "seal_push", "deadline_inside"],
  },
  {
    speaker: "Genev Kerman",
    line: "Hold formation. Clear blockers before they become trajectory errors.",
    theme: "tasks",
    tags: ["general", "launch_hold", "quarantine", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Checklist discipline beats sprinting every time.",
    theme: "wisdom",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "NoCap memory moves only when each stage hands off clean.",
    theme: "wisdom",
    tags: ["general", "capture_push", "planning_push", "seal_push", "archive"],
  },

  {
    speaker: "Dexrin Kerman",
    line: "Window analysis: delay compounds faster than anyone admits.",
    theme: "status",
    tags: ["general", "launch_hold", "deadline_inside"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Signal Fade does not wait for perfect conditions.",
    theme: "wisdom",
    tags: ["general", "deadline_missed", "magnetic"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Cut queue age, then lock trim and combine cadence.",
    theme: "tasks",
    tags: ["general", "capture_push", "planning_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "If the curve drifts right, tighten every handoff left.",
    theme: "tasks",
    tags: ["general", "launch_hold", "planning_push"],
  },

  {
    speaker: "Rivet Kerman",
    line: "Capture deck green. Move fragile reels first.",
    theme: "status",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Dropped frames are lost civic facts. Run steady.",
    theme: "wisdom",
    tags: ["general", "capture_push"],
  },
  {
    speaker: "Rivet Kerman",
    line: "One clean pass beats three rushed retries.",
    theme: "wisdom",
    tags: ["general", "capture_push", "planning_push"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Airframe grows only on captured minutes.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },

  {
    speaker: "Paxlo Kerman",
    line: "Trim and Combine are the guidance computer. Keep both synchronized.",
    theme: "status",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Unmerged segments are unresolved risk.",
    theme: "wisdom",
    tags: ["general", "planning_push", "launch_hold"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Lock in and out points before every export burn.",
    theme: "tasks",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Course stability comes from repeatable edits.",
    theme: "wisdom",
    tags: ["general", "planning_push", "deadline_inside"],
  },

  {
    speaker: "Splicia Kerman",
    line: "Integration report: naming and metadata are within tolerance.",
    theme: "status",
    tags: ["general", "planning_push", "launch_ready"],
  },
  {
    speaker: "Splicia Kerman",
    line: "When two cuts conflict, follow documented intent.",
    theme: "tasks",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Continuity check first, transfer second.",
    theme: "tasks",
    tags: ["general", "planning_push", "seal_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "If provenance is fuzzy, payload is not flight-ready.",
    theme: "wisdom",
    tags: ["general", "planning_push", "launch_hold"],
  },

  {
    speaker: "Mallo Kerman",
    line: "Pad ops: transfers clear only after checksum and runtime verification.",
    theme: "status",
    tags: ["general", "seal_push", "launch_ready"],
  },
  {
    speaker: "Mallo Kerman",
    line: "No partial checks on a launch-bound payload.",
    theme: "tasks",
    tags: ["general", "seal_push", "launch_hold"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Stage batches, log each transfer, then release.",
    theme: "tasks",
    tags: ["general", "seal_push", "planning_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Pressure is not permission to skip preflight.",
    theme: "wisdom",
    tags: ["general", "deadline_inside", "seal_push"],
  },

  {
    speaker: "Nora Kerman",
    line: "Archiving update: certified reels move colonization forward.",
    theme: "status",
    tags: ["general", "archive", "stacks_growth", "launch_ready"],
  },
  {
    speaker: "Nora Kerman",
    line: "No archiving, no settlement.",
    theme: "wisdom",
    tags: ["general", "seal_push", "launch_hold"],
  },
  {
    speaker: "Nora Kerman",
    line: "Chain-of-custody keeps The Stacks trustworthy.",
    theme: "wisdom",
    tags: ["general", "archive", "stacks_growth"],
  },
  {
    speaker: "Nora Kerman",
    line: "Prioritize high-value civic reels until the window stabilizes.",
    theme: "tasks",
    tags: ["general", "seal_push", "capture_push", "deadline_inside"],
  },

  {
    speaker: "Bitra Kerman",
    line: "Telemetry is clean enough to act. Keep trend discipline.",
    theme: "status",
    tags: ["general", "launch_ready", "planning_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Close date and runtime gaps before the next command brief.",
    theme: "tasks",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "No owner, no metric. No metric, no control.",
    theme: "wisdom",
    tags: ["general", "planning_push", "launch_hold"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Cataloged-per-day is our heartbeat under Core Cascade.",
    theme: "status",
    tags: ["general", "capture_push", "magnetic"],
  },

  {
    speaker: "Vexa Kerman",
    line: "Quarantine notice: blocked work is drag, not backlog.",
    theme: "status",
    tags: ["general", "quarantine", "launch_hold"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Resolve root cause before reopening queue lanes.",
    theme: "tasks",
    tags: ["general", "quarantine"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Fast fixes without notes become repeat incidents.",
    theme: "wisdom",
    tags: ["general", "quarantine", "planning_push"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Quality is the only velocity that survives Signal Fade.",
    theme: "wisdom",
    tags: ["general", "quarantine", "deadline_inside", "magnetic"],
  },

  {
    speaker: "Mira Kerman",
    line: "Science update: Core Cascade variance remains hostile.",
    theme: "status",
    tags: ["general", "magnetic", "deadline_missed"],
  },
  {
    speaker: "Mira Kerman",
    line: "Older magnetic stock first. Entropy compounds.",
    theme: "tasks",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Treat weak tape like reentry hardware: gentle and deliberate.",
    theme: "wisdom",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Signal Fade starts gradual, then sudden. Do not coast.",
    theme: "wisdom",
    tags: ["general", "magnetic", "deadline_inside", "deadline_missed"],
  },

  {
    speaker: "Jebrin Kerman",
    line: "EVA capture log: heads clean, alignment true, lane nominal.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Feed me the reels that still whisper. We can still recover them.",
    theme: "status",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Stabilize tracking before you press ahead.",
    theme: "tasks",
    tags: ["general", "capture_push", "planning_push"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Every rescued frame preserves a public record.",
    theme: "wisdom",
    tags: ["general", "capture_push", "archive"],
  },

  {
    speaker: "Valdo Kerman",
    line: "Runway marshal update: rollout stays green when queues stay short.",
    theme: "status",
    tags: ["general", "launch_ready", "capture_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Finished work to the front, uncertain work to quarantine.",
    theme: "tasks",
    tags: ["general", "launch_hold", "quarantine"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Clear transfer bottlenecks before opening the gate.",
    theme: "tasks",
    tags: ["general", "seal_push", "planning_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "When the window narrows, remove options, not standards.",
    theme: "wisdom",
    tags: ["general", "deadline_inside", "launch_hold"],
  },
] as const;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function quoteKey(quote: KermanQuote): string {
  return `${quote.speaker}|${quote.line}`;
}

function stableOrder(quotes: readonly KermanQuote[], seed: number): KermanQuote[] {
  return [...quotes].sort((left, right) => {
    const leftScore = hashString(`${seed}|${quoteKey(left)}`);
    const rightScore = hashString(`${seed}|${quoteKey(right)}`);
    return leftScore - rightScore;
  });
}

function activeMissionTags(state: MissionState): Set<string> {
  const tags = new Set<string>();
  tags.add("general");

  if (state.deadline.status === "missed") {
    tags.add("deadline_missed");
  } else {
    tags.add("deadline_inside");
  }

  if (state.overlays.quarantine || state.counts.blocked > 0) {
    tags.add("quarantine");
  }

  if (state.gates.launchAllowed) {
    tags.add("launch_ready");
  } else {
    tags.add("launch_hold");
  }

  if (state.gates.stacksGrowthAllowed) {
    tags.add("stacks_growth");
  } else {
    tags.add("seal_push");
  }

  if (state.counts.intake > 0 || state.counts.captured < state.counts.total) {
    tags.add("capture_push");
  }

  if (state.counts.combined + state.counts.transferred < state.counts.captured) {
    tags.add("planning_push");
  }

  if (state.counts.archived > 0) {
    tags.add("archive");
  }

  if (state.deadline.status === "missed" || state.counts.blocked > 0) {
    tags.add("magnetic");
  }

  return tags;
}

function prioritizedTagOrder(tags: Set<string>): string[] {
  const order = [
    "general",
    "quarantine",
    "deadline_missed",
    "launch_hold",
    "seal_push",
    "capture_push",
    "planning_push",
    "archive",
    "stacks_growth",
    "launch_ready",
    "deadline_inside",
    "magnetic",
  ];

  return order.filter((tag) => tags.has(tag));
}

function missionSeed(state: MissionState): number {
  return hashString(
    [
      state.deadline.status,
      state.milestones.assembly,
      state.milestones.planning,
      state.milestones.colonization,
      state.counts.total,
      state.counts.intake,
      state.counts.captured,
      state.counts.trimmed,
      state.counts.combined,
      state.counts.transferred,
      state.counts.archived,
      state.counts.blocked,
      state.gates.launchAllowed ? "launch-ok" : "launch-hold",
      state.gates.stacksGrowthAllowed ? "stacks-ok" : "stacks-hold",
      state.overlays.quarantine ? "quarantine" : "clear",
    ].join("|")
  );
}

function pickSpeakerDiverse(quotes: readonly KermanQuote[], limit: number): KermanQuote[] {
  const selected: KermanQuote[] = [];
  const selectedKeys = new Set<string>();
  const usedSpeakers = new Set<string>();

  for (const quote of quotes) {
    const key = quoteKey(quote);
    if (selected.length >= limit) break;
    if (selectedKeys.has(key) || usedSpeakers.has(quote.speaker)) continue;
    selected.push(quote);
    selectedKeys.add(key);
    usedSpeakers.add(quote.speaker);
  }

  for (const quote of quotes) {
    const key = quoteKey(quote);
    if (selected.length >= limit) break;
    if (selectedKeys.has(key)) continue;
    selected.push(quote);
    selectedKeys.add(key);
  }

  return selected;
}

export function getMissionBriefingQuotes(state: MissionState, limit = 8): KermanQuote[] {
  const cappedLimit = Math.max(1, Math.min(limit, KERMAN_QUOTE_BANK.length));
  const tags = activeMissionTags(state);
  const orderedTags = prioritizedTagOrder(tags);
  const seed = missionSeed(state);

  const stacked: KermanQuote[] = [];
  const seen = new Set<string>();

  orderedTags.forEach((tag, index) => {
    const taggedQuotes = stableOrder(
      KERMAN_QUOTE_BANK.filter((quote) => quote.tags.includes(tag)),
      seed + index * 97
    );
    for (const quote of taggedQuotes) {
      const key = quoteKey(quote);
      if (seen.has(key)) continue;
      stacked.push(quote);
      seen.add(key);
    }
  });

  const fallback = stableOrder(KERMAN_QUOTE_BANK, seed + 1229);
  for (const quote of fallback) {
    const key = quoteKey(quote);
    if (seen.has(key)) continue;
    stacked.push(quote);
    seen.add(key);
  }

  return pickSpeakerDiverse(stacked, cappedLimit);
}
