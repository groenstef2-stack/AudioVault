import pg from "pg";

const { Pool } = pg;

// Railway's Postgres plugin zet automatisch DATABASE_URL klaar als environment variable.
// Als die niet bestaat, draait de bot gewoon door zonder database (alleen Discord embeds).
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

// Maakt de benodigde tabellen aan als ze nog niet bestaan. Wordt bij opstarten aangeroepen.
export async function initDatabase() {
  if (!pool) {
    console.log("ℹ️  Geen DATABASE_URL gevonden — database opslag is uitgeschakeld.");
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
      status TEXT NOT NULL DEFAULT 'open',
      opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      closed_at TIMESTAMPTZ,
      closed_by TEXT
    );
  `);

  console.log("✅ Database tabellen zijn klaar (reviews, tickets).");
}

export async function saveReview({ userId, username, rating, message }) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO reviews (user_id, username, rating, message) VALUES ($1, $2, $3, $4)`,
    [userId, username, rating, message]
  );
}

export async function saveTicketOpened({ channelId, channelName, userId, username }) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO tickets (channel_id, channel_name, user_id, username) VALUES ($1, $2, $3, $4)`,
    [channelId, channelName, userId, username]
  );
}

export async function saveTicketClosed({ channelId, closedBy }) {
  if (!pool) return;
  await pool.query(
    `UPDATE tickets SET status = 'closed', closed_at = now(), closed_by = $2 WHERE channel_id = $1`,
    [channelId, closedBy]
  );
}
