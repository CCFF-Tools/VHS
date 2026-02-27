import { NextResponse } from "next/server";
import { getTapes } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const tapes = await getTapes();
    const tape = tapes.find((t) => t.id === id);
    if (!tape) {
      return NextResponse.json({ error: "Tape not found" }, { status: 404 });
    }

    const related = tapes.filter(
      (t) => t.id !== tape.id && (t.tapeSequence && t.tapeSequence === tape.tapeSequence)
    );

    return NextResponse.json({ tape, related }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tape", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
