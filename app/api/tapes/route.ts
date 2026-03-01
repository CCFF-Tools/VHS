import { NextRequest, NextResponse } from "next/server";
import { format, parseISO } from "date-fns";
import { getTapes } from "@/lib/data";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const search = query.get("search")?.toLowerCase() || "";
    const stage = query.get("stage") || "all";
    const priority = query.get("priority") || "all";
    const hasIssues = query.get("hasIssues") === "true";
    const date = query.get("date") || "";
    const dateField = query.get("dateField") || "cataloged";
    const runtimeField = query.get("runtimeField") || "best";
    const runtimeMinRaw = query.get("runtimeMin");
    const runtimeMaxRaw = query.get("runtimeMax");
    const runtimeMin = runtimeMinRaw != null ? Number(runtimeMinRaw) : undefined;
    const runtimeMax = runtimeMaxRaw != null ? Number(runtimeMaxRaw) : undefined;

    const dayKey = (value?: string) => {
      if (!value) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      try {
        return format(parseISO(value), "yyyy-MM-dd");
      } catch {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        return format(parsed, "yyyy-MM-dd");
      }
    };

    const dateValueForField = (
      mode: string,
      tape: { acquisitionAt?: string; receivedDate?: string; capturedAt?: string; contentRecordedAt?: string }
    ) => {
      if (mode === "captured") return tape.capturedAt;
      if (mode === "content") return tape.contentRecordedAt;
      return tape.acquisitionAt ?? tape.receivedDate;
    };

    const runtimeForField = (
      mode: string,
      tape: { labelRuntimeMinutes?: number; qtRuntimeMinutes?: number; finalClipDurationMinutes?: number }
    ) => {
      if (mode === "label") return tape.labelRuntimeMinutes;
      if (mode === "qt") return tape.qtRuntimeMinutes;
      if (mode === "final") return tape.finalClipDurationMinutes;
      return tape.labelRuntimeMinutes ?? tape.qtRuntimeMinutes ?? tape.finalClipDurationMinutes;
    };

    const tapes = await getTapes();
    const filtered = tapes.filter((tape) => {
      if (search && !`${tape.tapeId} ${tape.tapeName}`.toLowerCase().includes(search)) return false;
      if (stage !== "all" && tape.stage !== stage) return false;
      if (priority !== "all" && tape.priority !== priority) return false;
      if (hasIssues && tape.issueTags.length === 0) return false;
      if (date && dayKey(dateValueForField(dateField, tape)) !== dayKey(date)) return false;
      const runtime = runtimeForField(runtimeField, tape);
      if (Number.isFinite(runtimeMin) && (runtime == null || runtime < Number(runtimeMin))) return false;
      if (Number.isFinite(runtimeMax) && (runtime == null || runtime > Number(runtimeMax))) return false;
      return true;
    });

    return NextResponse.json({ items: filtered, total: filtered.length }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tapes", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
