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
    line: "Flight report: launch lane is stable if capture keeps feeding archive prep.",
    theme: "status",
    tags: ["launch_ready", "capture_push", "seal_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Tasking for this shift: clear intake, verify catalog, queue archiving.",
    theme: "tasks",
    tags: ["capture_push", "planning_push", "seal_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "A calm cockpit starts with clean metadata.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Do not confuse speed with vector; trim and combine define trajectory.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "When Core Cascade spikes, discipline is propulsion.",
    theme: "wisdom",
    tags: ["magnetic", "deadline_missed"],
  },
  {
    speaker: "Genev Kerman",
    line: "Meridia rewards cadence, not heroics.",
    theme: "wisdom",
    tags: ["stacks_growth", "archive", "launch_ready"],
  },
  {
    speaker: "Genev Kerman",
    line: "Status is green enough to move and red enough to stay sharp.",
    theme: "status",
    tags: ["launch_ready", "deadline_inside"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Window math update: every blocked reel subtracts daylight from launch.",
    theme: "status",
    tags: ["launch_hold", "quarantine", "deadline_inside"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "If projected launch drifts right, tighten handoffs left.",
    theme: "tasks",
    tags: ["launch_hold", "planning_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Signal Fade clock is impartial; act before it explains itself.",
    theme: "wisdom",
    tags: ["deadline_missed", "magnetic"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Next burn: convert capture backlog into archived payload.",
    theme: "tasks",
    tags: ["capture_push", "seal_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Deadline is inside window, but only if combine stays on schedule.",
    theme: "status",
    tags: ["deadline_inside", "planning_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Missed windows are made from small delays stacked in silence.",
    theme: "wisdom",
    tags: ["deadline_missed", "launch_hold"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Tasks ahead: cut queue age, raise archiving rate, protect launch margin.",
    theme: "tasks",
    tags: ["capture_push", "seal_push", "launch_hold"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Capture bay status: decks are hot, heads are clean, keep loading.",
    theme: "status",
    tags: ["capture_push", "launch_ready"],
  },
  {
    speaker: "Rivet Kerman",
    line: "A dropped frame now is a lost city record later.",
    theme: "wisdom",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Do not park prime tapes in intake; magnetic weather gets louder.",
    theme: "tasks",
    tags: ["capture_push", "magnetic", "deadline_inside"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Today's build order: fragile reels first, then volume.",
    theme: "tasks",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Airframe truth: consistency beats sprinting.",
    theme: "wisdom",
    tags: ["capture_push"],
  },
  {
    speaker: "Rivet Kerman",
    line: "If labels are sloppy, the ship flies blind.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Hull progress equals captured minutes you can trust.",
    theme: "status",
    tags: ["capture_push", "archive"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Navigation update: trim plus combine is the only legal flight plan.",
    theme: "status",
    tags: ["planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Unmerged segments are fake progress.",
    theme: "wisdom",
    tags: ["planning_push", "launch_hold"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Before any burn, confirm in and out points and sync drift.",
    theme: "tasks",
    tags: ["planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Course lock comes from repeatable edits, not memory.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "If queue pressure rises, simplify decisions and keep the path linear.",
    theme: "tasks",
    tags: ["planning_push", "deadline_inside"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Signal Fade punishes rework first.",
    theme: "wisdom",
    tags: ["deadline_missed", "planning_push", "magnetic"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Task ahead: resolve near-complete reels to clear transfer runway.",
    theme: "tasks",
    tags: ["planning_push", "seal_push", "launch_hold"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Integration report: handoffs stay clean when naming stays exact.",
    theme: "status",
    tags: ["planning_push", "launch_ready"],
  },
  {
    speaker: "Splicia Kerman",
    line: "One bad merge can ghost an entire meeting.",
    theme: "wisdom",
    tags: ["planning_push", "magnetic"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Combine queue first, transfer queue second, archiving queue third.",
    theme: "tasks",
    tags: ["planning_push", "seal_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "I trust files with provenance, not vibes.",
    theme: "wisdom",
    tags: ["planning_push", "archive"],
  },
  {
    speaker: "Splicia Kerman",
    line: "When two cuts disagree, choose the one with documented intent.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Status note: metadata debt is trajectory debt.",
    theme: "status",
    tags: ["planning_push", "launch_hold"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Pad ops ready once transfers pass checksum and path checks.",
    theme: "status",
    tags: ["seal_push", "launch_ready"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Do not roll to pad with half-checked payload.",
    theme: "tasks",
    tags: ["seal_push", "launch_hold"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Task order: verify transfer, validate runtime, flag anomalies.",
    theme: "tasks",
    tags: ["seal_push", "quarantine", "planning_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "A smooth launch is built in preflight.",
    theme: "wisdom",
    tags: ["launch_ready", "planning_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "If NAS lanes are crowded, stage batches and keep logs tight.",
    theme: "tasks",
    tags: ["seal_push", "planning_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Window pressure means fewer retries, not fewer checks.",
    theme: "wisdom",
    tags: ["deadline_inside", "seal_push"],
  },
  {
    speaker: "Nora Kerman",
    line: "Archiving update: certified reels push colony phase forward.",
    theme: "status",
    tags: ["archive", "stacks_growth", "launch_ready"],
  },
  {
    speaker: "Nora Kerman",
    line: "No archiving, no settlement.",
    theme: "wisdom",
    tags: ["seal_push", "launch_hold"],
  },
  {
    speaker: "Nora Kerman",
    line: "Chain-of-custody is oxygen for The Stacks.",
    theme: "wisdom",
    tags: ["archive", "stacks_growth"],
  },
  {
    speaker: "Nora Kerman",
    line: "Task ahead: prioritize civic high-value reels for archiving.",
    theme: "tasks",
    tags: ["seal_push", "capture_push"],
  },
  {
    speaker: "Nora Kerman",
    line: "If it is not cataloged, it is not recoverable.",
    theme: "wisdom",
    tags: ["planning_push", "archive"],
  },
  {
    speaker: "Nora Kerman",
    line: "Meridia storage grows one verified reel at a time.",
    theme: "status",
    tags: ["stacks_growth", "archive"],
  },
  {
    speaker: "Nora Kerman",
    line: "Archiving rate is the heartbeat of colonization.",
    theme: "wisdom",
    tags: ["stacks_growth", "seal_push", "deadline_inside"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Telemetry check: counts are honest, trends are improving, stay on plan.",
    theme: "status",
    tags: ["launch_ready", "deadline_inside"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Dashboards do not create progress; they reveal it.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "If a metric has no owner, it has no future.",
    theme: "wisdom",
    tags: ["planning_push", "launch_hold"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Status drift often starts as timestamp drift.",
    theme: "status",
    tags: ["planning_push", "magnetic"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Task ahead: close data gaps before the next briefing cycle.",
    theme: "tasks",
    tags: ["planning_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Cataloged-per-day is our pulse under magnetic stress.",
    theme: "status",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Bitra Kerman",
    line: "No clean drilldown, no confident decision.",
    theme: "wisdom",
    tags: ["planning_push"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Quarantine alert: blocked work is mission drag, not parking.",
    theme: "status",
    tags: ["quarantine", "launch_hold"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Clear root cause, then clear queue.",
    theme: "tasks",
    tags: ["quarantine"],
  },
  {
    speaker: "Vexa Kerman",
    line: "A fast fix without a note is a delayed failure.",
    theme: "wisdom",
    tags: ["quarantine", "planning_push"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Signal Fade amplifies unresolved defects.",
    theme: "status",
    tags: ["quarantine", "magnetic", "deadline_missed"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Task ahead: unblock by risk, not by noise.",
    theme: "tasks",
    tags: ["quarantine", "launch_hold"],
  },
  {
    speaker: "Vexa Kerman",
    line: "If anomaly count climbs, pause assumptions first.",
    theme: "wisdom",
    tags: ["quarantine", "launch_hold"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Quality is velocity that survives tomorrow.",
    theme: "wisdom",
    tags: ["quarantine", "deadline_inside"],
  },
  {
    speaker: "Mira Kerman",
    line: "Magnetics update: Core Cascade variance is trending hostile.",
    theme: "status",
    tags: ["magnetic", "deadline_missed"],
  },
  {
    speaker: "Mira Kerman",
    line: "Every extra day in intake increases decode risk.",
    theme: "status",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Treat weak tapes like reentry hardware: gently and first.",
    theme: "wisdom",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Signal Fade is a curve, not a cliff, until it becomes both.",
    theme: "wisdom",
    tags: ["deadline_inside", "deadline_missed", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Task ahead: process oldest magnetic stock before pristine stock.",
    theme: "tasks",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Science note: verified runtime is a preservation signal.",
    theme: "wisdom",
    tags: ["planning_push", "archive"],
  },
  {
    speaker: "Mira Kerman",
    line: "Entropy always sends the invoice after the deadline.",
    theme: "wisdom",
    tags: ["magnetic", "deadline_missed"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "EVA log: heads cleaned, deck aligned, capture lane nominal.",
    theme: "status",
    tags: ["capture_push", "launch_ready"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "I pull signal from noise; give me the reels that still whisper.",
    theme: "status",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Task ahead: run fragile stock on the calmest chain.",
    theme: "tasks",
    tags: ["capture_push", "magnetic"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Do not over-handle tape; one pass should count.",
    theme: "wisdom",
    tags: ["capture_push"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "If tracking hunts, stop and stabilize before continuing.",
    theme: "tasks",
    tags: ["capture_push", "planning_push"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "A rescued frame is a rescued vote.",
    theme: "wisdom",
    tags: ["capture_push", "archive"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Runway status: rollout stays green when queues stay short.",
    theme: "status",
    tags: ["launch_ready", "capture_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Pad discipline is simple: finished work in front, hopeful work behind.",
    theme: "wisdom",
    tags: ["launch_hold", "seal_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Task ahead: clear transfer bottlenecks before lunch burn.",
    theme: "tasks",
    tags: ["seal_push", "planning_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Late scramble is just early planning debt.",
    theme: "wisdom",
    tags: ["planning_push", "launch_hold"],
  },
  {
    speaker: "Valdo Kerman",
    line: "When the window narrows, remove choices, not standards.",
    theme: "wisdom",
    tags: ["deadline_inside", "launch_hold"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Green lights mean go-fast only after go-right.",
    theme: "wisdom",
    tags: ["launch_ready"],
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

export function getMissionBriefingQuotes(state: MissionState, limit = 8): KermanQuote[] {
  const cappedLimit = Math.max(1, Math.min(limit, KERMAN_QUOTE_BANK.length));
  const tags = activeMissionTags(state);
  const matchingQuotes = KERMAN_QUOTE_BANK.filter((quote) => quote.tags.some((tag) => tags.has(tag)));
  const matchingKeys = new Set(matchingQuotes.map((quote) => quoteKey(quote)));
  const fallbackQuotes = KERMAN_QUOTE_BANK.filter((quote) => !matchingKeys.has(quoteKey(quote)));
  const seed = missionSeed(state);
  const ordered = [...stableOrder(matchingQuotes, seed), ...stableOrder(fallbackQuotes, seed + 29)];
  return ordered.slice(0, cappedLimit);
}
