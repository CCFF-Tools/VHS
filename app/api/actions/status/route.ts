import { NextRequest, NextResponse } from "next/server";
import { isInternalAuthorized } from "@/lib/auth";
import { fieldMap } from "@/lib/schema";
import { updateRecord } from "@/lib/airtable";
import type { Stage } from "@/lib/types";

function stageToFields(stage: Stage) {
  switch (stage) {
    case "Intake":
      return {
        [fieldMap.captured]: false,
        [fieldMap.trimmed]: false,
        [fieldMap.combined]: false,
        [fieldMap.transferredToNas]: false,
      };
    case "Capture":
      return { [fieldMap.captured]: true };
    case "Trim":
      return { [fieldMap.captured]: true, [fieldMap.trimmed]: true };
    case "Combine":
      return { [fieldMap.captured]: true, [fieldMap.trimmed]: true, [fieldMap.combined]: true };
    case "Transfer":
      return {
        [fieldMap.captured]: true,
        [fieldMap.trimmed]: true,
        [fieldMap.combined]: true,
        [fieldMap.transferredToNas]: true,
      };
    case "Archived":
      return {
        [fieldMap.captured]: true,
        [fieldMap.trimmed]: true,
        [fieldMap.combined]: true,
        [fieldMap.transferredToNas]: true,
      };
    default:
      return {};
  }
}

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-internal-password");
  if (!isInternalAuthorized(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; stage?: Stage };
    if (!body.id || !body.stage) {
      return NextResponse.json({ error: "Missing id or stage" }, { status: 400 });
    }

    await updateRecord(body.id, stageToFields(body.stage));
    return NextResponse.json({ ok: true, id: body.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update status", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
