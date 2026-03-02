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

function KerbalCrew({
  x,
  y,
  progress,
  name,
  title,
  role,
  badgeDx = 0,
  badgeDy = 0,
}: {
  x: number;
  y: number;
  progress: number;
  name: string;
  title: string;
  role: "eva" | "marshal" | "scientist";
  badgeDx?: number;
  badgeDy?: number;
}) {
  const opacity = workerOpacity(progress);

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <ellipse cx="0" cy="47" rx="34" ry="10" fill="rgba(5, 14, 38, 0.45)" />

      {role === "eva" && (
        <g>
          <ellipse cx="0" cy="-30" rx="42" ry="42" fill="url(#helmetShell)" stroke="#f6f9ff" strokeWidth="2.4" />
          <ellipse cx="0" cy="-30" rx="34" ry="33" fill="url(#helmetVisor)" stroke="#d8e8ff" strokeWidth="1.4" />
          <ellipse cx="0" cy="8" rx="38" ry="6.5" fill="url(#helmetRim)" stroke="#dce7f9" strokeWidth="1.2" />
        </g>
      )}

      <g>
        <rect x="-20" y="-56" width="40" height="56" rx="18" fill="url(#kerbalSkin)" stroke="#dcf3bf" strokeWidth="2" />
        {role === "marshal" && <path d="M -20 -55 Q 0 -70 20 -55 L 20 -49 Q 0 -60 -20 -49 Z" fill="url(#kerbalHair)" />}
        {role === "scientist" && <path d="M -20 -55 Q -2 -68 20 -55 L 20 -45 Q 0 -54 -20 -44 Z" fill="#5f442c" />}

        <circle cx="-8.5" cy="-32" r="8.5" fill="#fff" />
        <circle cx="8.5" cy="-32" r="8.5" fill="#fff" />
        <circle cx="-6.5" cy="-31" r="3.2" fill="#121928" />
        <circle cx="10" cy="-31" r="3.2" fill="#121928" />

        {role === "scientist" && (
          <g fill="none" stroke="#131927" strokeWidth="1.7">
            <circle cx="-8.5" cy="-32" r="11.5" />
            <circle cx="8.5" cy="-32" r="11.5" />
            <line x1="-0.5" y1="-32" x2="0.5" y2="-32" />
          </g>
        )}

        {role === "marshal" && (
          <path
            d="M -7 -17 Q -1 -19 7 -17"
            fill="none"
            stroke="#2f3d1d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
        {role === "eva" && <path d="M -8 -18 Q -1 -11 8 -18" fill="none" stroke="#243318" strokeWidth="1.6" strokeLinecap="round" />}
        {role === "scientist" && (
          <path
            d="M -8 -18 Q -1 -9 8 -18"
            fill="none"
            stroke="#243318"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </g>

      {role === "eva" && (
        <g>
          <rect x="-24" y="-2" width="48" height="52" rx="13" fill="url(#evaSuit)" stroke="#ffd596" strokeWidth="1.6" />
          <rect x="-6" y="2" width="12" height="44" rx="5" fill="#243554" />
          <rect x="-33" y="5" width="11" height="24" rx="5.5" fill="url(#evaSuit)" stroke="#ffd596" strokeWidth="1.2" />
          <rect x="22" y="5" width="11" height="24" rx="5.5" fill="url(#evaSuit)" stroke="#ffd596" strokeWidth="1.2" />
          <rect x="-18" y="50" width="13" height="24" rx="5" fill="url(#suitShadow)" />
          <rect x="5" y="50" width="13" height="24" rx="5" fill="url(#suitShadow)" />
          <ellipse cx="-12" cy="74" rx="12" ry="6" fill="url(#bootDark)" />
          <ellipse cx="12" cy="74" rx="12" ry="6" fill="url(#bootDark)" />
        </g>
      )}

      {role === "marshal" && (
        <g>
          <rect x="-22" y="-2" width="44" height="49" rx="12" fill="#2a3549" />
          <path d="M -22 8 H 22 V 30 H -22 Z" fill="url(#vestLime)" />
          <path d="M -7 8 H -2 V 47 H -7 Z M 2 8 H 7 V 47 H 2 Z" fill="#ebffd0" opacity="0.75" />
          <rect x="-30" y="5" width="10" height="23" rx="5" fill="#27344c" />
          <rect x="20" y="5" width="10" height="23" rx="5" fill="#27344c" />
          <rect x="-17" y="47" width="12" height="24" rx="4.5" fill="#1d2231" />
          <rect x="5" y="47" width="12" height="24" rx="4.5" fill="#1d2231" />
          <ellipse cx="-11" cy="71" rx="12" ry="6" fill="url(#bootDark)" />
          <ellipse cx="11" cy="71" rx="12" ry="6" fill="url(#bootDark)" />
          <rect x="-36" y="10" width="5" height="21" rx="2.2" fill="#ff7a35" />
          <rect x="31" y="10" width="5" height="21" rx="2.2" fill="#ff7a35" />
        </g>
      )}

      {role === "scientist" && (
        <g>
          <rect x="-22" y="-2" width="44" height="14" rx="7" fill="#91b7ff" />
          <rect x="-24" y="8" width="48" height="45" rx="12" fill="url(#labCoat)" stroke="#e7f4ff" strokeWidth="1.2" />
          <rect x="-5" y="9" width="10" height="38" rx="4" fill="#94adcc" />
          <circle cx="0" cy="18" r="1.2" fill="#5b6f8c" />
          <circle cx="0" cy="25" r="1.2" fill="#5b6f8c" />
          <circle cx="0" cy="32" r="1.2" fill="#5b6f8c" />
          <rect x="-31" y="8" width="10" height="22" rx="5" fill="#eff8ff" stroke="#d8eaf8" strokeWidth="1.1" />
          <rect x="21" y="8" width="10" height="22" rx="5" fill="#eff8ff" stroke="#d8eaf8" strokeWidth="1.1" />
          <rect x="-17" y="52" width="12" height="22" rx="4.5" fill="#453324" />
          <rect x="5" y="52" width="12" height="22" rx="4.5" fill="#453324" />
          <ellipse cx="-11" cy="74" rx="12" ry="6" fill="url(#bootDark)" />
          <ellipse cx="11" cy="74" rx="12" ry="6" fill="url(#bootDark)" />
        </g>
      )}

      <rect
        x={-74 + badgeDx}
        y={-100 + badgeDy}
        width="148"
        height="38"
        rx="8"
        fill="rgba(4, 17, 45, 0.98)"
        stroke="rgba(228, 246, 255, 0.94)"
        strokeWidth="1.3"
      />
      <rect
        x={-68 + badgeDx}
        y={-94 + badgeDy}
        width="136"
        height="12"
        rx="5"
        fill="rgba(169, 219, 255, 0.16)"
      />
      <line
        x1={badgeDx}
        y1={-62 + badgeDy}
        x2={0}
        y2={-45}
        stroke="rgba(214, 237, 255, 0.9)"
        strokeWidth="1.4"
      />
      <circle cx={0} cy={-45} r="2.1" fill="rgba(214, 237, 255, 0.96)" />
      <text
        x={badgeDx}
        y={-79 + badgeDy}
        textAnchor="middle"
        fill="rgba(0, 0, 0, 0.65)"
        fontSize="9.2"
        letterSpacing="0.4"
        style={{ fontFamily: "'Manrope', 'IBM Plex Mono', sans-serif", fontWeight: 700 }}
      >
        {name}
      </text>
      <text
        x={badgeDx}
        y={-80 + badgeDy}
        textAnchor="middle"
        fill="#f4fcff"
        fontSize="9.2"
        letterSpacing="0.4"
        style={{ fontFamily: "'Manrope', 'IBM Plex Mono', sans-serif", fontWeight: 700 }}
      >
        {name}
      </text>
      <text
        x={badgeDx}
        y={-67 + badgeDy}
        textAnchor="middle"
        fill="rgba(0, 0, 0, 0.65)"
        fontSize="7.1"
        letterSpacing="1"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {title}
      </text>
      <text
        x={badgeDx}
        y={-68 + badgeDy}
        textAnchor="middle"
        fill="#c8eaff"
        fontSize="7.1"
        letterSpacing="1"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {title}
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

  const assemblySteps = [
    { label: "Frame & Couplers", minProgress: 0.18 },
    { label: "Engine Mounting", minProgress: 0.38 },
    { label: "Reticulating Splines", minProgress: 0.56 },
    { label: "Guidance Wiring", minProgress: 0.68 },
    { label: "Payload Integration", minProgress: 0.82 },
    { label: "Archive Seal", minProgress: 0.95 },
  ];

  return (
    <div className="grid h-full gap-4 md:grid-cols-5">
      <Card className="mission-panel flex h-full flex-col md:col-span-3">
        <CardHeader className="pb-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[clamp(0.78rem,0.62vw,1.08rem)] uppercase tracking-[0.16em] text-cyan-100/65">
                Assembly Phase
              </p>
              <CardTitle className="mt-1 text-[clamp(1.45rem,1.6vw,2.5rem)] text-cyan-50">{phase.name}</CardTitle>
              <p className="mt-1 text-[clamp(0.82rem,0.66vw,1.16rem)] text-cyan-100/75">{phase.detail}</p>
            </div>
            <div className="rounded-md border border-cyan-300/30 bg-slate-900/80 px-4 py-2 text-right">
              <p className="text-[clamp(0.74rem,0.56vw,0.98rem)] uppercase tracking-[0.16em] text-cyan-100/60">
                Overall Build
              </p>
              <p className="font-mono text-[clamp(1.45rem,1.7vw,2.6rem)] font-semibold text-cyan-50">
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
                <linearGradient id="kerbalSkin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b9e87c" />
                  <stop offset="100%" stopColor="#8db55d" />
                </linearGradient>
                <linearGradient id="kerbalHair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#544132" />
                  <stop offset="100%" stopColor="#2a2019" />
                </linearGradient>
                <linearGradient id="helmetShell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#c4cfde" />
                </linearGradient>
                <linearGradient id="helmetRim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b6c3d8" />
                  <stop offset="100%" stopColor="#7f8da3" />
                </linearGradient>
                <linearGradient id="helmetVisor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 24, 38, 0.82)" />
                  <stop offset="100%" stopColor="rgba(28, 41, 66, 0.58)" />
                </linearGradient>
                <linearGradient id="evaSuit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffa942" />
                  <stop offset="100%" stopColor="#d47a16" />
                </linearGradient>
                <linearGradient id="suitShadow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#444c63" />
                  <stop offset="100%" stopColor="#21293b" />
                </linearGradient>
                <linearGradient id="labCoat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8fcff" />
                  <stop offset="100%" stopColor="#dfeaf5" />
                </linearGradient>
                <linearGradient id="vestLime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#97f25b" />
                  <stop offset="100%" stopColor="#62b93e" />
                </linearGradient>
                <linearGradient id="bootDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f2638" />
                  <stop offset="100%" stopColor="#0f131f" />
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

              <text
                x="84"
                y="98"
                fill="rgba(0,0,0,0.5)"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                COMMAND CAPSULE
              </text>
              <text
                x="84"
                y="96"
                fill="#eefbff"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                COMMAND CAPSULE
              </text>
              <text
                x="84"
                y="122"
                fill="#d7efff"
                fontSize="14"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
              >
                {percent(combineOrBetter)}
              </text>

              <text
                x="84"
                y="230"
                fill="rgba(0,0,0,0.5)"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                MAIN AIRFRAME
              </text>
              <text
                x="84"
                y="228"
                fill="#eefbff"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                MAIN AIRFRAME
              </text>
              <text
                x="84"
                y="254"
                fill="#d7efff"
                fontSize="14"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
              >
                {percent(captureOrBetter)}
              </text>

              <text
                x="916"
                y="98"
                textAnchor="end"
                fill="rgba(0,0,0,0.5)"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                BOOSTER PAIR
              </text>
              <text
                x="916"
                y="96"
                textAnchor="end"
                fill="#eefbff"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                BOOSTER PAIR
              </text>
              <text
                x="916"
                y="122"
                textAnchor="end"
                fill="#d7efff"
                fontSize="14"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
              >
                {percent(transferOrBetter)}
              </text>

              <text
                x="916"
                y="230"
                textAnchor="end"
                fill="rgba(0,0,0,0.5)"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                ENGINE CLUSTER
              </text>
              <text
                x="916"
                y="228"
                textAnchor="end"
                fill="#eefbff"
                fontSize="22"
                letterSpacing="1.1"
                style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}
              >
                ENGINE CLUSTER
              </text>
              <text
                x="916"
                y="254"
                textAnchor="end"
                fill="#d7efff"
                fontSize="14"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}
              >
                {percent(trimOrBetter)}
              </text>

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

              <KerbalCrew
                x={344}
                y={426}
                progress={captureOrBetter}
                name="Jebrin Kerman"
                title="EVA TECHNICIAN"
                role="eva"
                badgeDx={-74}
                badgeDy={-18}
              />
              <KerbalCrew
                x={656}
                y={400}
                progress={combineOrBetter}
                name="Valdo Kerman"
                title="RUNWAY MARSHAL"
                role="marshal"
                badgeDx={84}
                badgeDy={-12}
              />
              <KerbalCrew
                x={500}
                y={516}
                progress={trimOrBetter}
                name="Mira Kerman"
                title="SCIENCE LEAD"
                role="scientist"
                badgeDx={0}
                badgeDy={-44}
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
                <p className="text-[clamp(0.84rem,0.68vw,1.26rem)] uppercase tracking-[0.12em] text-cyan-100/88">{callout.title}</p>
                <p className="mt-1 font-mono text-[clamp(0.92rem,0.76vw,1.34rem)] text-cyan-50">{percent(callout.value)}</p>
                <p className="mt-1 text-[clamp(0.74rem,0.56vw,1rem)] leading-snug text-cyan-100/86">{callout.detail}</p>
                <div
                  className={`mt-1 h-px w-12 bg-cyan-100/60 ${callout.align === "right" ? "ml-auto" : "mr-auto"}`}
                />
              </div>
            ))}

            <div className="absolute inset-x-2 bottom-2 grid grid-cols-12 gap-2 text-cyan-50">
              <div className="col-span-7 rounded-sm border border-cyan-100/45 bg-[#07235a]/90 px-3 py-2">
                <p className="text-[clamp(0.7rem,0.52vw,0.92rem)] uppercase tracking-[0.14em] text-cyan-100/85">Orbital Assembly Brief</p>
                <p className="mt-1 text-[clamp(0.68rem,0.5vw,0.9rem)] leading-snug text-cyan-100/80">
                  Live workflow stages are mapped to module completion, crew activity, and launch stack readiness in real time.
                </p>
              </div>
              <div className="col-span-5 rounded-sm border border-cyan-100/45 bg-[#07235a]/90 px-3 py-2">
                <p className="text-[clamp(0.7rem,0.52vw,0.92rem)] uppercase tracking-[0.14em] text-cyan-100/85">Crewed Build Index</p>
                <p className="mt-1 font-mono text-[clamp(0.68rem,0.5vw,0.9rem)] text-cyan-100/85">Capture+ {percent(captureOrBetter)}</p>
                <p className="font-mono text-[clamp(0.68rem,0.5vw,0.9rem)] text-cyan-100/85">Trim+ {percent(trimOrBetter)}</p>
                <p className="font-mono text-[clamp(0.68rem,0.5vw,0.9rem)] text-cyan-100/85">Archived {percent(archivedRatio)}</p>
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
                <div className="flex items-center justify-between text-[clamp(0.78rem,0.62vw,1.05rem)] text-cyan-100/80">
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
            <div className="rounded-md border border-cyan-200/30 bg-slate-900/70 p-3">
              <p className="text-[clamp(0.82rem,0.66vw,1.16rem)] font-semibold uppercase tracking-[0.12em] text-cyan-100/88">
                Assembly Steps
              </p>
              <div className="mt-2 space-y-1.5">
                {assemblySteps.map((step) => {
                  const complete = overallProgress >= step.minProgress;
                  return (
                    <div
                      key={step.label}
                      className="flex items-center justify-between text-[clamp(0.8rem,0.63vw,1.08rem)]"
                    >
                      <p className={complete ? "font-semibold text-cyan-50" : "font-semibold text-cyan-100/70"}>
                        {step.label}
                      </p>
                      <span
                        className={`font-mono text-[clamp(0.7rem,0.54vw,0.92rem)] ${
                          complete ? "text-emerald-200" : "text-amber-200/90"
                        }`}
                      >
                        {complete ? "COMPLETE" : "IN WORK"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Pipeline to Assembly Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-cyan-300/20 bg-slate-900/70 p-3">
              <p className="text-[clamp(0.76rem,0.58vw,0.98rem)] uppercase tracking-[0.15em] text-cyan-100/60">
                Cataloged Today
              </p>
              <p className="mt-1 text-[clamp(1.35rem,1.45vw,2.1rem)] font-semibold text-cyan-50">{kpis.receivedToday}</p>
            </div>
            {stageRows.map((stage) => {
              const count = counts[stage];
              const share = ratio(count, total);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-[clamp(0.78rem,0.62vw,1.05rem)] text-cyan-100/80">
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
