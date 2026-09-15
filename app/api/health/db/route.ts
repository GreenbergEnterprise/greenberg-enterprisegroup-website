import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

/**
 * GET /api/health/db
 *
 * Runs a trivial query against Postgres (Supabase) so DATABASE_URL can be
 * verified after setup, both locally (`npm run dev`) and once deployed.
 * Not linked from the site UI — hit it directly to check connectivity.
 */
export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql<{ db: string }[]>`select current_database() as db`;
    return NextResponse.json({ ok: true, database: rows[0].db });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
