export type Stage =
  | "Intake"
  | "Capture"
  | "Trim"
  | "Combine"
  | "Transfer"
  | "Archived"
  | "Blocked";

export type Priority = "low" | "normal" | "high" | "rush";

export interface TapeRecord {
  id: string;
  tapeId: string;
  tapeName: string;
  tapeSequence?: string;
  tapesInSequence?: number;
  receivedDate?: string;
  labelRuntimeMinutes?: number;
  qtRuntimeMinutes?: number;
  qtFilename?: string;
  captured?: boolean;
  trimmed?: boolean;
  combined?: boolean;
  transferredToNas?: boolean;
  archivalFilename?: string;
  finalClipDurationMinutes?: number;
  stage: Stage;
  issueTags: string[];
  notes?: string;
  updatedTime?: string;
  acquisitionAt?: string;
  contentRecordedAt?: string;
  capturedAt?: string;
  dueDate?: string;
  assignedTech?: string;
  priority: Priority;
  ageInStageDays: number;
  completedDate?: string;
}

export interface DashboardKpis {
  totalTapes: number;
  awaitingCaptureCount: number;
  capturedCount: number;
  trimmedCount: number;
  combinedCount: number;
  transferredCount: number;
  receivedToday: number;
}

export interface RuntimeStats {
  labelAverage: number;
  qtAverage: number;
  finalAverage: number;
  driftAverage: number;
}

export interface LaunchProjection {
  status: "counting" | "launched" | "insufficient_data";
  projectedLaunchAt?: string;
  generatedAt: string;
  backlogCount: number;
  completedCount: number;
  throughputPerDay: number;
  throughputWindowDays: number;
  estimatedDaysRemaining?: number;
  recentCompletions: number;
  completionDateCoveragePercent: number;
  confidence: "high" | "medium" | "low";
  source: "completion-dates" | "historical-count" | "none";
}

export type MissionAxis = "assembly" | "planning" | "colonization";

export type AssemblyMilestone =
  | "blueprints"
  | "jigs_online"
  | "airframe_rising"
  | "engines_mated"
  | "booster_stacked"
  | "rollout"
  | "pad_ready";

export type PlanningMilestone =
  | "napkin_math"
  | "course_plotted"
  | "burns_scheduled"
  | "go_no_go"
  | "flight_plan_locked"
  | "autopilot_loaded";

export type ColonizationPhase =
  | "cargo_staged"
  | "hold_for_readiness"
  | "launch"
  | "cruise"
  | "approach_meridia"
  | "entry_descent"
  | "landing_fluxfall"
  | "stacks_expansion"
  | "vault_sealed";

export interface MissionState {
  lore: {
    species: "Kermans";
    origin: {
      homeworld: "NoCap";
    };
    destination: {
      planet: "Meridia";
      landingSite: "Fluxfall Basin";
      outpost: "The Stacks";
    };
    threat: {
      cause: "Core Cascade";
      event: "Signal Fade";
    };
  };
  deadline: {
    iso: string;
    msRemaining: number;
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
    assembly: number;
    planning: number;
    colonization: number;
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
    holdReason?: string;
  };
  overlays: {
    quarantine: boolean;
    anomaliesCount: number;
  };
}

export interface OpsSummaryResponse {
  kpis: DashboardKpis;
  stageCounts: Array<{ stage: Stage; count: number }>;
  acquisitionDaily: Array<{ date: string; count: number }>;
  contentRecordedDaily: Array<{ date: string; count: number }>;
  contentRecordedCoveragePercent: number;
  capturedDaily: Array<{ date: string; count: number }>;
  capturedDateCoveragePercent: number;
  runtimeHistograms: {
    labelRuntime: Array<{ bucket: string; count: number }>;
    qtRuntime: Array<{ bucket: string; count: number }>;
    finalRuntime: Array<{ bucket: string; count: number }>;
  };
  runtimeStats: RuntimeStats;
  launchProjection: LaunchProjection;
  missionState: MissionState;
  recentAcquisitions: TapeRecord[];
  tapes: TapeRecord[];
}
