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
    line: "Flight Director log: the launch window is open, and the telemetry graph is finally behaving.",
    theme: "status",
    tags: ["general", "launch_ready", "capture_push", "seal_push", "deadline_inside"],
  },
  {
    speaker: "Genev Kerman",
    line: "Hold formation; clear blockers before they become explosions in Act Three.",
    theme: "tasks",
    tags: ["general", "launch_hold", "quarantine", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Checklist discipline wins wars, races, and every Tuesday night shift.",
    theme: "wisdom",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "NoCap memory moves only when every handoff lands like a clean docking sequence.",
    theme: "wisdom",
    tags: ["general", "capture_push", "planning_push", "seal_push", "archive"],
  },

  {
    speaker: "Dexrin Kerman",
    line: "Window analysis: delay compounds like interest, only louder and with fire.",
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
    line: "Cut queue age, then lock Trim and Combine cadence to mission tempo.",
    theme: "tasks",
    tags: ["general", "capture_push", "planning_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "If the curve drifts right, tighten every handoff left and keep the soundtrack tense.",
    theme: "tasks",
    tags: ["general", "launch_hold", "planning_push"],
  },

  {
    speaker: "Rivet Kerman",
    line: "Capture deck is green; route fragile reels first and keep the wow/flutter drama off-camera.",
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
    line: "One clean pass beats three heroic retries and a sad debrief.",
    theme: "wisdom",
    tags: ["general", "capture_push", "planning_push"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Airframe growth equals trusted captured minutes, not wishful thinking.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },

  {
    speaker: "Paxlo Kerman",
    line: "Trim and Combine are our guidance stack; synchronize them like clock phases.",
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
    line: "Lock in and out points before each export burn, then commit like you mean it.",
    theme: "tasks",
    tags: ["general", "planning_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Course stability comes from repeatable edits and zero improv at ignition.",
    theme: "wisdom",
    tags: ["general", "planning_push", "deadline_inside"],
  },

  {
    speaker: "Splicia Kerman",
    line: "Integration report: naming and metadata are within tolerance and somehow still stylish.",
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
    line: "Run continuity checks first, transfer second, victory speech third.",
    theme: "tasks",
    tags: ["general", "planning_push", "seal_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "If provenance is fuzzy, payload is not flight-ready, no matter how cinematic it looks.",
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
    line: "No partial checks on a launch-bound payload; this is not a rehearsal montage.",
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
    line: "Pressure is not permission to skip preflight, even when the sky looks dramatic.",
    theme: "wisdom",
    tags: ["general", "deadline_inside", "seal_push"],
  },

  {
    speaker: "Nora Kerman",
    line: "Archiving update: certified reels advance colonization one verified record at a time.",
    theme: "status",
    tags: ["general", "archive", "stacks_growth", "launch_ready"],
  },
  {
    speaker: "Nora Kerman",
    line: "No archiving, no settlement, no heroic ending.",
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
    line: "Prioritize high-value civic reels while the launch window is still merciful.",
    theme: "tasks",
    tags: ["general", "seal_push", "capture_push", "deadline_inside"],
  },

  {
    speaker: "Bitra Kerman",
    line: "Telemetry is clean enough to act, and the error bars are finally polite.",
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
    line: "If a metric has no owner, it is just fan fiction in spreadsheet form.",
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
    line: "Quarantine notice: blocked work is drag, not drama, so clear it.",
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
    line: "Fast fixes without notes are just sequels to the same incident.",
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
    line: "Science update: Core Cascade variance remains hostile and statistically rude.",
    theme: "status",
    tags: ["general", "magnetic", "deadline_missed"],
  },
  {
    speaker: "Mira Kerman",
    line: "Prioritize older magnetic stock first; entropy compounds daily and never forgets.",
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
    line: "Signal Fade starts gradual, then sudden, so act before the cut to black.",
    theme: "wisdom",
    tags: ["general", "magnetic", "deadline_inside", "deadline_missed"],
  },

  {
    speaker: "Jebrin Kerman",
    line: "EVA capture log: heads clean, alignment true, lane nominal, coffee questionable.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Feed me the reels that still whisper; we can still recover them.",
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
    line: "Runway marshal update: rollout stays green when queues stay short and honest.",
    theme: "status",
    tags: ["general", "launch_ready", "capture_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Move finished work to the front and route uncertain work to quarantine without drama.",
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
  {
    speaker: "Genev Kerman",
    line: "Mission status: vector is stable, confidence is rising, and nobody has to panic-run the corridor.",
    theme: "status",
    tags: ["general", "launch_ready", "deadline_inside", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "If the queue spikes, reduce decision entropy and execute the checklist scene by scene.",
    theme: "tasks",
    tags: ["general", "launch_hold", "quarantine", "planning_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Heroic endings are built from boring handoffs and correctly named files.",
    theme: "wisdom",
    tags: ["general", "capture_push", "seal_push"],
  },
  {
    speaker: "Genev Kerman",
    line: "Signal Fade is in frame now; fly precise and leave no task unowned.",
    theme: "status",
    tags: ["general", "launch_hold", "deadline_missed", "magnetic"],
  },
  {
    speaker: "Genev Kerman",
    line: "Every archived reel is one more citizen memory that survives the credits.",
    theme: "wisdom",
    tags: ["general", "launch_ready", "archive", "stacks_growth"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Timeline model says we are inside window, but the margin is thinner than it looks on the big screen.",
    theme: "status",
    tags: ["general", "deadline_inside", "launch_ready"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "When the deadline slips, compress idle time, not quality gates.",
    theme: "tasks",
    tags: ["general", "deadline_missed", "launch_hold", "planning_push"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Physics is a strict producer; it never funds reshoots.",
    theme: "wisdom",
    tags: ["general", "magnetic", "deadline_missed"],
  },
  {
    speaker: "Dexrin Kerman",
    line: "Blocked work is schedule gravity, and gravity always collects.",
    theme: "status",
    tags: ["general", "launch_hold", "quarantine"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Run fragile stock on the calm deck; wow, flutter, and chaos are not invited.",
    theme: "tasks",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Capture throughput is up, and the hull meter finally looks like a hero shot.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },
  {
    speaker: "Rivet Kerman",
    line: "Clean signal now beats miracle restoration later.",
    theme: "wisdom",
    tags: ["general", "capture_push", "archive"],
  },
  {
    speaker: "Rivet Kerman",
    line: "If tracking drifts, stop the scene, re-align, and roll again.",
    theme: "tasks",
    tags: ["general", "launch_hold", "planning_push", "capture_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Guidance stack check: Trim and Combine are phase-locked and ready for burn.",
    theme: "status",
    tags: ["general", "planning_push", "launch_ready"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Resolve near-complete edits first; partial progress is cinematic fog.",
    theme: "tasks",
    tags: ["general", "planning_push", "seal_push"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Ambiguous cuts are how missions miss windows.",
    theme: "wisdom",
    tags: ["general", "planning_push", "launch_hold"],
  },
  {
    speaker: "Paxlo Kerman",
    line: "Keep drift low and metadata tight; Signal Fade loves sloppy math.",
    theme: "status",
    tags: ["general", "deadline_inside", "magnetic", "planning_push"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Integration pass complete: filenames match manifests, and the universe makes sense again.",
    theme: "status",
    tags: ["general", "planning_push", "launch_ready"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Quarantine anything with broken provenance before it infects the timeline.",
    theme: "tasks",
    tags: ["general", "planning_push", "quarantine"],
  },
  {
    speaker: "Splicia Kerman",
    line: "If future-you cannot trace it in ten seconds, it is not done.",
    theme: "wisdom",
    tags: ["general", "planning_push", "archive"],
  },
  {
    speaker: "Splicia Kerman",
    line: "Merge once, verify twice, then hand off like a prologue to landing.",
    theme: "tasks",
    tags: ["general", "seal_push", "planning_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Pad channel green: checksums agree, runtimes align, and the gate can breathe.",
    theme: "status",
    tags: ["general", "seal_push", "launch_ready"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Stage transfers in small batches; dramatic pileups are for movies, not missions.",
    theme: "tasks",
    tags: ["general", "seal_push", "launch_hold"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Speed without verification is just expensive suspense.",
    theme: "wisdom",
    tags: ["general", "deadline_inside", "seal_push"],
  },
  {
    speaker: "Mallo Kerman",
    line: "Any failed transfer goes to quarantine, not to wishful thinking.",
    theme: "status",
    tags: ["general", "quarantine", "launch_hold", "seal_push"],
  },
  {
    speaker: "Nora Kerman",
    line: "Stacks intake is rising; Meridia gets stronger with every verified file.",
    theme: "status",
    tags: ["general", "archive", "stacks_growth"],
  },
  {
    speaker: "Nora Kerman",
    line: "Archive high-value civic sessions first, then sweep the long tail.",
    theme: "tasks",
    tags: ["general", "seal_push", "archive"],
  },
  {
    speaker: "Nora Kerman",
    line: "No custody trail, no trust; no trust, no colony.",
    theme: "wisdom",
    tags: ["general", "launch_hold", "seal_push"],
  },
  {
    speaker: "Nora Kerman",
    line: "Cargo certification is on tempo. Keep that rhythm until touchdown.",
    theme: "status",
    tags: ["general", "launch_ready", "deadline_inside", "stacks_growth"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Dashboard check: trend lines are coherent, and the anomalies are finally interesting instead of terrifying.",
    theme: "status",
    tags: ["general", "planning_push", "launch_ready"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Fix timestamp gaps before they turn into fake narratives.",
    theme: "tasks",
    tags: ["general", "planning_push", "capture_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Metrics are instruments, not decorations.",
    theme: "wisdom",
    tags: ["general", "launch_hold", "planning_push"],
  },
  {
    speaker: "Bitra Kerman",
    line: "Noise floor is climbing; prioritize records with fragile signal-to-noise.",
    theme: "status",
    tags: ["general", "magnetic", "deadline_missed", "capture_push"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Quarantine board update: three root causes, zero excuses.",
    theme: "status",
    tags: ["general", "quarantine", "launch_hold"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Patch the process, not just the symptom, unless you enjoy repeat villains.",
    theme: "tasks",
    tags: ["general", "quarantine", "planning_push"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Quality debt accrues interest at midnight.",
    theme: "wisdom",
    tags: ["general", "quarantine", "deadline_inside"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Signal Fade plus unresolved defects equals a very short third act.",
    theme: "status",
    tags: ["general", "magnetic", "deadline_missed", "quarantine"],
  },
  {
    speaker: "Vexa Kerman",
    line: "Clear the highest-risk blocker first, then reopen the lane with receipts.",
    theme: "tasks",
    tags: ["general", "quarantine", "seal_push"],
  },
  {
    speaker: "Mira Kerman",
    line: "Magnetics report: variance is spiky, but still survivable with disciplined sequencing.",
    theme: "status",
    tags: ["general", "magnetic", "deadline_inside"],
  },
  {
    speaker: "Mira Kerman",
    line: "Prioritize tapes by decay risk, not by shelf aesthetics.",
    theme: "tasks",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Entropy has perfect attendance.",
    theme: "wisdom",
    tags: ["general", "deadline_missed", "magnetic"],
  },
  {
    speaker: "Mira Kerman",
    line: "Verified runtime drift is down, which means fewer ghosts in post.",
    theme: "status",
    tags: ["general", "archive", "planning_push"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Capture bench is humming: alignment locked, dropout rate low, morale high enough.",
    theme: "status",
    tags: ["general", "capture_push", "launch_ready"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Give me the brittle reels first; we can still pull signal out of the static.",
    theme: "tasks",
    tags: ["general", "capture_push", "magnetic"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Gentle transport and clean heads beat hero mode.",
    theme: "wisdom",
    tags: ["general", "capture_push", "deadline_inside"],
  },
  {
    speaker: "Jebrin Kerman",
    line: "Every recovered minute is one more page of municipal history saved.",
    theme: "status",
    tags: ["general", "archive", "capture_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Runway discipline holds: queues are trimmed and handoffs are crisp.",
    theme: "status",
    tags: ["general", "launch_ready", "planning_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "Do not open the gate until transfer logs read like poetry and proofs.",
    theme: "tasks",
    tags: ["general", "launch_hold", "seal_push"],
  },
  {
    speaker: "Valdo Kerman",
    line: "When time is short, simplify choices and raise standards.",
    theme: "wisdom",
    tags: ["general", "deadline_inside", "launch_hold"],
  },
  {
    speaker: "Valdo Kerman",
    line: "If a lane keeps failing, park it, diagnose it, and come back stronger.",
    theme: "status",
    tags: ["general", "quarantine", "launch_hold"],
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
