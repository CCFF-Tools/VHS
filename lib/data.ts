import {
  eachDayOfInterval,
  endOfDay,
  format,
  isAfter,
  isToday,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { listRecords } from "@/lib/airtable";
import { fieldMap, pipelineStages } from "@/lib/schema";
import type { OpsSummaryResponse, Stage, TapeRecord } from "@/lib/types";

function toDate(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function toBool(value: unknown): boolean {
  return Boolean(value);
}

function inferStage(record: {
  transferredToNas?: boolean;
  archivalFilename?: string;
  combined?: boolean;
  trimmed?: boolean;
  captured?: boolean;
  qtFilename?: string;
}): Stage {
  if (record.archivalFilename) return "Archived";
  if (record.transferredToNas) return "Transfer";
  if (record.combined) return "Combine";
  if (record.trimmed) return "Trim";
  if (record.captured || record.qtFilename) return "Capture";
  return "Intake";
}

function calcAgeInDays(startDateIso?: string) {
  if (!startDateIso) return 0;
  const start = startOfDay(parseISO(startDateIso));
  const now = startOfDay(new Date());
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

function inferPriority(ageInStageDays: number): TapeRecord["priority"] {
  if (ageInStageDays > 21) return "rush";
  if (ageInStageDays > 10) return "high";
  if (ageInStageDays > 4) return "normal";
  return "low";
}

function inferIssues(record: Partial<TapeRecord>): string[] {
  const issues: string[] = [];

  if (record.captured && !record.qtFilename) issues.push("missing-qt-file");

  if (record.qtRuntimeMinutes && record.labelRuntimeMinutes) {
    const variance = Math.abs(record.qtRuntimeMinutes - record.labelRuntimeMinutes);
    if (variance > 10) issues.push("runtime-mismatch");
  }

  if (record.transferredToNas && !record.archivalFilename) issues.push("pending-archival-filename");

  if (record.captured && !record.trimmed && (record.ageInStageDays ?? 0) > 5) issues.push("stuck-post-capture");
  if (record.trimmed && !record.combined && (record.ageInStageDays ?? 0) > 5) issues.push("stuck-post-trim");
  if (record.combined && !record.transferredToNas && (record.ageInStageDays ?? 0) > 5) {
    issues.push("stuck-pre-transfer");
  }

  return issues;
}

function runtimeDrift(record: TapeRecord): number | null {
  const source = record.labelRuntimeMinutes ?? record.qtRuntimeMinutes;
  const output = record.finalClipDurationMinutes ?? record.qtRuntimeMinutes;
  if (source == null || output == null) return null;
  return Math.abs(output - source);
}

function dayKey(dateIso: string) {
  return format(parseISO(dateIso), "yyyy-MM-dd");
}

export async function getTapes(): Promise<TapeRecord[]> {
  const records = await listRecords();

  return records.map((record) => {
    const fields = record.fields as Record<string, unknown>;
    const receivedDate = toDate(fields[fieldMap.receivedDate]);
    const createdTime = toDate(record._rawJson.createdTime);
    const baselineDate = receivedDate ?? createdTime;

    const parsed: Partial<TapeRecord> = {
      id: record.id,
      tapeId: String(fields[fieldMap.tapeId] || record.id),
      tapeName: String(fields[fieldMap.tapeName] || "Untitled Tape"),
      tapeSequence: fields[fieldMap.tapeSequence] ? String(fields[fieldMap.tapeSequence]) : undefined,
      tapesInSequence: toNumber(fields[fieldMap.tapesInSequence]),
      receivedDate,
      labelRuntimeMinutes: toNumber(fields[fieldMap.labelRuntime]),
      qtRuntimeMinutes: toNumber(fields[fieldMap.qtRuntime]),
      qtFilename: fields[fieldMap.qtFilename] ? String(fields[fieldMap.qtFilename]) : undefined,
      captured: toBool(fields[fieldMap.captured]),
      trimmed: toBool(fields[fieldMap.trimmed]),
      combined: toBool(fields[fieldMap.combined]),
      transferredToNas: toBool(fields[fieldMap.transferredToNas]),
      archivalFilename: fields[fieldMap.archivalFilename]
        ? String(fields[fieldMap.archivalFilename])
        : undefined,
      finalClipDurationMinutes: toNumber(fields[fieldMap.finalClipDuration]),
      updatedTime: createdTime,
      ageInStageDays: calcAgeInDays(baselineDate),
    };

    const stage = inferStage(parsed);

    const result: TapeRecord = {
      id: parsed.id!,
      tapeId: parsed.tapeId!,
      tapeName: parsed.tapeName!,
      tapeSequence: parsed.tapeSequence,
      tapesInSequence: parsed.tapesInSequence,
      receivedDate: parsed.receivedDate,
      labelRuntimeMinutes: parsed.labelRuntimeMinutes,
      qtRuntimeMinutes: parsed.qtRuntimeMinutes,
      qtFilename: parsed.qtFilename,
      captured: parsed.captured,
      trimmed: parsed.trimmed,
      combined: parsed.combined,
      transferredToNas: parsed.transferredToNas,
      archivalFilename: parsed.archivalFilename,
      finalClipDurationMinutes: parsed.finalClipDurationMinutes,
      stage,
      issueTags: [],
      notes: undefined,
      updatedTime: parsed.updatedTime,
      priority: inferPriority(parsed.ageInStageDays ?? 0),
      ageInStageDays: parsed.ageInStageDays ?? 0,
      completedDate: stage === "Archived" ? parsed.updatedTime : undefined,
    };

    result.issueTags = inferIssues(result);
    return result;
  });
}

function buildThroughput(tapes: TapeRecord[]) {
  const start = subDays(startOfDay(new Date()), 29);
  const end = endOfDay(new Date());
  const days = eachDayOfInterval({ start, end });

  return days.map((d) => {
    const dateLabel = format(d, "yyyy-MM-dd");

    const received = tapes.filter((t) => t.receivedDate && dayKey(t.receivedDate) === dateLabel).length;

    // No archival timestamp field in this schema; this uses record created/update surrogate.
    const completed = tapes.filter(
      (t) => t.stage === "Archived" && t.completedDate && dayKey(t.completedDate) === dateLabel
    ).length;

    return { date: dateLabel, completed, received };
  });
}

function buildBacklogTrend(tapes: TapeRecord[]) {
  const start = subDays(startOfDay(new Date()), 29);
  const end = endOfDay(new Date());
  const days = eachDayOfInterval({ start, end });

  return days.map((d) => {
    const date = endOfDay(d);
    const backlog = tapes.filter((t) => {
      if (!t.receivedDate) return false;
      const rec = parseISO(t.receivedDate);
      if (isAfter(rec, date)) return false;
      if (!t.completedDate) return true;
      return isAfter(parseISO(t.completedDate), date);
    }).length;
    return { date: format(d, "yyyy-MM-dd"), backlog };
  });
}

function buildRuntimeDriftHistogram(tapes: TapeRecord[]) {
  const buckets = [
    { label: "0-2m", min: 0, max: 2 },
    { label: "3-5m", min: 3, max: 5 },
    { label: "6-10m", min: 6, max: 10 },
    { label: "11m+", min: 11, max: Number.POSITIVE_INFINITY },
  ];

  return buckets.map((bucket) => {
    const count = tapes.filter((t) => {
      const drift = runtimeDrift(t);
      if (drift == null) return false;
      return drift >= bucket.min && drift <= bucket.max;
    }).length;
    return { bucket: bucket.label, count };
  });
}

function buildSequenceProgress(tapes: TapeRecord[]) {
  const bySequence = new Map<string, TapeRecord[]>();

  for (const tape of tapes) {
    const key = tape.tapeSequence?.trim() || "Unsequenced";
    const current = bySequence.get(key) ?? [];
    current.push(tape);
    bySequence.set(key, current);
  }

  return Array.from(bySequence.entries())
    .map(([sequence, records]) => {
      const expectedFromField = Math.max(...records.map((r) => r.tapesInSequence ?? 0));
      const expected = expectedFromField > 0 ? expectedFromField : records.length;
      const total = records.length;
      const captured = records.filter((r) => r.captured).length;
      const archived = records.filter((r) => r.stage === "Archived").length;

      return {
        sequence,
        expected,
        total,
        captured,
        archived,
        completionRate: expected ? Number(((archived / expected) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => {
      if (b.expected !== a.expected) return b.expected - a.expected;
      return a.sequence.localeCompare(b.sequence);
    })
    .slice(0, 12);
}

export async function getOpsSummary(): Promise<OpsSummaryResponse> {
  const tapes = await getTapes();

  const stageCounts = [...new Set([...pipelineStages, "Blocked"] as Stage[])].map((stage) => {
    if (stage === "Blocked") {
      return {
        stage,
        count: tapes.filter((t) => t.stage !== "Archived" && t.issueTags.length > 0).length,
      };
    }

    return {
      stage,
      count: tapes.filter((t) => t.stage === stage).length,
    };
  });

  const inProgress = tapes.filter((t) => t.stage !== "Archived");
  const archived = tapes.filter((t) => t.stage === "Archived");

  const issueTagMap = new Map<string, number>();
  for (const tape of tapes) {
    for (const tag of tape.issueTags) {
      issueTagMap.set(tag, (issueTagMap.get(tag) ?? 0) + 1);
    }
  }

  const oldestWaiting = inProgress
    .filter((t) => t.receivedDate)
    .sort((a, b) => (b.ageInStageDays || 0) - (a.ageInStageDays || 0))[0];

  const largestQueueStage = stageCounts
    .filter((s) => s.stage !== "Archived")
    .sort((a, b) => b.count - a.count)[0];

  const queueAges = inProgress.map((t) => t.ageInStageDays);
  const avgQueueAgeDays = queueAges.length
    ? Number((queueAges.reduce((sum, v) => sum + v, 0) / queueAges.length).toFixed(1))
    : 0;

  const drifts = tapes
    .map((t) => runtimeDrift(t))
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const avgRuntimeDriftMinutes = drifts.length
    ? Number((drifts.reduce((sum, v) => sum + v, 0) / drifts.length).toFixed(1))
    : 0;

  return {
    kpis: {
      totalTapes: tapes.length,
      intakeQueue: tapes.filter((t) => t.stage === "Intake").length,
      captureQueue: tapes.filter((t) => t.stage === "Capture").length,
      processingQueue: tapes.filter((t) => t.stage === "Trim" || t.stage === "Combine").length,
      transferQueue: tapes.filter((t) => t.stage === "Transfer").length,
      blockedQueue: tapes.filter((t) => t.stage !== "Archived" && t.issueTags.length > 0).length,
      archivedTotal: archived.length,
      archivedToday: archived.filter((t) => t.completedDate && isToday(parseISO(t.completedDate))).length,
      avgQueueAgeDays,
      avgRuntimeDriftMinutes,
      archiveCompletionRate: tapes.length ? Number(((archived.length / tapes.length) * 100).toFixed(1)) : 0,
    },
    stageCounts,
    throughputDaily: buildThroughput(tapes),
    backlogTrend: buildBacklogTrend(tapes),
    runtimeDriftHistogram: buildRuntimeDriftHistogram(tapes),
    issueTagCounts: Array.from(issueTagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    sequenceProgress: buildSequenceProgress(tapes),
    oldestWaiting,
    largestQueueStage,
    tapes,
  };
}
