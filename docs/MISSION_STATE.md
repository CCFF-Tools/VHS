# Mission State (Mission Control Lore + Visualization Contract)

For canon names, stakes, and approved terminology, see: `docs/MISSION_LORE.md`.
This file focuses on computation + milestones only.

This file defines the canonical **MissionState** model used to map real VHS workflow progress into the “space mission” visualization layer.

## Canon (Do Not Drift)
- Species: **Kermans**
- Homeworld: **NoCap**
- Destination planet: **Meridia**
- Landing site: **Fluxfall Basin**
- Outpost: **The Stacks**
- Threat: **Core Cascade** → magnetic instability → **Great “Signal Fade”**
- Core rule:
  - **Capture builds the ship**
  - **Trim + Combine lock the plan**
  - **Archived advances the mission (launch → cruise → landing → colony)**

## Workflow Stages (Real System)
Stages are inferred from Airtable fields; keep naming consistent with existing semantics.
(See `docs/PRODUCT_SPEC.md` for the inference mapping and `lib/data.ts` as source of truth.)

Stage set (dashboard display labels may differ):
- Intake (displayed as “Awaiting Capture”)
- Captured
- Trimmed
- Combined
- Transferred
- Archived
- Blocked

## MissionState Contract (single object drives visuals)

**Design intent:** MissionState should be computed in one place, then reused by:
- `/presentation` slides
- ship assembly visualization
- any future “Meridia map / outpost growth” scenes

### Shape (TypeScript-like)
```ts
type MissionAxis = "assembly" | "planning" | "colonization";

type AssemblyMilestone =
  | "blueprints"
  | "jigs_online"
  | "airframe_rising"
  | "engines_mated"
  | "booster_stacked"
  | "rollout"
  | "pad_ready";

type PlanningMilestone =
  | "napkin_math"
  | "course_plotted"
  | "burns_scheduled"
  | "go_no_go"
  | "flight_plan_locked"
  | "autopilot_loaded";

type ColonizationPhase =
  | "cargo_staged"
  | "hold_for_readiness"
  | "launch"
  | "cruise"
  | "approach_meridia"
  | "entry_descent"
  | "landing_fluxfall"
  | "stacks_expansion"
  | "vault_sealed";

type MissionState = {
  lore: {
    species: "Kermans";
    origin: { homeworld: "NoCap" };
    destination: { planet: "Meridia"; landingSite: "Fluxfall Basin"; outpost: "The Stacks" };
    threat: { cause: "Core Cascade"; event: "Signal Fade" };
  };

  deadline: {
    iso: string;                 // ex: 2026-05-01T00:00:00-04:00 (EDT)
    msRemaining: number;         // can go negative after deadline
    status: "inside_window" | "missed";
  };

  counts: {
    total: number;
    intake: number;
    captured: number;
    trimmed: number;
    combined: number;
    transferred: number;
    archived: number;
    blocked: number;
  };

  progress: {
    assembly: number;            // 0..1
    planning: number;            // 0..1
    colonization: number;        // 0..1
  };

  runtime: {
    totalMinutes: number;        // weighted total runtime minutes across all tapes
    knownMinutes: number;        // sum of explicit runtime values (label/qt/final fallback chain)
    coveragePercent: number;     // tapes with explicit runtime values
    fallbackMinutesPerTape: number; // imputed minutes for missing runtime rows
    stageMinutes: Record<Stage, number>;
    cumulativeMinutes: {
      captureOrBetter: number;
      trimOrBetter: number;
      combineOrBetter: number;
      transferOrBetter: number;
      archived: number;
    };
    progress: {
      captureOrBetter: number;   // 0..1 runtime-weighted
      trimOrBetter: number;      // 0..1 runtime-weighted
      combineOrBetter: number;   // 0..1 runtime-weighted
      transferOrBetter: number;  // 0..1 runtime-weighted
      archived: number;          // 0..1 runtime-weighted
    };
  };

  milestones: {
    assembly: AssemblyMilestone;
    planning: PlanningMilestone;
    colonization: ColonizationPhase;
  };

  gates: {
    launchAllowed: boolean;
    landingAllowed: boolean;
    stacksGrowthAllowed: boolean;
    holdReason?: string;         // short human-readable reason for wallboard
  };

  overlays: {
    quarantine: boolean;         // blocked > 0
    anomaliesCount: number;      // blocked
  };
};
