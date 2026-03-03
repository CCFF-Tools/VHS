import { eachDayOfInterval, endOfDay, format, isToday, parseISO, startOfDay, subDays } from "date-fns";
import { listRecords } from "@/lib/airtable";
import { RUNTIME_BUCKETS } from "@/lib/runtime-buckets";
import { fieldMap, pipelineStages } from "@/lib/schema";
import type { LaunchProjection, OpsSummaryResponse, Stage, TapeRecord } from "@/lib/types";

function toDate(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function toDateOnly(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const explicitMatch = trimmed.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (explicitMatch) return explicitMatch[1];

  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return undefined;
  return format(d, "yyyy-MM-dd");
}

function inferMeetingDateFromQtFilename(qtFilename?: string): string | undefined {
  if (!qtFilename) return undefined;
  return toDateOnly(qtFilename);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function parseDurationClockStringToMinutes(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed.includes(":")) return undefined;
  const parts = trimmed.split(":").map((p) => p.trim());
  if (!parts.every((p) => p !== "" && !Number.isNaN(Number(p)))) return undefined;

  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    return h * 60 + m + s / 60;
  }

  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    return m + s / 60;
  }

  return undefined;
}

function normalizeNumericDurationToMinutes(value: number): number {
  const mode = (process.env.AIRTABLE_RUNTIME_NUMERIC_UNIT ?? "seconds").toLowerCase();
  if (mode === "seconds") return value / 60;
  if (mode === "minutes") return value;

  // Auto mode: Airtable duration fields are commonly seconds.
  // Values over 300 are very likely seconds for this workflow.
  return value > 300 ? value / 60 : value;
}

function toRuntimeMinutes(value: unknown): number | undefined {
  if (typeof value === "number") return normalizeNumericDurationToMinutes(value);
  if (typeof value === "string") {
    const clock = parseDurationClockStringToMinutes(value);
    if (clock != null) return clock;
    if (value.trim() === "") return undefined;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return undefined;
    return normalizeNumericDurationToMinutes(numeric);
  }
  return undefined;
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    if (
      normalized === "false" ||
      normalized === "no" ||
      normalized === "n" ||
      normalized === "0" ||
      normalized === "off" ||
      normalized === "pending" ||
      normalized === "not started" ||
      normalized === "todo" ||
      normalized === "to do" ||
      normalized === "unchecked" ||
      normalized === "nope" ||
      normalized === "❌"
    ) {
      return false;
    }
    if (
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "1" ||
      normalized === "done" ||
      normalized === "complete" ||
      normalized === "completed" ||
      normalized === "captured" ||
      normalized === "trimmed" ||
      normalized === "combined" ||
      normalized === "transferred" ||
      normalized === "transferred to nas" ||
      normalized === "checked" ||
      normalized === "check" ||
      normalized === "x" ||
      normalized === "✓" ||
      normalized === "✅"
    ) {
      return true;
    }

    // If the flag field stores a timestamp string, treat it as complete.
    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) return true;

    // Conservative fallback prevents overcounting on unknown text values.
    return false;
  }
  if (Array.isArray(value)) return value.length > 0;
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

  return issues;
}

function buildAcquisitionDaily(tapes: TapeRecord[]) {
  const start = subDays(startOfDay(new Date()), 29);
  const end = endOfDay(new Date());
  const days = eachDayOfInterval({ start, end });

  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const count = tapes.filter((t) => {
      const source = t.updatedTime ?? t.acquisitionAt ?? t.receivedDate;
      if (!source) return false;
      const parsed = parseISO(source);
      return !Number.isNaN(parsed.getTime()) && format(parsed, "yyyy-MM-dd") === key;
    }).length;
    return { date: key, count };
  });
}

function buildContentRecordedDaily(tapes: TapeRecord[]) {
  const counts = new Map<string, number>();

  for (const tape of tapes) {
    if (!tape.contentRecordedAt) continue;
    const parsed = parseISO(tape.contentRecordedAt);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = format(parsed, "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function bucketRuntime(minutes: number): string {
  for (const bucket of RUNTIME_BUCKETS) {
    if (bucket.max == null) {
      if (minutes >= bucket.min) return bucket.key;
      continue;
    }
    if (minutes >= bucket.min && minutes <= bucket.max) return bucket.key;
  }
  return RUNTIME_BUCKETS[RUNTIME_BUCKETS.length - 1].key;
}

function buildRuntimeHistogram(values: number[]) {
  const buckets = RUNTIME_BUCKETS.map((bucket) => bucket.key);
  const counts = new Map<string, number>(buckets.map((bucket) => [bucket, 0]));

  for (const value of values) {
    const bucket = bucketRuntime(value);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  return buckets.map((bucket) => ({ bucket, count: counts.get(bucket) ?? 0 }));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

export async function getTapes(): Promise<TapeRecord[]> {
  const records = await listRecords();

  return records.map((record) => {
    const fields = record.fields as Record<string, unknown>;
    const receivedDate = toDate(fields[fieldMap.receivedDate]);
    const updatedAt =
      fieldMap.updatedAt && fields[fieldMap.updatedAt] ? toDate(fields[fieldMap.updatedAt]) : undefined;
    const createdTime = toDate(record._rawJson.createdTime);
    // For this workflow, "acquisition" means catalog/sticker entry time in Airtable.
    const acquisitionAt = createdTime ?? receivedDate;
    const baselineDate = createdTime ?? receivedDate;
    const completedDate =
      fieldMap.completedDate && fields[fieldMap.completedDate]
        ? toDate(fields[fieldMap.completedDate])
        : undefined;
    const capturedAt =
      fieldMap.capturedAt && fields[fieldMap.capturedAt]
        ? toDate(fields[fieldMap.capturedAt])
        : undefined;
    const qtFilename = fields[fieldMap.qtFilename] ? String(fields[fieldMap.qtFilename]) : undefined;
    const contentRecordedAt =
      fieldMap.contentRecordedDate && fields[fieldMap.contentRecordedDate]
        ? toDateOnly(fields[fieldMap.contentRecordedDate])
        : inferMeetingDateFromQtFilename(qtFilename);

    const parsed: Partial<TapeRecord> = {
      id: record.id,
      tapeId: String(fields[fieldMap.tapeId] || record.id),
      tapeName: String(fields[fieldMap.tapeName] || "Untitled Tape"),
      tapeSequence: fields[fieldMap.tapeSequence] ? String(fields[fieldMap.tapeSequence]) : undefined,
      tapesInSequence: toNumber(fields[fieldMap.tapesInSequence]),
      receivedDate,
      labelRuntimeMinutes: toRuntimeMinutes(fields[fieldMap.labelRuntime]),
      qtRuntimeMinutes: toRuntimeMinutes(fields[fieldMap.qtRuntime]),
      qtFilename,
      captured: toBool(fields[fieldMap.captured]),
      trimmed: toBool(fields[fieldMap.trimmed]),
      combined: toBool(fields[fieldMap.combined]),
      transferredToNas: toBool(fields[fieldMap.transferredToNas]),
      archivalFilename: fields[fieldMap.archivalFilename]
        ? String(fields[fieldMap.archivalFilename])
        : undefined,
      finalClipDurationMinutes: toRuntimeMinutes(fields[fieldMap.finalClipDuration]),
      updatedTime: updatedAt ?? createdTime,
      acquisitionAt,
      contentRecordedAt,
      capturedAt,
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
      acquisitionAt: parsed.acquisitionAt,
      contentRecordedAt: parsed.contentRecordedAt,
      capturedAt: parsed.capturedAt,
      priority: inferPriority(parsed.ageInStageDays ?? 0),
      ageInStageDays: parsed.ageInStageDays ?? 0,
      completedDate,
    };

    result.issueTags = inferIssues(result);
    return result;
  });
}

function buildCapturedDaily(tapes: TapeRecord[]) {
  const start = subDays(startOfDay(new Date()), 29);
  const end = endOfDay(new Date());
  const days = eachDayOfInterval({ start, end });

  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const count = tapes.filter((t) => {
      const capturedAt = t.capturedAt;
      return capturedAt && format(parseISO(capturedAt), "yyyy-MM-dd") === key;
    }).length;
    return { date: key, count };
  });
}

function toTimestamp(value?: string) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isLaunchComplete(tape: TapeRecord) {
  return Boolean(tape.archivalFilename || tape.transferredToNas || tape.stage === "Archived");
}

function buildLaunchProjection(tapes: TapeRecord[]): LaunchProjection {
  const now = new Date();
  const nowMs = now.getTime();
  if (!tapes.length) {
    return {
      status: "insufficient_data",
      generatedAt: now.toISOString(),
      backlogCount: 0,
      completedCount: 0,
      throughputPerDay: 0,
      throughputWindowDays: 21,
      recentCompletions: 0,
      completionDateCoveragePercent: 0,
      confidence: "low",
      source: "none",
    };
  }

  const completedTapes = tapes.filter((tape) => isLaunchComplete(tape));
  const completedCount = completedTapes.length;
  const backlogCount = Math.max(0, tapes.length - completedCount);
  const completionTimestamps = completedTapes
    .map((tape) => toTimestamp(tape.completedDate))
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => a - b);

  const throughputWindowDays = 21;
  const recentWindowStartMs = subDays(startOfDay(now), throughputWindowDays - 1).getTime();
  const recentCompletions = completionTimestamps.filter((timestamp) => timestamp >= recentWindowStartMs).length;
  const recentThroughput = recentCompletions / throughputWindowDays;

  const timelineStartCandidates = tapes
    .map((tape) => toTimestamp(tape.acquisitionAt ?? tape.receivedDate ?? tape.updatedTime ?? tape.completedDate))
    .filter((timestamp): timestamp is number => typeof timestamp === "number");
  const timelineStartMs = timelineStartCandidates.length ? Math.min(...timelineStartCandidates) : null;
  const activeDays =
    timelineStartMs == null
      ? 0
      : Math.max(
          1,
          Math.floor((startOfDay(now).getTime() - startOfDay(new Date(timelineStartMs)).getTime()) / 86400000) + 1
        );
  const historicalThroughput = activeDays > 0 ? completedCount / activeDays : 0;

  let throughputPerDay = 0;
  let source: LaunchProjection["source"] = "none";
  if (completionTimestamps.length >= 3 && recentCompletions > 0) {
    throughputPerDay = recentThroughput;
    source = "completion-dates";
  } else if (completionTimestamps.length >= 3 && historicalThroughput > 0) {
    throughputPerDay = historicalThroughput;
    source = "completion-dates";
  } else if (historicalThroughput > 0) {
    throughputPerDay = historicalThroughput;
    source = "historical-count";
  }

  throughputPerDay = Number(throughputPerDay.toFixed(2));

  let status: LaunchProjection["status"] = "insufficient_data";
  let projectedLaunchAt: string | undefined;
  let estimatedDaysRemaining: number | undefined;

  if (backlogCount === 0) {
    status = "launched";
    projectedLaunchAt = now.toISOString();
    estimatedDaysRemaining = 0;
  } else if (throughputPerDay > 0) {
    status = "counting";
    estimatedDaysRemaining = Number((backlogCount / throughputPerDay).toFixed(1));
    projectedLaunchAt = new Date(nowMs + (backlogCount / throughputPerDay) * 86400000).toISOString();
  }

  const completionDateCoveragePercent = completedCount
    ? Number(((completionTimestamps.length / completedCount) * 100).toFixed(1))
    : 0;

  let confidence: LaunchProjection["confidence"] = "low";
  if (source === "completion-dates" && recentCompletions >= 4 && completionDateCoveragePercent >= 60) {
    confidence = "high";
  } else if (throughputPerDay > 0 && completedCount >= 5) {
    confidence = "medium";
  }

  return {
    status,
    projectedLaunchAt,
    generatedAt: now.toISOString(),
    backlogCount,
    completedCount,
    throughputPerDay,
    throughputWindowDays,
    estimatedDaysRemaining,
    recentCompletions,
    completionDateCoveragePercent,
    confidence,
    source,
  };
}

export async function getOpsSummary(): Promise<OpsSummaryResponse> {
  const tapes = await getTapes();

  const coreStages: Stage[] = ["Intake", "Capture", "Trim", "Combine", "Transfer", "Archived"];
  const stages = [...new Set([...coreStages, ...pipelineStages])];

  const stageCounts = stages.map((stage) => ({
    stage,
    count: tapes.filter((t) => t.stage === stage).length,
  }));

  const labelRuntimes = tapes
    .map((t) => t.labelRuntimeMinutes)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const qtRuntimes = tapes
    .map((t) => t.qtRuntimeMinutes)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const finalRuntimes = tapes
    .map((t) => t.finalClipDurationMinutes)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  const runtimeDrifts = tapes
    .map((t) => {
      const source = t.labelRuntimeMinutes ?? t.qtRuntimeMinutes;
      const out = t.finalClipDurationMinutes;
      if (source == null || out == null) return null;
      return Math.abs(out - source);
    })
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  const timestampOf = (t: TapeRecord) => {
    const source = t.acquisitionAt ?? t.receivedDate ?? t.updatedTime;
    if (!source) return 0;
    const ms = Date.parse(source);
    return Number.isFinite(ms) ? ms : 0;
  };

  const recentAcquisitions = [...tapes].sort((a, b) => timestampOf(b) - timestampOf(a));

  const capturedDateCount = tapes.filter((t) => Boolean(t.capturedAt)).length;
  const capturedDateCoveragePercent = tapes.length
    ? Number(((capturedDateCount / tapes.length) * 100).toFixed(1))
    : 0;
  const contentRecordedCount = tapes.filter((t) => Boolean(t.contentRecordedAt)).length;
  const contentRecordedCoveragePercent = tapes.length
    ? Number(((contentRecordedCount / tapes.length) * 100).toFixed(1))
    : 0;

  return {
    kpis: {
      totalTapes: tapes.length,
      awaitingCaptureCount: tapes.filter((t) => t.stage === "Intake").length,
      capturedCount: tapes.filter((t) => Boolean(t.captured)).length,
      trimmedCount: tapes.filter((t) => Boolean(t.trimmed)).length,
      combinedCount: tapes.filter((t) => Boolean(t.combined)).length,
      transferredCount: tapes.filter((t) => Boolean(t.transferredToNas)).length,
      receivedToday: tapes.filter((t) => {
        const date = t.updatedTime ?? t.acquisitionAt ?? t.receivedDate;
        return Boolean(date && isToday(parseISO(date)));
      }).length,
    },
    stageCounts,
    acquisitionDaily: buildAcquisitionDaily(tapes),
    contentRecordedDaily: buildContentRecordedDaily(tapes),
    contentRecordedCoveragePercent,
    capturedDaily: buildCapturedDaily(tapes),
    capturedDateCoveragePercent,
    runtimeHistograms: {
      labelRuntime: buildRuntimeHistogram(labelRuntimes),
      qtRuntime: buildRuntimeHistogram(qtRuntimes),
      finalRuntime: buildRuntimeHistogram(finalRuntimes),
    },
    runtimeStats: {
      labelAverage: average(labelRuntimes),
      qtAverage: average(qtRuntimes),
      finalAverage: average(finalRuntimes),
      driftAverage: average(runtimeDrifts),
    },
    launchProjection: buildLaunchProjection(tapes),
    recentAcquisitions,
    tapes,
  };
}
