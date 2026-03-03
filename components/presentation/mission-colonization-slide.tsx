import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColonizationPhase, MissionState } from "@/lib/types";

const PHASES: Array<{ phase: ColonizationPhase; title: string; crew: string }> = [
  { phase: "cargo_staged", title: "Cargo Staged", crew: "Nora" },
  { phase: "hold_for_readiness", title: "Hold for Readiness", crew: "Dexrin" },
  { phase: "launch", title: "Launch", crew: "Genev" },
  { phase: "cruise", title: "Cruise", crew: "Bitra" },
  { phase: "approach_meridia", title: "Approach Meridia", crew: "Paxlo" },
  { phase: "entry_descent", title: "Entry + Descent", crew: "Mallo" },
  { phase: "landing_fluxfall", title: "Land Fluxfall", crew: "Valdo" },
  { phase: "stacks_expansion", title: "The Stacks Expand", crew: "Nora" },
  { phase: "vault_sealed", title: "Vault Sealed", crew: "Mira" },
];

function percent(value: number) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function phaseTone({
  index,
  activeIndex,
  quarantine,
}: {
  index: number;
  activeIndex: number;
  quarantine: boolean;
}) {
  if (index < activeIndex) return "border-emerald-300/40 bg-emerald-500/20 text-emerald-100";
  if (index === activeIndex) {
    if (quarantine) return "border-rose-300/45 bg-rose-500/20 text-rose-100";
    return "border-cyan-300/45 bg-cyan-500/20 text-cyan-50";
  }
  return "border-slate-600/55 bg-slate-900/80 text-cyan-100/70";
}

function activeCallout(state: MissionState) {
  if (state.overlays.quarantine) return "Vexa: Quarantine overlay active. Blocked work does not advance mission phase.";
  if (state.milestones.colonization === "hold_for_readiness") {
    return "Dexrin: Signal Fade pressure is increasing. Open launch gate before the window collapses.";
  }
  if (!state.gates.landingAllowed) return "Genev: Launch trajectory is up. Build archive seal coverage for Fluxfall approach.";
  if (!state.gates.stacksGrowthAllowed) return "Nora: Landing corridor open. Keep sealing cargo for outpost expansion.";
  return "Mira: Meridia touchdown sequence is stable. The Stacks are scaling.";
}

export function MissionColonizationSlide({
  missionState,
  projectedAfterDeadline,
}: {
  missionState: MissionState;
  projectedAfterDeadline: boolean;
}) {
  const activeIndex = Math.max(
    0,
    PHASES.findIndex((row) => row.phase === missionState.milestones.colonization)
  );

  return (
    <div className="grid h-full gap-4 md:grid-cols-5">
      <Card className="mission-panel flex h-full min-h-0 flex-col md:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-50">Colonization Timeline: Meridia Run</CardTitle>
          <p className="text-[clamp(0.8rem,0.64vw,1.08rem)] text-cyan-100/75">
            Archived cargo advances mission phase from launch through Fluxfall Basin to The Stacks.
          </p>
        </CardHeader>
        <CardContent className="min-h-0 space-y-3 overflow-auto pr-1">
          <div className="grid gap-2 lg:grid-cols-9">
            {PHASES.map((row, index) => (
              <div
                key={row.phase}
                className={`rounded-md border px-2.5 py-2 transition-colors ${phaseTone({
                  index,
                  activeIndex,
                  quarantine: missionState.overlays.quarantine && index === activeIndex,
                })}`}
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em]">Phase {index + 1}</p>
                <p className="mt-1 text-[0.88rem] font-semibold leading-tight">{row.title}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.1em] opacity-80">{row.crew} owns</p>
                <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]">
                  {index < activeIndex ? "COMPLETE" : index === activeIndex ? "ACTIVE" : "LOCKED"}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.94rem)] uppercase tracking-[0.14em] text-cyan-100/70">
                Archive Seal Coverage
              </p>
              <p className="mt-1 text-[clamp(1.6rem,1.7vw,2.8rem)] font-semibold leading-none text-cyan-50">
                {missionState.counts.archived}/{missionState.counts.total}
              </p>
              <p className="mt-1 font-mono text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100/80">
                Colonization progress: {percent(missionState.progress.colonization)}
              </p>
            </div>
            <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.94rem)] uppercase tracking-[0.14em] text-cyan-100/70">
                Route
              </p>
              <p className="mt-1 text-[clamp(0.84rem,0.68vw,1.12rem)] text-cyan-100/85">
                Origin pad - Launch arc - Meridia approach - Fluxfall Basin touchdown - The Stacks expansion.
              </p>
            </div>
            <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.94rem)] uppercase tracking-[0.14em] text-cyan-100/70">
                Trajectory
              </p>
              <p className={projectedAfterDeadline ? "mt-1 font-semibold text-rose-100" : "mt-1 font-semibold text-emerald-100"}>
                {projectedAfterDeadline ? "Missed Window Risk" : "Inside Window"}
              </p>
              <p className="mt-1 text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100/80">
                {missionState.deadline.status === "missed"
                  ? "Signal Fade threshold exceeded."
                  : "Launch window still open against Signal Fade."}
              </p>
            </div>
          </div>
          <p className="rounded-md border border-cyan-300/30 bg-cyan-950/35 px-3 py-2 text-[clamp(0.74rem,0.58vw,0.98rem)] text-cyan-100">
            {activeCallout(missionState)}
          </p>
        </CardContent>
      </Card>

      <Card className="mission-panel min-h-0 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-50">Gate Locks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[clamp(0.8rem,0.64vw,1.04rem)]">
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 px-3 py-2">
            <p className="font-mono uppercase tracking-[0.14em] text-cyan-100/70">Launch</p>
            <p className={missionState.gates.launchAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
              {missionState.gates.launchAllowed ? "OPEN" : "HOLD"}
            </p>
          </div>
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 px-3 py-2">
            <p className="font-mono uppercase tracking-[0.14em] text-cyan-100/70">Landing</p>
            <p className={missionState.gates.landingAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
              {missionState.gates.landingAllowed ? "OPEN" : "HOLD"}
            </p>
          </div>
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 px-3 py-2">
            <p className="font-mono uppercase tracking-[0.14em] text-cyan-100/70">Stacks Growth</p>
            <p className={missionState.gates.stacksGrowthAllowed ? "font-semibold text-emerald-200" : "font-semibold text-amber-200"}>
              {missionState.gates.stacksGrowthAllowed ? "OPEN" : "HOLD"}
            </p>
          </div>
          <div className="rounded-md border border-rose-300/30 bg-rose-950/35 px-3 py-2 text-rose-100">
            <p className="font-mono uppercase tracking-[0.14em] text-rose-100/80">Quarantine</p>
            <p className="mt-1 font-semibold">
              {missionState.overlays.quarantine
                ? `${missionState.overlays.anomaliesCount} blocked`
                : "Clear"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
