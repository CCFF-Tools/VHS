import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stageLabel } from "@/lib/stage-label";
import type { DashboardKpis, OpsSummaryResponse, Stage } from "@/lib/types";

const STAGE_ORDER: Stage[] = ["Intake", "Capture", "Trim", "Combine", "Transfer", "Archived", "Blocked"];
const CORE_STAGE_ORDER: Stage[] = ["Intake", "Capture", "Trim", "Combine", "Transfer", "Archived"];

const STAGE_WEIGHTS: Record<Stage, number> = {
  Intake: 0,
  Capture: 0.22,
  Trim: 0.42,
  Combine: 0.64,
  Transfer: 0.84,
  Archived: 1,
  Blocked: 0,
};

const ASSEMBLY_PHASES = [
  { min: 0.95, name: "Launch-Ready Stack", detail: "Payload sealed and mission archive badge complete." },
  { min: 0.8, name: "Payload Integration", detail: "Boosters and transfer systems mostly locked in." },
  { min: 0.62, name: "Guidance Wiring", detail: "Core assembly stable, avionics being finalized." },
  { min: 0.42, name: "Engine Mounting", detail: "Propulsion block is coming online." },
  { min: 0.2, name: "Airframe Assembly", detail: "Hull sections welded and pressure-tested." },
  { min: 0, name: "Blueprint & Jigs", detail: "Early queue stage with primary prep work active." },
];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function percent(value: number) {
  return `${Math.round(clamp01(value) * 100)}%`;
}

function ratio(value: number, total: number) {
  if (total <= 0) return 0;
  return clamp01(value / total);
}

function partOpacity(value: number) {
  return 0.15 + clamp01(value) * 0.85;
}

function buildStageMap(stageCounts: OpsSummaryResponse["stageCounts"]) {
  const map: Record<Stage, number> = {
    Intake: 0,
    Capture: 0,
    Trim: 0,
    Combine: 0,
    Transfer: 0,
    Archived: 0,
    Blocked: 0,
  };

  for (const row of stageCounts) {
    map[row.stage] = (map[row.stage] ?? 0) + row.count;
  }

  return map;
}

function assemblyPhase(progress: number) {
  return ASSEMBLY_PHASES.find((phase) => progress >= phase.min) ?? ASSEMBLY_PHASES[ASSEMBLY_PHASES.length - 1];
}

export function SpaceshipAssemblySlide({
  kpis,
  stageCounts,
}: {
  kpis: DashboardKpis;
  stageCounts: OpsSummaryResponse["stageCounts"];
}) {
  const counts = buildStageMap(stageCounts);
  const total = kpis.totalTapes;

  const weightedUnits = STAGE_ORDER.reduce((sum, stage) => sum + counts[stage] * STAGE_WEIGHTS[stage], 0);
  const overallProgress = ratio(weightedUnits, total);

  const captureOrBetter = ratio(
    counts.Capture + counts.Trim + counts.Combine + counts.Transfer + counts.Archived,
    total
  );
  const trimOrBetter = ratio(counts.Trim + counts.Combine + counts.Transfer + counts.Archived, total);
  const combineOrBetter = ratio(counts.Combine + counts.Transfer + counts.Archived, total);
  const transferOrBetter = ratio(counts.Transfer + counts.Archived, total);
  const archivedRatio = ratio(counts.Archived, total);

  const phase = assemblyPhase(overallProgress);
  const stageRows: Stage[] = counts.Blocked > 0 ? [...CORE_STAGE_ORDER, "Blocked"] : CORE_STAGE_ORDER;

  const milestoneRows = [
    { label: "Airframe", value: captureOrBetter, hint: "Capture+" },
    { label: "Propulsion", value: trimOrBetter, hint: "Trim+" },
    { label: "Avionics", value: combineOrBetter, hint: "Combine+" },
    { label: "Booster Transfer", value: transferOrBetter, hint: "Transfer+" },
    { label: "Archive Seal", value: archivedRatio, hint: "Archived" },
  ];

  return (
    <div className="grid h-full gap-4 md:grid-cols-5">
      <Card className="mission-panel flex h-full flex-col md:col-span-3">
        <CardHeader className="pb-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[clamp(0.66rem,0.5vw,0.92rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                Assembly Phase
              </p>
              <CardTitle className="mt-1 text-[clamp(1.25rem,1.4vw,2.2rem)] text-cyan-50">{phase.name}</CardTitle>
              <p className="mt-1 text-[clamp(0.7rem,0.56vw,0.98rem)] text-cyan-100/75">{phase.detail}</p>
            </div>
            <div className="rounded-md border border-cyan-300/30 bg-slate-900/80 px-4 py-2 text-right">
              <p className="text-[clamp(0.62rem,0.46vw,0.84rem)] uppercase tracking-[0.16em] text-cyan-100/60">
                Overall Build
              </p>
              <p className="font-mono text-[clamp(1.25rem,1.5vw,2.3rem)] font-semibold text-cyan-50">
                {percent(overallProgress)}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-slate-800/85">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 transition-all duration-700"
              style={{ width: percent(overallProgress) }}
            />
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1">
          <div className="relative h-full min-h-[330px] rounded-xl border border-cyan-300/25 bg-[radial-gradient(circle_at_20%_12%,hsl(190_92%_65%_/_0.16),transparent_40%),radial-gradient(circle_at_84%_14%,hsl(39_100%_67%_/_0.18),transparent_38%),linear-gradient(175deg,hsl(224_45%_11%_/_0.95),hsl(228_48%_8%_/_0.98))]">
            <div className="absolute inset-x-4 top-4 h-px bg-cyan-100/18" />
            <div className="absolute inset-x-4 bottom-8 h-px bg-cyan-100/16" />
            <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-cyan-100/14" />
            <div className="absolute left-1/2 top-5 h-[320px] w-[250px] -translate-x-1/2">
              <div
                className="absolute left-1/2 top-0 h-[86px] w-[96px] -translate-x-1/2 rounded-b-[30px] rounded-t-[95px] border border-cyan-100/35 bg-gradient-to-b from-cyan-100 via-slate-100 to-slate-300 shadow-[0_0_18px_hsl(190_94%_72%_/_0.32)]"
                style={{ opacity: partOpacity(combineOrBetter) }}
              >
                <div className="absolute left-1/2 top-8 h-5 w-5 -translate-x-1/2 rounded-full border border-cyan-300/60 bg-cyan-200/35" />
              </div>

              <div
                className="absolute left-1/2 top-[70px] h-[178px] w-[130px] -translate-x-1/2 rounded-[28px] border border-cyan-100/30 bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500 shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.52)]"
                style={{ opacity: partOpacity(captureOrBetter) }}
              >
                <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-slate-700/40" />
                <div className="absolute inset-x-4 top-8 h-1 rounded-full bg-slate-700/35" />
                <div className="absolute inset-x-4 top-14 h-1 rounded-full bg-slate-700/35" />
              </div>

              <div
                className="absolute left-[24px] top-[118px] h-[126px] w-[44px] rounded-[24px] border border-cyan-100/30 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600"
                style={{ opacity: partOpacity(transferOrBetter) }}
              />
              <div
                className="absolute right-[24px] top-[118px] h-[126px] w-[44px] rounded-[24px] border border-cyan-100/30 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600"
                style={{ opacity: partOpacity(transferOrBetter) }}
              />

              <div
                className="absolute left-1/2 top-[238px] h-[56px] w-[104px] -translate-x-1/2 rounded-b-[24px] rounded-t-[16px] border border-cyan-100/30 bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700"
                style={{ opacity: partOpacity(trimOrBetter) }}
              />

              <div
                className="absolute left-1/2 top-[296px] h-[74px] w-[22px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200 via-orange-400 to-transparent blur-[0.4px] animate-pulse"
                style={{ opacity: trimOrBetter > 0.03 ? 0.1 + trimOrBetter * 0.75 : 0 }}
              />
              <div
                className="absolute left-[38px] top-[280px] h-[56px] w-[14px] rounded-full bg-gradient-to-b from-amber-200 via-orange-400 to-transparent blur-[0.4px] animate-pulse"
                style={{ opacity: transferOrBetter > 0.12 ? 0.08 + transferOrBetter * 0.55 : 0 }}
              />
              <div
                className="absolute right-[38px] top-[280px] h-[56px] w-[14px] rounded-full bg-gradient-to-b from-amber-200 via-orange-400 to-transparent blur-[0.4px] animate-pulse"
                style={{ opacity: transferOrBetter > 0.12 ? 0.08 + transferOrBetter * 0.55 : 0 }}
              />

              <div
                className="absolute left-1/2 top-[108px] h-8 w-8 -translate-x-1/2 rounded-full border border-amber-200/60 bg-amber-200/35 text-center text-sm leading-8 text-amber-100 shadow-[0_0_14px_hsl(42_100%_70%_/_0.45)]"
                style={{ opacity: partOpacity(archivedRatio) }}
              >
                *
              </div>
            </div>

            <div className="absolute inset-x-8 bottom-5 h-4 rounded-full bg-cyan-400/20 blur-sm" />
            <p className="absolute bottom-2 right-3 text-[11px] uppercase tracking-[0.2em] text-cyan-100/65">
              Kerbel-style assembly dock
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:col-span-2">
        <Card className="mission-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Subsystem Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestoneRows.map((milestone) => (
              <div key={milestone.label} className="space-y-1">
                <div className="flex items-center justify-between text-[clamp(0.66rem,0.5vw,0.9rem)] text-cyan-100/80">
                  <p className="font-mono uppercase tracking-[0.12em]">{milestone.label}</p>
                  <p className="font-mono text-cyan-50">
                    {percent(milestone.value)} <span className="text-cyan-100/60">({milestone.hint})</span>
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300 transition-all duration-700"
                    style={{ width: percent(milestone.value) }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mission-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Pipeline to Assembly Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-cyan-300/20 bg-slate-900/70 p-3">
              <p className="text-[clamp(0.64rem,0.48vw,0.82rem)] uppercase tracking-[0.15em] text-cyan-100/60">
                Cataloged Today
              </p>
              <p className="mt-1 text-[clamp(1.15rem,1.2vw,1.8rem)] font-semibold text-cyan-50">{kpis.receivedToday}</p>
            </div>
            {stageRows.map((stage) => {
              const count = counts[stage];
              const share = ratio(count, total);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-[clamp(0.66rem,0.5vw,0.9rem)] text-cyan-100/80">
                    <p className="font-mono uppercase tracking-[0.12em]">{stageLabel(stage)}</p>
                    <p className="font-mono text-cyan-50">
                      {count} <span className="text-cyan-100/60">({percent(share)})</span>
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 transition-all duration-700"
                      style={{ width: percent(share) }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
