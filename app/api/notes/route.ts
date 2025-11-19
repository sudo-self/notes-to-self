import { NextResponse } from "next/server";
import { db } from "@/lib/turso";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");


    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    console.log("Fetching notes for user:", userId);
    
    const notes = await db.execute({
      sql: "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      args: [userId],
    });

    console.log("Found notes:", notes.rows.length);

    const transformedNotes = notes.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json(transformedNotes);
  } catch (e) {
    console.error("Error fetching notes:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, userId, title, content } = await req.json();

    console.log("Saving note:", { id, userId, title, content });


    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const noteId = id || randomUUID();

    await db.execute({
      sql: `
        INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          updated_at = excluded.updated_at
      `,
      args: [noteId, userId, title || "Untitled", content || "", now, now],
    });

    const saved = await db.execute({
      sql: "SELECT * FROM notes WHERE id = ?",
      args: [noteId],
    });


    const savedNote = {
      id: saved.rows[0].id,
      title: saved.rows[0].title,
      content: saved.rows[0].content,
      created_at: saved.rows[0].created_at,
      updated_at: saved.rows[0].updated_at
    };

    console.log("Successfully saved note:", savedNote.id);
    return NextResponse.json(savedNote);
  } catch (e) {
    console.error("Error saving note:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    console.log("Deleting note:", noteId);

    await db.execute({
      sql: "DELETE FROM notes WHERE id = ?",
      args: [noteId],
    });

    console.log("Successfully deleted note:", noteId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error deleting note:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
