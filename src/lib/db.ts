import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_uY5OQmlzw7AT@ep-summer-cloud-ay2yf5yk.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(connectionString);

/**
 * 테이블 자동 초기화 함수
 */
export async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS spreadsheets (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (err) {
    console.error("Neon DB init error:", err);
  }
}
