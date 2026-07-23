import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * GET /api/health/db
 *
 * Pings the configured MongoDB database so MONGODB_URI / MONGODB_DB can be
 * verified after setup, both locally (`npm run dev`) and once deployed.
 * Not linked from the site UI — hit it directly to check connectivity.
 */
export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ ok: true, database: db.databaseName });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
