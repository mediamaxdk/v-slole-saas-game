/**
 * Dropper alle tabeller i databasen og genstarter fra bunden.
 * KUN til brug i development — kør ALDRIG dette i produktion.
 *
 * Kør med: node scripts/reset-db.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Læs .env.local
const envPath = resolve(__dirname, "../.env.local");
const lines = readFileSync(envPath, "utf8").split("\n");
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

console.log("⚠️  Dropper alle tabeller...");

await sql`DROP TABLE IF EXISTS
  audit_log,
  contact_messages,
  scores,
  group_members,
  groups,
  verifications,
  accounts,
  sessions,
  users
  CASCADE`;

// Drizzle gemmer sin migrations-state her
await sql`DROP TABLE IF EXISTS drizzle_migrations CASCADE`;

// Drizzle-kit intern tabel
await sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`;

// Slet enums
await sql`DROP TYPE IF EXISTS user_role CASCADE`;
await sql`DROP TYPE IF EXISTS game_type CASCADE`;

console.log("✅ Alle tabeller droppet. Kør nu: npm run db:push");
