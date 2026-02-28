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
  recentAcquisitions: TapeRecord[];
  tapes: TapeRecord[];
}
