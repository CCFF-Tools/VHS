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

function workerOpacity(value: number) {
  if (value <= 0.02) return 0;
  return 0.3 + clamp01(value) * 0.7;
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

function BlueprintWorker({
  x,
  y,
  progress,
  suit,
  accent,
  label,
  tool,
}: {
  x: number;
  y: number;
  progress: number;
  suit: string;
  accent: string;
  label: string;
  tool: "wrench" | "tablet" | "torch";
}) {
  const opacity = workerOpacity(progress);

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <ellipse cx="0" cy="23" rx="19" ry="6" fill="rgba(5, 14, 38, 0.45)" />

      <circle cx="0" cy="-40" r="17" fill="#90d85a" stroke="#e3f8ce" strokeWidth="2.2" />
      <circle cx="-6.2" cy="-42" r="4.7" fill="#fff" />
      <circle cx="6.2" cy="-42" r="4.7" fill="#fff" />
      <circle cx="-5.8" cy="-41.8" r="2.2" fill="#17203f" />
      <circle cx="6.6" cy="-41.8" r="2.2" fill="#17203f" />
      <path d="M -6 -32 C -2 -27 2 -27 6 -32" fill="none" stroke="#163118" strokeWidth="1.8" strokeLinecap="round" />

      <path
        d="M -19 -42 C -17 -57 17 -57 19 -42 L 16 -49 C 9 -57 -9 -57 -16 -49 Z"
        fill="#eef4ff"
        stroke="#9cb8de"
        strokeWidth="1.4"
      />
      <rect x="-13" y="-24" width="26" height="31" rx="8" fill={suit} stroke="#d5ecff" strokeWidth="1.2" />
      <rect x="-12" y="-24" width="24" height="7" rx="3" fill={accent} opacity="0.9" />

      <rect x="-20" y="-17" width="7" height="17" rx="3.5" fill="#f1f8ff" stroke="#9bb9da" strokeWidth="1" />
      <rect x="13" y="-17" width="7" height="17" rx="3.5" fill="#f1f8ff" stroke="#9bb9da" strokeWidth="1" />

      <rect x="-11" y="7" width="8" height="17" rx="3" fill="#eef4ff" stroke="#9bb9da" strokeWidth="1" />
      <rect x="3" y="7" width="8" height="17" rx="3" fill="#eef4ff" stroke="#9bb9da" strokeWidth="1" />

      {tool === "wrench" && (
        <g>
          <line x1="19" y1="-9" x2="36" y2="-20" stroke="#c6ddf6" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="38.5" cy="-21.5" r="3.4" fill="none" stroke="#c6ddf6" strokeWidth="2" />
        </g>
      )}
      {tool === "tablet" && (
        <g>
          <rect x="17" y="-12" width="13" height="16" rx="2.5" fill="#1f355f" stroke="#8fc6ff" strokeWidth="1.3" />
          <circle cx="23.5" cy="0.5" r="1" fill="#8fc6ff" />
        </g>
      )}
      {tool === "torch" && (
        <g>
          <line x1="18" y1="-10" x2="35" y2="-14" stroke="#c6ddf6" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 35 -14 L 42 -17" stroke="#ffd27a" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      <rect x="-39" y="-63" width="78" height="14" rx="6" fill="rgba(9, 27, 67, 0.82)" stroke="rgba(206, 233, 255, 0.55)" />
      <text
        x="0"
        y="-54"
        textAnchor="middle"
        fill="#dff5ff"
        fontSize="7.5"
        letterSpacing="0.8"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {label}
      </text>
    </g>
  );
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

  const technicalCallouts = [
    {
      title: "Command Capsule",
      detail: "Guidance, windows, and control stack",
      value: combineOrBetter,
      className: "left-4 top-4",
      align: "left" as const,
    },
    {
      title: "Main Airframe",
      detail: "Capture-aligned hull sections and couplers",
      value: captureOrBetter,
      className: "left-4 top-[136px]",
      align: "left" as const,
    },
    {
      title: "Booster Pair",
      detail: "Transfer-ready side modules and clamps",
      value: transferOrBetter,
      className: "right-4 top-4 text-right",
      align: "right" as const,
    },
    {
      title: "Engine Cluster",
      detail: "Trim stage nozzle integration",
      value: trimOrBetter,
      className: "right-4 top-[136px] text-right",
      align: "right" as const,
    },
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
          <div className="relative h-full min-h-[360px] overflow-hidden rounded-xl border border-cyan-200/40 bg-[#0d3b95] shadow-[inset_0_0_0_1px_rgba(214,239,255,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:22px_22px] opacity-55" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:110px_110px] opacity-30" />
            <div className="pointer-events-none absolute inset-2 border border-cyan-100/55" />

            <svg viewBox="0 0 1000 620" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="shipHull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4f7fd" />
                  <stop offset="48%" stopColor="#cfd9ea" />
                  <stop offset="100%" stopColor="#9cacbf" />
                </linearGradient>
                <linearGradient id="shipHullDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c7d4e8" />
                  <stop offset="100%" stopColor="#7d8ca2" />
                </linearGradient>
                <linearGradient id="plume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffe9a3" />
                  <stop offset="52%" stopColor="#ff9f45" />
                  <stop offset="100%" stopColor="rgba(255, 136, 57, 0)" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <line x1="240" y1="116" x2="430" y2="130" stroke="rgba(220,243,255,0.92)" strokeWidth="3" />
              <line x1="220" y1="248" x2="430" y2="235" stroke="rgba(220,243,255,0.92)" strokeWidth="3" />
              <line x1="780" y1="116" x2="570" y2="158" stroke="rgba(220,243,255,0.92)" strokeWidth="3" />
              <line x1="785" y1="248" x2="570" y2="292" stroke="rgba(220,243,255,0.92)" strokeWidth="3" />

              <g opacity={partOpacity(combineOrBetter)}>
                <path
                  d="M 500 74 L 542 145 Q 500 166 458 145 Z"
                  fill="url(#shipHull)"
                  stroke="#f0f7ff"
                  strokeWidth="4"
                />
                <ellipse cx="500" cy="145" rx="43" ry="8" fill="rgba(117, 139, 165, 0.55)" />
                <ellipse cx="500" cy="108" rx="15" ry="10" fill="#87bde3" stroke="#ebf8ff" strokeWidth="2" />
              </g>

              <g opacity={partOpacity(captureOrBetter)}>
                <rect x="440" y="145" width="120" height="258" rx="30" fill="url(#shipHull)" stroke="#eef6ff" strokeWidth="4" />
                <line x1="500" y1="160" x2="500" y2="390" stroke="rgba(70, 88, 112, 0.48)" strokeWidth="2.5" />
                <line x1="458" y1="205" x2="542" y2="205" stroke="rgba(68, 88, 113, 0.36)" strokeWidth="2.5" />
                <line x1="458" y1="258" x2="542" y2="258" stroke="rgba(68, 88, 113, 0.36)" strokeWidth="2.5" />
                <line x1="458" y1="311" x2="542" y2="311" stroke="rgba(68, 88, 113, 0.36)" strokeWidth="2.5" />
              </g>

              <g opacity={partOpacity(transferOrBetter)}>
                <rect x="365" y="208" width="62" height="190" rx="30" fill="url(#shipHullDark)" stroke="#e8f4ff" strokeWidth="3" />
                <rect x="573" y="208" width="62" height="190" rx="30" fill="url(#shipHullDark)" stroke="#e8f4ff" strokeWidth="3" />
                <rect x="380" y="278" width="32" height="18" rx="8" fill="#83b8e0" opacity="0.75" />
                <rect x="588" y="278" width="32" height="18" rx="8" fill="#83b8e0" opacity="0.75" />
              </g>

              <g opacity={partOpacity(trimOrBetter)}>
                <rect x="448" y="395" width="104" height="54" rx="20" fill="url(#shipHullDark)" stroke="#e8f4ff" strokeWidth="3" />
                <rect x="486" y="440" width="28" height="22" rx="10" fill="#717f94" stroke="#d8e8f9" strokeWidth="2" />
              </g>

              <g opacity={partOpacity(trimOrBetter)} filter="url(#softGlow)">
                <path d="M 500 462 C 490 495 486 520 500 548 C 514 520 510 495 500 462 Z" fill="url(#plume)" />
              </g>
              <g opacity={partOpacity(transferOrBetter)} filter="url(#softGlow)">
                <path d="M 396 396 C 389 422 387 444 396 466 C 406 444 404 422 396 396 Z" fill="url(#plume)" />
                <path d="M 604 396 C 597 422 595 444 604 466 C 614 444 612 422 604 396 Z" fill="url(#plume)" />
              </g>

              <g opacity={partOpacity(archivedRatio)}>
                <circle cx="500" cy="217" r="17" fill="#ffdf83" stroke="#fff1ca" strokeWidth="3" />
                <path d="M 500 204 L 504 214 L 515 214 L 506 220 L 510 230 L 500 224 L 490 230 L 494 220 L 485 214 L 496 214 Z" fill="#f29628" />
              </g>

              <line x1="500" y1="145" x2="500" y2="462" stroke="rgba(223,247,255,0.18)" strokeWidth="2" strokeDasharray="5 10" />
              <line x1="330" y1="445" x2="670" y2="445" stroke="rgba(223,247,255,0.18)" strokeWidth="2" strokeDasharray="5 10" />

              <BlueprintWorker
                x={344}
                y={426}
                progress={captureOrBetter}
                suit="#5fc6ff"
                accent="#fee48a"
                label="Bolt Crew"
                tool="wrench"
              />
              <BlueprintWorker
                x={656}
                y={400}
                progress={combineOrBetter}
                suit="#f2a2ff"
                accent="#a9ffe0"
                label="Nav Crew"
                tool="tablet"
              />
              <BlueprintWorker
                x={500}
                y={516}
                progress={trimOrBetter}
                suit="#7fe8b9"
                accent="#ffd0a8"
                label="Engine Crew"
                tool="torch"
              />

              <circle cx="240" cy="116" r="4" fill="#f8fdff" />
              <circle cx="220" cy="248" r="4" fill="#f8fdff" />
              <circle cx="780" cy="116" r="4" fill="#f8fdff" />
              <circle cx="785" cy="248" r="4" fill="#f8fdff" />
            </svg>

            {technicalCallouts.map((callout) => (
              <div
                key={callout.title}
                className={`absolute max-w-[220px] rounded-md border border-cyan-100/45 bg-[#082968]/80 px-3 py-2 text-cyan-50 ${callout.className}`}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">{callout.title}</p>
                <p className="mt-1 font-mono text-[11px] text-cyan-50">{percent(callout.value)}</p>
                <p className="mt-1 text-[10px] leading-snug text-cyan-100/80">{callout.detail}</p>
                <div
                  className={`mt-1 h-px w-12 bg-cyan-100/60 ${callout.align === "right" ? "ml-auto" : "mr-auto"}`}
                />
              </div>
            ))}

            <div className="absolute inset-x-2 bottom-2 grid grid-cols-12 gap-2 text-cyan-50">
              <div className="col-span-7 rounded-sm border border-cyan-100/45 bg-[#07235a]/90 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/85">Orbital Assembly Brief</p>
                <p className="mt-1 text-[10px] leading-snug text-cyan-100/80">
                  Live workflow stages are mapped to module completion, crew activity, and launch stack readiness in real time.
                </p>
              </div>
              <div className="col-span-5 rounded-sm border border-cyan-100/45 bg-[#07235a]/90 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/85">Crewed Build Index</p>
                <p className="mt-1 font-mono text-[10px] text-cyan-100/85">Capture+ {percent(captureOrBetter)}</p>
                <p className="font-mono text-[10px] text-cyan-100/85">Trim+ {percent(trimOrBetter)}</p>
                <p className="font-mono text-[10px] text-cyan-100/85">Archived {percent(archivedRatio)}</p>
              </div>
            </div>
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
