import { NextRequest, NextResponse } from "next/server";
import { getTapes } from "@/lib/data";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    const search = query.get("search")?.toLowerCase() || "";
    const stage = query.get("stage") || "all";
    const priority = query.get("priority") || "all";
    const hasIssues = query.get("hasIssues") === "true";

    const tapes = await getTapes();
    const filtered = tapes.filter((tape) => {
      if (search && !`${tape.tapeId} ${tape.tapeName}`.toLowerCase().includes(search)) return false;
      if (stage !== "all" && tape.stage !== stage) return false;
      if (priority !== "all" && tape.priority !== priority) return false;
      if (hasIssues && tape.issueTags.length === 0) return false;
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
