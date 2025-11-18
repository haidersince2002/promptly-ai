import sql from "./db.js";

// Initializes database schema if missing.
// Safe to run on every startup (uses IF NOT EXISTS guards).
export default async function initDb() {
  // Check if table exists
  const result = await sql`SELECT to_regclass('public.creations') AS exists`;
  if (!result[0].exists) {
    console.log("[DB] Creating table: creations");
  }

  await sql`CREATE TABLE IF NOT EXISTS creations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt TEXT,
    content TEXT,
    type TEXT NOT NULL,
    publish BOOLEAN DEFAULT FALSE,
    likes TEXT[] DEFAULT ARRAY[]::text[],
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // Indexes (filtered and regular)
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_publish ON creations(publish) WHERE publish = TRUE`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creations_type ON creations(type)`;

  console.log("[DB] Schema ensured.");
}
