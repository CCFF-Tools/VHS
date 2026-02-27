import { NextResponse } from "next/server";
import { getOpsSummary } from "@/lib/data";

export const revalidate = 60;

export async function GET() {
  try {
    const summary = await getOpsSummary();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ops summary", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
