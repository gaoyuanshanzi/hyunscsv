import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const rows = await sql`
      SELECT id, title, created_at, updated_at, pg_column_size(content) as size_bytes
      FROM spreadsheets
      ORDER BY updated_at DESC;
    `;
    return NextResponse.json({ success: true, spreadsheets: rows });
  } catch (err: any) {
    console.error("GET /api/spreadsheets error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch spreadsheets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { id, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const docId = id || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const contentJson = JSON.stringify(content);

    // Upsert (INSERT ON CONFLICT DO UPDATE)
    const result = await sql`
      INSERT INTO spreadsheets (id, title, content, updated_at)
      VALUES (${docId}, ${title}, ${contentJson}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, title, created_at, updated_at;
    `;

    return NextResponse.json({
      success: true,
      spreadsheet: result[0],
    });
  } catch (err: any) {
    console.error("POST /api/spreadsheets error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save spreadsheet" },
      { status: 500 }
    );
  }
}
