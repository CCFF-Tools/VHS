import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Archive,
  ClipboardList,
  MapPin,
  Radio,
  Rocket,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { getMissionBriefingQuotes, getMissionCommandNote } from "@/lib/kerman-quotes";
import type { MissionState } from "@/lib/types";

const OBJECTIVES: Array<{ text: string; icon: LucideIcon }> = [
  {
    text: "Preserve the signal (capture before deterioration accelerates)",
    icon: Radio,
  },
  {
    text: "Mange VHS logistics (track mission progress through Airtable)",
    icon: ClipboardList,
  },
  {
    text: "Stabilize payloads (trim, combine, and export files)",
    icon: Scissors,
  },
  {
    text: "Depart for Meridia. (Initiate transfer of all files to NAS)",
    icon: Rocket,
  },
  {
    text: "Land at Fluxfall Basin. (Final verification of archive status of each tape)",
    icon: MapPin,
  },
  {
    text: "Expand The Stacks into a permanent off world municipal archive. (Upload files to final public archive, probably YouTube)",
    icon: Archive,
  },
];

type CrewAvatarVariant =
  | "flight-director"
  | "window-analyst"
  | "airframe-chief"
  | "gnc-lead"
  | "payload-officer"
  | "qa-anomaly";

const AVATAR_PALETTE: Record<CrewAvatarVariant, { suit: string; accent: string; visor: string }> = {
  "flight-director": { suit: "#1d4f87", accent: "#38bdf8", visor: "#93c5fd" },
  "window-analyst": { suit: "#6b3f16", accent: "#f59e0b", visor: "#fde68a" },
  "airframe-chief": { suit: "#1f6a4c", accent: "#34d399", visor: "#99f6e4" },
  "gnc-lead": { suit: "#5b2a74", accent: "#e879f9", visor: "#f5d0fe" },
  "payload-officer": { suit: "#2f3f8f", accent: "#60a5fa", visor: "#bfdbfe" },
  "qa-anomaly": { suit: "#7a1d3b", accent: "#fb7185", visor: "#fecdd3" },
};

const CREW = [
  {
    name: "Genev Kerman",
    role: "Flight Director",
    color: "from-cyan-300 to-sky-300",
    variant: "flight-director" as const,
  },
  {
    name: "Dexrin Kerman",
    role: "Window Analyst",
    color: "from-amber-300 to-orange-300",
    variant: "window-analyst" as const,
  },
  {
    name: "Rivet Kerman",
    role: "Airframe Chief",
    color: "from-emerald-300 to-cyan-300",
    variant: "airframe-chief" as const,
  },
  {
    name: "Paxlo Kerman",
    role: "GNC Lead",
    color: "from-fuchsia-300 to-pink-300",
    variant: "gnc-lead" as const,
  },
  {
    name: "Nora Kerman",
    role: "Payload Officer",
    color: "from-indigo-300 to-cyan-300",
    variant: "payload-officer" as const,
  },
  {
    name: "Vexa Kerman",
    role: "QA / Anomaly",
    color: "from-rose-300 to-amber-300",
    variant: "qa-anomaly" as const,
  },
];

function crewQuotes(state: MissionState, limit = 4) {
  const generated = getMissionBriefingQuotes(state, Math.max(limit + 2, 6)).map(
    (quote) => `${quote.speaker}: ${quote.line}`
  );
  return generated.filter((line, index) => generated.indexOf(line) === index).slice(0, limit);
}

function AccessoryGlyph({
  variant,
  accent,
}: {
  variant: CrewAvatarVariant;
  accent: string;
}) {
  if (variant === "flight-director") {
    return <path d="M72 74 l3 6 h6 l-5 4 2 6 -6-4 -6 4 2-6 -5-4 h6 Z" fill={accent} />;
  }
  if (variant === "window-analyst") {
    return (
      <>
        <circle cx="75" cy="81" r="6.5" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M75 81 L75 77 M75 81 L79 83" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }
  if (variant === "airframe-chief") {
    return (
      <>
        <path d="M70 86 L80 76" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="81.5" cy="74.5" r="2.2" fill={accent} />
        <circle cx="68.5" cy="87.5" r="2.2" fill={accent} />
      </>
    );
  }
  if (variant === "gnc-lead") {
    return (
      <>
        <circle cx="75" cy="81" r="6.5" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M75 73.5 V88.5 M67.5 81 H82.5" stroke={accent} strokeWidth="1.8" />
      </>
    );
  }
  if (variant === "payload-officer") {
    return (
      <>
        <rect x="69.5" y="75.5" width="11" height="11" rx="2.2" fill="none" stroke={accent} strokeWidth="2" />
        <path d="M75 75.5 V86.5 M69.5 81 H80.5" stroke={accent} strokeWidth="1.8" />
      </>
    );
  }
  return (
    <>
      <path d="M75 74 L82 87 H68 Z" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M75 78 V82 M75 85.2 V85.2" stroke={accent} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function RoleAccessory({
  variant,
  visor,
}: {
  variant: CrewAvatarVariant;
  visor: string;
}) {
  if (variant === "flight-director") {
    return (
      <>
        <path d="M24 34 Q48 14 72 34" fill="none" stroke="#dbeafe" strokeWidth="3" />
        <path d="M72 34 Q80 40 74 48" fill="none" stroke="#dbeafe" strokeWidth="3" strokeLinecap="round" />
        <circle cx="72.5" cy="48.5" r="2.5" fill={visor} />
      </>
    );
  }
  if (variant === "window-analyst") {
    return (
      <>
        <rect x="27" y="30" width="42" height="14" rx="7" fill={visor} fillOpacity="0.65" stroke="#fef3c7" strokeWidth="2" />
        <path d="M48 30 V44" stroke="#fef3c7" strokeWidth="1.5" />
      </>
    );
  }
  if (variant === "airframe-chief") {
    return (
      <>
        <path d="M24 34 Q48 12 72 34 V38 H24 Z" fill="#fb923c" stroke="#fed7aa" strokeWidth="2" />
        <rect x="34" y="22" width="28" height="7" rx="3.5" fill="#fff7ed" />
      </>
    );
  }
  if (variant === "gnc-lead") {
    return (
      <>
        <path d="M29 30 H67 L62 42 H34 Z" fill={visor} fillOpacity="0.7" stroke="#e9d5ff" strokeWidth="2" />
        <path d="M67 30 L74 25" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }
  if (variant === "payload-officer") {
    return (
      <>
        <path d="M35 50 V72 M61 50 V72" stroke="#bfdbfe" strokeWidth="3" />
        <rect x="35" y="58" width="26" height="6" rx="3" fill="#bfdbfe" />
      </>
    );
  }
  return (
    <>
      <rect x="28" y="31" width="40" height="13" rx="6.5" fill={visor} fillOpacity="0.65" stroke="#fecdd3" strokeWidth="2" />
      <circle cx="67" cy="53" r="4.2" fill="#fb7185" stroke="#ffe4e6" strokeWidth="2" />
    </>
  );
}

function KermanPortrait({ variant }: { variant: CrewAvatarVariant }) {
  const palette = AVATAR_PALETTE[variant];
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
      <rect width="96" height="96" fill="#13284d" />
      <ellipse cx="48" cy="90" rx="30" ry="9" fill="rgba(9,16,36,0.46)" />
      <ellipse cx="48" cy="74" rx="28" ry="22" fill={palette.suit} />
      <rect x="36" y="58" width="24" height="26" rx="10" fill="#2b3c66" opacity="0.5" />

      <circle cx="48" cy="39" r="20" fill="#9fd66e" />
      <circle cx="40" cy="37" r="4.8" fill="#ffffff" />
      <circle cx="56" cy="37" r="4.8" fill="#ffffff" />
      <circle cx="41" cy="37.5" r="2.1" fill="#10203d" />
      <circle cx="57" cy="37.5" r="2.1" fill="#10203d" />
      <path d="M40 48 Q48 54 56 48" fill="none" stroke="#26361f" strokeWidth="2.2" strokeLinecap="round" />

      <RoleAccessory variant={variant} visor={palette.visor} />

      <circle cx="75" cy="81" r="12" fill="#08162e" stroke="#d9ecff" strokeWidth="1.6" />
      <AccessoryGlyph variant={variant} accent={palette.accent} />
    </svg>
  );
}

function KermanBadge({
  name,
  role,
  color,
  variant,
}: {
  name: string;
  role: string;
  color: string;
  variant: CrewAvatarVariant;
}) {
  return (
    <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-3">
      <div className="flex items-center gap-3">
        <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br ${color} p-[1px]`}>
          <div className="relative h-full w-full overflow-hidden rounded-full bg-[#1d2e4d]">
            <KermanPortrait variant={variant} />
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

export function MissionBriefingContentSlide() {
  return (
    <div className="grid h-full gap-4">
      <Card className="mission-panel flex h-full min-h-0 flex-col">
        <CardContent className="grid min-h-0 gap-4 overflow-auto pr-1">
          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-5">
            <p className="font-mono text-[clamp(1rem,0.9vw,1.34rem)] uppercase tracking-[0.14em] text-cyan-100/75">
              Mission Objectives
            </p>
            <div className="mt-2 max-w-[108ch] space-y-3">
              <p className="text-[clamp(1.2rem,1.1vw,1.82rem)] leading-relaxed text-cyan-100/90">
                The Kermans serve as caretakers of municipal memory on the planet NoCap. They must preserve their
                municipal archive from the looming core cascade pressure event. Core cascade destabilizes planetary
                magnetic fields and accelerates analog decay. Every uncaptured reel loses magnetic fidelity as core
                cascade pressure rises.
              </p>
              <p className="text-[clamp(1.15rem,1.02vw,1.74rem)] leading-relaxed text-cyan-100/88">
                The Great Signal Fade is the threshold where loss curves steepen and recovery may not be possible.
                Mission success means digitizing, verifying, and archiving civic records, then departing NoCap for
                Meridia, landing at Fluxfall Basin, and scaling The Stacks, a naturally shielded archive vault immune
                to magnetic disruption. This mission won&apos;t be saved by last-minute heroics. Only disciplined
                checklists, consistent workflows, and rigorous data management will ensure history lands intact.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-cyan-300/25 bg-slate-900/75 p-5">
            <p className="font-mono text-[clamp(1rem,0.9vw,1.34rem)] uppercase tracking-[0.14em] text-cyan-100/70">
              Primary Directives
            </p>
            <div className="mt-3 space-y-2.5">
              {OBJECTIVES.map(({ text, icon: Icon }, index) => (
                <div
                  key={text}
                  className="rounded-md border border-cyan-300/25 bg-slate-950/60 px-3.5 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-200/45 bg-cyan-950/35 text-cyan-100">
                      <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[clamp(0.8rem,0.68vw,1.06rem)] uppercase tracking-[0.1em] text-cyan-100/70">
                        Directive {index + 1}
                      </p>
                      <p className="mt-1 text-[clamp(1.02rem,0.9vw,1.44rem)] leading-snug text-cyan-100/90">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MissionBriefingVisualsSlide({
  missionState,
  nowMs,
}: {
  missionState: MissionState;
  nowMs: number;
}) {
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
            <KermanBadge
              key={member.name}
              name={member.name}
              role={member.role}
              color={member.color}
              variant={member.variant}
            />
          ))}
          <div className="rounded-md border border-cyan-300/25 bg-cyan-950/35 px-3 py-2.5 sm:col-span-2">
            <p className="font-mono text-[clamp(0.8rem,0.68vw,1.04rem)] uppercase tracking-[0.1em] text-cyan-100/75">
              Command Note
            </p>
            <p className="mt-1 text-[clamp(0.96rem,0.82vw,1.28rem)] text-cyan-100">
              {getMissionCommandNote(missionState, nowMs)}
            </p>
          </div>
          <div className="rounded-md border border-cyan-300/30 bg-cyan-950/35 px-3 py-2.5 sm:col-span-2">
            <p className="font-mono text-[clamp(0.8rem,0.68vw,1.04rem)] uppercase tracking-[0.1em] text-cyan-100/75">
              Crew Voice Lines
            </p>
            <div className="mt-2 space-y-1.5">
              {crewQuotes(missionState, 4).map((quote) => (
                <p key={quote} className="text-[clamp(0.94rem,0.8vw,1.24rem)] text-cyan-100">
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
