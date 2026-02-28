import type { Stage } from "@/lib/types";

export const fieldMap = {
  tapeId: process.env.AIRTABLE_TAPE_ID_FIELD ?? "📼",
  tapeName: process.env.AIRTABLE_TAPE_NAME_FIELD ?? "Tape Name",
  tapeSequence: process.env.AIRTABLE_TAPE_SEQUENCE_FIELD ?? "Tape Sequence",
  tapesInSequence: process.env.AIRTABLE_SEQUENCE_COUNT_FIELD ?? "Tapes in Sequence",
  receivedDate: process.env.AIRTABLE_RECEIVED_DATE_FIELD ?? "Rec Date",
  labelRuntime: process.env.AIRTABLE_LABEL_RUNTIME_FIELD ?? "Label RT",
  qtRuntime: process.env.AIRTABLE_QT_RUNTIME_FIELD ?? "QT TRT",
  contentRecordedDate: process.env.AIRTABLE_CONTENT_DATE_FIELD ?? "",
  qtFilename: process.env.AIRTABLE_QT_FILENAME_FIELD ?? "QT Filename",
  capturedAt: process.env.AIRTABLE_CAPTURED_AT_FIELD ?? "",
  captured: process.env.AIRTABLE_CAPTURED_FIELD ?? "Captured",
  trimmed: process.env.AIRTABLE_TRIMMED_FIELD ?? "Trimmed",
  combined: process.env.AIRTABLE_COMBINED_FIELD ?? "Combined",
  transferredToNas: process.env.AIRTABLE_TRANSFERRED_FIELD ?? "Transferred to NAS",
  archivalFilename: process.env.AIRTABLE_ARCHIVAL_FILENAME_FIELD ?? "Archival Filename",
  finalClipDuration: process.env.AIRTABLE_FINAL_DURATION_FIELD ?? "Final Clip Duration",
  completedDate: process.env.AIRTABLE_COMPLETED_DATE_FIELD ?? "",
} as const;

export const pipelineStages: Stage[] = (
  process.env.AIRTABLE_PIPELINE_STAGES ?? "Intake,Capture,Trim,Combine,Transfer,Archived"
)
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean) as Stage[];

export const stageColorMap: Record<Stage, string> = {
  Intake: "bg-slate-100 text-slate-700",
  Capture: "bg-cyan-100 text-cyan-800",
  Trim: "bg-amber-100 text-amber-800",
  Combine: "bg-violet-100 text-violet-800",
  Transfer: "bg-emerald-100 text-emerald-800",
  Archived: "bg-zinc-200 text-zinc-800",
  Blocked: "bg-rose-100 text-rose-700",
};
