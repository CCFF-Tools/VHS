import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMissionBriefingQuotes } from "@/lib/kerman-quotes";
import type { MissionState } from "@/lib/types";

const OBJECTIVES = [
  "Preserve the signal (capture before deterioration accelerates)",
  "Mange VHS logistics (track mission progress through Airtable)",
  "Stabilize payloads (trim, combine, and export files)",
  "Depart for Meridia. (Initiate transfer of all files to NAS)",
  "Land at Fluxfall Basin. (Final verification of archive status of each tape)",
  "Expand The Stacks into a permanent off world municipal archive. (Upload files to final public archive, probably YouTube)",
];

const CREW = [
  { name: "Genev Kerman", role: "Flight Director", color: "from-cyan-300 to-sky-300" },
  { name: "Dexrin Kerman", role: "Window Analyst", color: "from-amber-300 to-orange-300" },
  { name: "Rivet Kerman", role: "Airframe Chief", color: "from-emerald-300 to-cyan-300" },
  { name: "Paxlo Kerman", role: "GNC Lead", color: "from-fuchsia-300 to-pink-300" },
  { name: "Nora Kerman", role: "Payload Officer", color: "from-indigo-300 to-cyan-300" },
  { name: "Vexa Kerman", role: "QA / Anomaly", color: "from-rose-300 to-amber-300" },
];

function primaryCrewLine(state: MissionState) {
  if (state.overlays.quarantine) {
    return "Vexa: Quarantine is rising. Clear blocked anomalies before phase advancement.";
  }
  if (state.deadline.status === "missed") {
    return "Dexrin: Signal Fade threshold exceeded. Recovery pressure is now critical.";
  }
  return "Genev: Launch window still open. Keep archiving cadence up and hold trajectory discipline.";
}

function crewQuotes(state: MissionState) {
  const generated = getMissionBriefingQuotes(state, 6).map((quote) => `${quote.speaker}: ${quote.line}`);
  const combined = [primaryCrewLine(state), ...generated];
  return combined.filter((line, index) => combined.indexOf(line) === index).slice(0, 5);
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
    <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3">
      <div className="flex items-center gap-3">
        <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${color} p-[1px]`}>
          <div className="relative h-full w-full rounded-full bg-[#1d2e4d]">
            <div className="absolute left-1/2 top-[28%] h-3 w-3 -translate-x-1/2 rounded-full bg-lime-200" />
            <div className="absolute left-[28%] top-[46%] h-1.5 w-1.5 rounded-full bg-slate-900" />
            <div className="absolute right-[28%] top-[46%] h-1.5 w-1.5 rounded-full bg-slate-900" />
            <div className="absolute bottom-[22%] left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-slate-900/80" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[clamp(0.9rem,0.78vw,1.18rem)] font-semibold text-cyan-50">{name}</p>
          <p className="truncate font-mono text-[clamp(0.74rem,0.62vw,0.94rem)] uppercase tracking-[0.08em] text-cyan-100/70">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

function MissionRouteDiagram() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-cyan-300/25 bg-[#081a39]/80">
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
          d="M 185 228 C 320 170 470 150 620 150"
          stroke="url(#routeLine)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />

        <circle cx="135" cy="250" r="92" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="4.5" />
        <circle cx="103" cy="228" r="24" fill="#2f64ce" opacity="0.55" />
        <circle cx="170" cy="276" r="18" fill="#315fb8" opacity="0.55" />
        <circle cx="178" cy="206" r="8" fill="#fbbf24" stroke="#fde68a" strokeWidth="2.6" />
        <path d="M 178 194 L 183 210 L 173 210 Z" fill="#fef3c7" />
        <text x="178" y="186" textAnchor="middle" fill="#ffe8b4" fontSize="18" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Launch
        </text>
        <text x="135" y="360" textAnchor="middle" fill="#c7eaff" fontSize="24" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          NoCap
        </text>

        <circle cx="650" cy="160" r="128" fill="url(#planetGlow)" stroke="#e0f2fe" strokeWidth="4.5" />
        <circle cx="602" cy="130" r="30" fill="#3b82f6" opacity="0.5" />
        <circle cx="695" cy="202" r="26" fill="#2563eb" opacity="0.5" />
        <text x="650" y="314" textAnchor="middle" fill="#ecfeff" fontSize="27" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
          Meridia
        </text>

        <circle cx="610" cy="116" r="14" fill="#34d399" stroke="#d1fae5" strokeWidth="3.2" />
        <text x="610" y="95" textAnchor="middle" fill="#bcf5df" fontSize="17" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Fluxfall
        </text>

        <rect x="662" y="188" width="94" height="56" rx="10" fill="#0f2f3f" stroke="#99f6e4" strokeWidth="3" />
        <text x="709" y="221" textAnchor="middle" fill="#ccfbf1" fontSize="17" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          The Stacks
        </text>

      </svg>
    </div>
  );
}

export function MissionBriefingContentSlide({ missionState }: { missionState: MissionState }) {
  return (
    <div className="grid h-full gap-4">
      <Card className="mission-panel flex h-full min-h-0 flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-[clamp(1.45rem,1.34vw,2.1rem)] text-cyan-50">
            Mission Objectives
          </CardTitle>
          <p className="text-[clamp(1.15rem,1.02vw,1.62rem)] text-cyan-100/80">
            The Kermans are caretakers of municipal memory on the planet NoCap. They must preserve their municipal
            archive from the looming core cascade pressure event.
          </p>
        </CardHeader>
        <CardContent className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-auto pr-1">
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3.5">
            <p className="text-[clamp(1.12rem,1.02vw,1.72rem)] leading-relaxed text-cyan-100/90">
              A planetary core reaction called <span className="font-semibold text-cyan-50">Core Cascade</span> is
              destabilizing magnetic fields and accelerating media degradation. The Great{" "}
              <span className="font-semibold text-cyan-50">Signal Fade</span> is the point-of-no-return. Mission
              success means digitizing, verifying, and archiving civic records, then evacuating from{" "}
              <span className="font-semibold text-cyan-50">NoCap</span> to{" "}
              <span className="font-semibold text-cyan-50">Meridia</span>, landing at{" "}
              <span className="font-semibold text-cyan-50">Fluxfall Basin</span>, and growing{" "}
              <span className="font-semibold text-cyan-50">The Stacks</span>.
            </p>
          </div>

          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-5">
            <p className="font-mono text-[clamp(1rem,0.9vw,1.34rem)] uppercase tracking-[0.14em] text-cyan-100/70">
              Mission Objectives
            </p>
            <ol className="mt-3 space-y-2.5 text-[clamp(1.2rem,1.08vw,1.76rem)] text-cyan-100/90">
              {OBJECTIVES.map((item, index) => (
                <li key={item}>
                  <span className="mr-1 font-semibold text-cyan-50">{index + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-md border border-cyan-300/30 bg-cyan-950/35 px-3.5 py-2.5">
            <p className="font-mono text-[clamp(0.9rem,0.78vw,1.16rem)] uppercase tracking-[0.12em] text-cyan-100/75">
              Crew Voice Lines
            </p>
            <div className="mt-2 space-y-1.5">
              {crewQuotes(missionState).map((quote) => (
                <p key={quote} className="text-[clamp(0.98rem,0.84vw,1.3rem)] text-cyan-100">
                  {quote}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MissionBriefingVisualsSlide({ missionState }: { missionState: MissionState }) {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-12">
      <Card className="mission-panel min-h-0 flex flex-col lg:col-span-7">
        <CardHeader className="pb-2">
          <CardTitle className="text-[clamp(1.45rem,1.34vw,2.1rem)] text-cyan-50">Mission Route Diagram</CardTitle>
        </CardHeader>
        <CardContent className="h-full min-h-0">
          <MissionRouteDiagram />
        </CardContent>
      </Card>

      <Card className="mission-panel min-h-0 flex flex-col lg:col-span-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-[clamp(1.45rem,1.34vw,2.1rem)] text-cyan-50">Kerman Command Pods</CardTitle>
          <p className="text-[clamp(0.98rem,0.84vw,1.34rem)] text-cyan-100/75">
            Active stations supporting launch window, routing, quality, and archival verification.
          </p>
        </CardHeader>
        <CardContent className="grid min-h-0 gap-3 overflow-auto pr-1 sm:grid-cols-2">
          {CREW.map((member) => (
            <KermanBadge key={member.name} name={member.name} role={member.role} color={member.color} />
          ))}
          <div className="rounded-md border border-cyan-300/25 bg-cyan-950/35 px-3 py-2.5 sm:col-span-2">
            <p className="font-mono text-[clamp(0.8rem,0.68vw,1.04rem)] uppercase tracking-[0.1em] text-cyan-100/75">
              Command Note
            </p>
            <p className="mt-1 text-[clamp(0.96rem,0.82vw,1.28rem)] text-cyan-100">
              {primaryCrewLine(missionState)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
