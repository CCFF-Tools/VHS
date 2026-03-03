import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MissionState } from "@/lib/types";

const OBJECTIVES = [
  "Rescue the signal (capture before deterioration accelerates).",
  "Stabilize payloads (trim, combine, and continuity checks).",
  "Archive Seal cargo (certify chain-of-custody).",
  "Depart for Meridia.",
  "Land at Fluxfall Basin.",
  "Expand The Stacks into a permanent municipal archive.",
];

const WORKFLOW_MAPPING = [
  { label: "Awaiting Capture", lore: "Blueprint backlog and jigs waiting for material." },
  { label: "Captured", lore: "Airframe construction and hull growth." },
  { label: "Trimmed + Combined", lore: "Course plotting and command integration." },
  { label: "Archived", lore: "Archive Seal certification and colony phase advancement." },
  { label: "Blocked", lore: "Quarantine pressure. Blocked work never advances mission phases." },
];

const CREW = [
  { name: "Genev Kerman", role: "Flight Director", color: "from-cyan-300 to-sky-300" },
  { name: "Dexrin Kerman", role: "Window Analyst", color: "from-amber-300 to-orange-300" },
  { name: "Rivet Kerman", role: "Airframe Chief", color: "from-emerald-300 to-cyan-300" },
  { name: "Paxlo Kerman", role: "GNC Lead", color: "from-fuchsia-300 to-pink-300" },
  { name: "Nora Kerman", role: "Payload Officer", color: "from-indigo-300 to-cyan-300" },
  { name: "Vexa Kerman", role: "QA / Anomaly", color: "from-rose-300 to-amber-300" },
];

function crewLine(state: MissionState) {
  if (state.overlays.quarantine) {
    return "Vexa: Quarantine is rising. Clear blocked anomalies before phase advancement.";
  }
  if (state.deadline.status === "missed") {
    return "Dexrin: Signal Fade threshold exceeded. Recovery pressure is now critical.";
  }
  return "Genev: Launch window still open. Keep Archive Seal cadence up and hold trajectory discipline.";
}

function KermanBadge({
  name,
  role,
  color,
}: {
  name: string;
  role: string;
  color: string;
}) {
  return (
    <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`relative h-10 w-10 rounded-full bg-gradient-to-br ${color} p-[1px]`}>
          <div className="relative h-full w-full rounded-full bg-[#1d2e4d]">
            <div className="absolute left-1/2 top-[28%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-lime-200" />
            <div className="absolute left-[28%] top-[46%] h-1.5 w-1.5 rounded-full bg-slate-900" />
            <div className="absolute right-[28%] top-[46%] h-1.5 w-1.5 rounded-full bg-slate-900" />
            <div className="absolute bottom-[22%] left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-slate-900/80" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[clamp(0.78rem,0.62vw,1rem)] font-semibold text-cyan-50">{name}</p>
          <p className="truncate font-mono text-[clamp(0.68rem,0.54vw,0.86rem)] uppercase tracking-[0.08em] text-cyan-100/70">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MissionLoreBriefingSlide({ missionState }: { missionState: MissionState }) {
  return (
    <div className="grid h-full gap-4 lg:grid-cols-5">
      <Card className="mission-panel flex h-full min-h-0 flex-col lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-50">Kerman Lore + Mission Objectives</CardTitle>
          <p className="text-[clamp(0.82rem,0.66vw,1.1rem)] text-cyan-100/80">
            The Kermans are caretakers of municipal memory under Core Cascade pressure.
          </p>
        </CardHeader>
        <CardContent className="min-h-0 space-y-3 overflow-auto pr-1">
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3.5">
            <p className="text-[clamp(0.86rem,0.7vw,1.18rem)] leading-relaxed text-cyan-100/90">
              A planetary core reaction called <span className="font-semibold text-cyan-50">Core Cascade</span> is
              destabilizing magnetic fields and accelerating media degradation. The Great{" "}
              <span className="font-semibold text-cyan-50">Signal Fade</span> is the point-of-no-return. Mission
              success means digitizing, verifying, and Archive Sealing civic records, then evacuating to{" "}
              <span className="font-semibold text-cyan-50">Meridia</span>, landing at{" "}
              <span className="font-semibold text-cyan-50">Fluxfall Basin</span>, and growing{" "}
              <span className="font-semibold text-cyan-50">The Stacks</span>.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3.5">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.92rem)] uppercase tracking-[0.14em] text-cyan-100/70">
                Mission Objectives
              </p>
              <ol className="mt-2 space-y-1.5 text-[clamp(0.8rem,0.62vw,1rem)] text-cyan-100/85">
                {OBJECTIVES.map((item, index) => (
                  <li key={item}>
                    <span className="mr-1.5 font-semibold text-cyan-50">{index + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3.5">
              <p className="font-mono text-[clamp(0.72rem,0.56vw,0.92rem)] uppercase tracking-[0.14em] text-cyan-100/70">
                Workflow to Lore Mapping
              </p>
              <div className="mt-2 space-y-1.5">
                {WORKFLOW_MAPPING.map((row) => (
                  <div key={row.label} className="rounded border border-cyan-300/20 bg-slate-950/55 px-2.5 py-2">
                    <p className="font-mono text-[clamp(0.68rem,0.52vw,0.84rem)] uppercase tracking-[0.1em] text-cyan-50">
                      {row.label}
                    </p>
                    <p className="mt-1 text-[clamp(0.76rem,0.58vw,0.94rem)] text-cyan-100/75">{row.lore}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="rounded-md border border-cyan-300/30 bg-cyan-950/35 px-3 py-2 text-[clamp(0.76rem,0.58vw,0.98rem)] text-cyan-100">
            {crewLine(missionState)}
          </p>
        </CardContent>
      </Card>

      <div className="grid h-full min-h-0 gap-4 lg:col-span-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="mission-panel min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Mission Route Diagram</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 h-full">
            <div className="relative h-full min-h-[220px] overflow-hidden rounded-lg border border-cyan-300/25 bg-[#081a39]/80">
              <svg viewBox="0 0 920 420" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="routeLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="55%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#0e2d66" />
                  </radialGradient>
                </defs>

                <rect x="0" y="0" width="920" height="420" fill="rgba(8, 19, 43, 0.42)" />
                <path
                  d="M 70 315 C 240 245 305 260 420 200 C 545 136 690 180 850 120"
                  stroke="url(#routeLine)"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                />

                <circle cx="80" cy="316" r="24" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="4" />
                <text x="80" y="355" textAnchor="middle" fill="#c7eaff" fontSize="20" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Origin
                </text>

                <circle cx="410" cy="208" r="22" fill="#f59e0b" stroke="#fde68a" strokeWidth="4" />
                <text x="410" y="245" textAnchor="middle" fill="#ffe7b1" fontSize="19" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Launch
                </text>

                <circle cx="720" cy="160" r="56" fill="url(#planetGlow)" stroke="#e0f2fe" strokeWidth="4.5" />
                <text x="720" y="169" textAnchor="middle" fill="#ecfeff" fontSize="20" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
                  Meridia
                </text>

                <circle cx="820" cy="130" r="14" fill="#34d399" stroke="#d1fae5" strokeWidth="3.2" />
                <text x="820" y="107" textAnchor="middle" fill="#bcf5df" fontSize="16" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Fluxfall
                </text>

                <rect x="785" y="245" width="96" height="66" rx="10" fill="#0f2f3f" stroke="#99f6e4" strokeWidth="3" />
                <text x="833" y="284" textAnchor="middle" fill="#ccfbf1" fontSize="16" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  The Stacks
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-panel min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-cyan-50">Kerman Command Pods</CardTitle>
          </CardHeader>
          <CardContent className="grid min-h-0 gap-2 overflow-auto pr-1 sm:grid-cols-2">
            {CREW.map((member) => (
              <KermanBadge key={member.name} name={member.name} role={member.role} color={member.color} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
