import { eachDayOfInterval, endOfDay, format, isToday, parseISO, startOfDay, subDays } from "date-fns";
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
    const count = tapes.filter(
      (t) => t.acquisitionAt && format(parseISO(t.acquisitionAt), "yyyy-MM-dd") === key
    ).length;
    return { date: key, count };
  });
}

function bucketRuntime(minutes: number): string {
  if (minutes <= 30) return "0-30";
  if (minutes <= 60) return "31-60";
  if (minutes <= 90) return "61-90";
  if (minutes <= 120) return "91-120";
  return "121+";
}

function buildRuntimeHistogram(values: number[]) {
  const buckets = ["0-30", "31-60", "61-90", "91-120", "121+"];
  const counts = new Map<string, number>(buckets.map((b) => [b, 0]));

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
    const createdTime = toDate(record._rawJson.createdTime);
    const acquisitionAt = receivedDate ?? createdTime;
    const baselineDate = receivedDate ?? createdTime;
    const completedDate =
      fieldMap.completedDate && fields[fieldMap.completedDate]
        ? toDate(fields[fieldMap.completedDate])
        : undefined;

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
      acquisitionAt,
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
      priority: inferPriority(parsed.ageInStageDays ?? 0),
      ageInStageDays: parsed.ageInStageDays ?? 0,
      completedDate,
    };

    result.issueTags = inferIssues(result);
    return result;
  });
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

  const recentAcquisitions = [...tapes]
    .filter((t) => t.acquisitionAt)
    .sort((a, b) => parseISO(b.acquisitionAt!).getTime() - parseISO(a.acquisitionAt!).getTime())
    .slice(0, 20);

  return {
    kpis: {
      totalTapes: tapes.length,
      capturedCount: tapes.filter((t) => Boolean(t.captured)).length,
      trimmedCount: tapes.filter((t) => Boolean(t.trimmed)).length,
      combinedCount: tapes.filter((t) => Boolean(t.combined)).length,
      transferredCount: tapes.filter((t) => Boolean(t.transferredToNas)).length,
      receivedToday: tapes.filter((t) => {
        const date = t.receivedDate ?? t.acquisitionAt;
        return Boolean(date && isToday(parseISO(date)));
      }).length,
    },
    stageCounts,
    acquisitionDaily: buildAcquisitionDaily(tapes),
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
    recentAcquisitions,
    tapes,
  };
}
