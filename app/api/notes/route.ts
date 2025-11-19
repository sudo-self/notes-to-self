// FILE: app/api/notes/route.ts


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId");

    console.log("🔍 Raw user ID from request:", userId, "Type:", typeof userId);
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

   
    userId = String(userId);
    console.log("🔍 Querying database with user ID:", userId);
    
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
