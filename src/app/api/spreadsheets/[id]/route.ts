import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await initDb();
    const { id } = await params;
    const rows = await sql`
      SELECT id, title, content, created_at, updated_at
      FROM spreadsheets
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Spreadsheet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, spreadsheet: rows[0] });
  } catch (err: any) {
    console.error("GET /api/spreadsheets/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch spreadsheet" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await initDb();
    const { id } = await params;
    await sql`
      DELETE FROM spreadsheets
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/spreadsheets/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete spreadsheet" },
      { status: 500 }
    );
  }
}
