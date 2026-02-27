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
  dueDate?: string;
  assignedTech?: string;
  priority: Priority;
  ageInStageDays: number;
  completedDate?: string;
}

export interface DashboardKpis {
  totalTapes: number;
  intakeQueue: number;
  captureQueue: number;
  processingQueue: number;
  transferQueue: number;
  blockedQueue: number;
  archivedTotal: number;
  archivedToday: number;
  avgQueueAgeDays: number;
  avgRuntimeDriftMinutes: number;
  archiveCompletionRate: number;
}

export interface OpsSummaryResponse {
  kpis: DashboardKpis;
  stageCounts: Array<{ stage: Stage; count: number }>;
  throughputDaily: Array<{ date: string; completed: number; received: number }>;
  backlogTrend: Array<{ date: string; backlog: number }>;
  runtimeDriftHistogram: Array<{ bucket: string; count: number }>;
  issueTagCounts: Array<{ tag: string; count: number }>;
  sequenceProgress: Array<{
    sequence: string;
    expected: number;
    total: number;
    captured: number;
    archived: number;
    completionRate: number;
  }>;
  oldestWaiting?: TapeRecord;
  largestQueueStage?: { stage: Stage; count: number };
  tapes: TapeRecord[];
}
