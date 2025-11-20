// app/api/init-db/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/turso";

export async function GET() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)
    `);

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
