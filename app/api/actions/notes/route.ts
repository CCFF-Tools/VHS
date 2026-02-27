import { NextRequest, NextResponse } from "next/server";
import { isInternalAuthorized } from "@/lib/auth";
import { updateRecord } from "@/lib/airtable";

const notesField = process.env.AIRTABLE_INTERNAL_NOTES_FIELD ?? "Internal Notes";

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-internal-password");
  if (!isInternalAuthorized(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; note?: string };
    if (!body.id || !body.note) {
      return NextResponse.json({ error: "Missing id or note" }, { status: 400 });
    }

    const updated = await updateRecord(body.id, { [notesField]: body.note });
    return NextResponse.json({ ok: true, id: updated.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to add note",
        detail:
          (error as Error).message +
          ` (Set AIRTABLE_INTERNAL_NOTES_FIELD to a valid text field if '${notesField}' does not exist)`,
      },
      { status: 500 }
    );
  }
}
