import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getMongoDb({ mode: "read" });
    await db.command({ ping: 1 });
    return NextResponse.json({ success: true, status: "ready", services: { mongodb: "up" } });
  } catch {
    return NextResponse.json(
      { success: false, status: "not_ready", code: "DATABASE_UNAVAILABLE", services: { mongodb: "down" } },
      { status: 503 }
    );
  }
}
