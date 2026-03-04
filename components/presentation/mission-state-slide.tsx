import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssemblyMilestone, ColonizationPhase, MissionAxis, MissionState, PlanningMilestone } from "@/lib/types";

const AXIS_META: Record<
  MissionAxis,
  { label: string; owner: string; detail: string; barClass: string }
> = {
  assembly: {
    label: "Assembly",
    owner: "Rivet Kerman",
    detail: "Capture builds the ship",
    barClass: "from-cyan-300 via-sky-300 to-indigo-300",
  },
  planning: {
    label: "Planning",
    owner: "Paxlo Kerman",
    detail: "Trim + Combine lock the course",
    barClass: "from-amber-300 via-orange-300 to-rose-300",
  },
  colonization: {
    label: "Colonization",
    owner: "Nora Kerman",
    detail: "Archived advances Meridia mission phases",
    barClass: "from-emerald-300 via-cyan-300 to-sky-300",
  },
};

const ASSEMBLY_COPY: Record<AssemblyMilestone, { title: string; detail: string }> = {
  blueprints: { title: "Blueprints", detail: "Backlog mapped, queue organized." },
  jigs_online: { title: "Jigs Online", detail: "Capture bay prepped for throughput." },
  airframe_rising: { title: "Airframe Rising", detail: "Hull growth tracks captured coverage." },
  engines_mated: { title: "Engines Mated", detail: "Trimmed payloads stabilize burn control." },
  booster_stacked: { title: "Booster Stacked", detail: "Combined and transfer-ready units align." },
  rollout: { title: "Rollout", detail: "Pad systems and routing are live." },
  pad_ready: { title: "Pad Ready", detail: "Launch stack is fully assembled." },
};

const PLANNING_COPY: Record<PlanningMilestone, { title: string; detail: string }> = {
  napkin_math: { title: "Napkin Math", detail: "First-pass trajectory assumptions only." },
  course_plotted: { title: "Course Plotted", detail: "Trim continuity starts shaping route math." },
  burns_scheduled: { title: "Burns Scheduled", detail: "Combine sequencing is now deterministic." },
  go_no_go: { title: "Go / No-Go", detail: "Operational readiness checkpoint in progress." },
  flight_plan_locked: { title: "Flight Plan Locked", detail: "Trim + Combine confidence is high." },
  autopilot_loaded: { title: "Autopilot Loaded", detail: "Guidance package accepted for launch." },
};

const COLONIZATION_COPY: Record<ColonizationPhase, { title: string; detail: string }> = {
  cargo_staged: { title: "Cargo Staged", detail: "Archive cargo gathered for archiving verification." },
  hold_for_readiness: { title: "Hold for Readiness", detail: "Launch is paused while gates remain closed." },
  launch: { title: "Launch", detail: "Evacuation departure from origin underway." },
  cruise: { title: "Cruise", detail: "Mission arc to Meridia is stable." },
  approach_meridia: { title: "Approach: Meridia", detail: "Fluxfall vectors are converging." },
  entry_descent: { title: "Entry / Descent", detail: "Atmospheric insertion and descent control active." },
  landing_fluxfall: { title: "Landing: Fluxfall Basin", detail: "Cargo touchdown operations in progress." },
  stacks_expansion: { title: "The Stacks Expansion", detail: "Outpost storage grows with each archived reel." },
  vault_sealed: { title: "Vault Sealed", detail: "Permanent municipal archive secured." },
};

function percent(value: number) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function gateStatus(value: boolean) {
  return value ? "OPEN" : "HOLD";
}

function formatTimestamp(value?: string) {
  if (!value) return "TBD";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return format(new Date(parsed), "yyyy-MM-dd HH:mm:ss");
}

function crewLine(state: MissionState) {
  if (state.overlays.quarantine) return "Vexa: Quarantine is rising. Clear anomalies or we stall.";
  if (!state.gates.launchAllowed) return "Dexrin: Window is closing. Signal Fade does not negotiate.";
  if (!state.gates.landingAllowed) return "Mallo: Pad checks are clean. Hold vector discipline.";
  if (!state.gates.stacksGrowthAllowed) return "Nora: Cargo certified. Push archiving rate for The Stacks.";
  return "Genev: Trajectory stable. Fluxfall secured, expand The Stacks.";
}

export function MissionStateSlide({
  missionState,
  projectedLaunchAt,
}: {
  missionState: MissionState;
  projectedLaunchAt?: string;
}) {
  const milestoneRows = [
    { axis: "assembly" as const, copy: ASSEMBLY_COPY[missionState.milestones.assembly] },
    { axis: "planning" as const, copy: PLANNING_COPY[missionState.milestones.planning] },
    { axis: "colonization" as const, copy: COLONIZATION_COPY[missionState.milestones.colonization] },
  ];

  return (
    <div className="grid h-full gap-4 md:grid-cols-5">
      <Card className="mission-panel flex h-full min-h-0 flex-col md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-50">Mission State Contract</CardTitle>
          <p className="text-[clamp(0.8rem,0.64vw,1.1rem)] text-cyan-100/75">
            Core Cascade pressure model mapped to assembly, planning, and colonization.
            Runtime-weighted coverage: {missionState.runtime.coveragePercent}%.
          </p>
        </CardHeader>
        <CardContent className="min-h-0 space-y-4 overflow-auto pr-1">
          {(["assembly", "planning", "colonization"] as const).map((axis) => {
            const pct = percent(missionState.progress[axis]);
            const meta = AXIS_META[axis];
            return (
              <div key={axis} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-cyan-100/85">
                  <div>
                    <p className="font-mono text-[clamp(0.8rem,0.64vw,1.08rem)] uppercase tracking-[0.16em]">{meta.label}</p>
                    <p className="text-[clamp(0.72rem,0.56vw,0.94rem)] text-cyan-100/70">
                      {meta.detail} | Owner: {meta.owner}
                    </p>
                  </div>
                  <p className="font-mono text-[clamp(1rem,0.86vw,1.4rem)] font-semibold text-cyan-50">{pct}</p>
                </div>
                <div className="h-2 rounded-full bg-slate-800/90">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${meta.barClass} transition-all duration-700`}
                    style={{ width: pct }}
                  />
                </div>
              </div>
            );
          })}

          <div className="grid gap-3 lg:grid-cols-3">
            {milestoneRows.map((row) => (
              <div key={row.axis} className="rounded-md border border-cyan-300/25 bg-slate-900/70 p-3">
                <p className="font-mono text-[clamp(0.72rem,0.56vw,0.94rem)] uppercase tracking-[0.16em] text-cyan-100/70">
                  {AXIS_META[row.axis].label} Milestone
                </p>
                <p className="mt-1 text-[clamp(1.06rem,0.94vw,1.46rem)] font-semibold text-cyan-50">{row.copy.title}</p>
                <p className="mt-1 text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100/75">{row.copy.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid h-full min-h-0 gap-4 md:col-span-2 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="mission-panel min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Canon Coordinates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[clamp(0.8rem,0.64vw,1.08rem)] text-cyan-100/85">
            <p>Homeworld: <span className="font-semibold text-cyan-50">{missionState.lore.origin.homeworld}</span></p>
            <p>Destination: <span className="font-semibold text-cyan-50">{missionState.lore.destination.planet}</span></p>
            <p>Landing Site: <span className="font-semibold text-cyan-50">{missionState.lore.destination.landingSite}</span></p>
            <p>Outpost: <span className="font-semibold text-cyan-50">{missionState.lore.destination.outpost}</span></p>
            <p>Threat: <span className="font-semibold text-cyan-50">{missionState.lore.threat.cause}</span></p>
            <p>Countdown: Great <span className="font-semibold text-cyan-50">{missionState.lore.threat.event}</span></p>
            <p>Projected Launch: <span className="font-mono text-cyan-50">{formatTimestamp(projectedLaunchAt)}</span></p>
            <p>Signal Fade Deadline: <span className="font-mono text-cyan-50">{formatTimestamp(missionState.deadline.iso)}</span></p>
          </CardContent>
        </Card>

        <Card className="mission-panel min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Gate Status + Quarantine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[clamp(0.8rem,0.64vw,1.08rem)] text-cyan-100/85">
            <div className="flex items-center justify-between rounded-md border border-cyan-300/25 bg-slate-900/70 px-3 py-2">
              <p className="font-mono uppercase tracking-[0.14em]">Launch Gate</p>
              <p className={missionState.gates.launchAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
                {gateStatus(missionState.gates.launchAllowed)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-cyan-300/25 bg-slate-900/70 px-3 py-2">
              <p className="font-mono uppercase tracking-[0.14em]">Landing Gate</p>
              <p className={missionState.gates.landingAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
                {gateStatus(missionState.gates.landingAllowed)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-cyan-300/25 bg-slate-900/70 px-3 py-2">
              <p className="font-mono uppercase tracking-[0.14em]">Stacks Growth</p>
              <p className={missionState.gates.stacksGrowthAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
                {gateStatus(missionState.gates.stacksGrowthAllowed)}
              </p>
            </div>
            <div className="rounded-md border border-rose-300/30 bg-rose-950/30 px-3 py-2">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.94rem)] uppercase tracking-[0.16em] text-rose-100/85">
                Quarantine
              </p>
              <p className="mt-1 text-[clamp(0.86rem,0.7vw,1.14rem)] text-rose-100">
                {missionState.overlays.quarantine
                  ? `${missionState.overlays.anomaliesCount} blocked tape${missionState.overlays.anomaliesCount === 1 ? "" : "s"} in anomaly review.`
                  : "No blocked tapes. Quarantine clear."}
              </p>
            </div>
            {missionState.gates.holdReason ? (
              <p className="rounded-md border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100/80">
                {missionState.gates.holdReason}
              </p>
            ) : null}
            <p className="rounded-md border border-cyan-300/30 bg-cyan-950/40 px-3 py-2 text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100">
              {crewLine(missionState)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
