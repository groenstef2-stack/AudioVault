import pg from "pg";

const { Pool } = pg;

// Railway's Postgres plugin automatically provides DATABASE_URL as an environment variable.
// If it doesn't exist, the bot simply runs without a database (Discord embeds only).
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Creates the required tables if they don't exist yet. Called on startup.
export async function initDatabase() {
  if (!pool) {
    console.log("ℹ️  No DATABASE_URL found — database storage is disabled.");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      rating INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      channel_id TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'support',
      status TEXT NOT NULL DEFAULT 'open',
      opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      closed_at TIMESTAMPTZ,
      closed_by TEXT
    );
  `);

  // Migration safety net: adds the "type" column if this table already existed
  // from before this feature was added (won't error if it's already there).
  await pool.query(`
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'support';
  `);

  console.log("✅ Database tables are ready (reviews, tickets).");
}

export async function saveReview({ userId, username, rating, message }) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO reviews (user_id, username, rating, message) VALUES ($1, $2, $3, $4)`,
    [userId, username, rating, message]
  );
}

export async function saveTicketOpened({ channelId, channelName, userId, username, type }) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO tickets (channel_id, channel_name, user_id, username, type) VALUES ($1, $2, $3, $4, $5)`,
    [channelId, channelName, userId, username, type || "support"]
  );
}

export async function saveTicketClosed({ channelId, closedBy }) {
  if (!pool) return;
  await pool.query(
    `UPDATE tickets SET status = 'closed', closed_at = now(), closed_by = $2 WHERE channel_id = $1`,
    [channelId, closedBy]
  );
}
