/**
 * Vis alle brugere i databasen.
 * Kør med: node scripts/check-users.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const lines = readFileSync(resolve(__dirname, "../.env.local"), "utf8").split("\n");
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const users    = await sql`SELECT id, email, name, role, email_verified, created_at FROM users ORDER BY created_at DESC`;
const accounts = await sql`SELECT user_id, provider_id, created_at FROM accounts ORDER BY created_at DESC`;

console.log(`\n─── Brugere (${users.length}) ───────────────────────────────`);
if (users.length === 0) {
  console.log("  (ingen brugere endnu)");
} else {
  for (const u of users) {
    console.log(`  id:       ${u.id}`);
    console.log(`  email:    ${u.email}`);
    console.log(`  navn:     ${u.name ?? "(ikke sat)"}`);
    console.log(`  rolle:    ${u.role}`);
    console.log(`  verified: ${u.email_verified ? "✅ ja" : "❌ nej"}`);
    console.log(`  oprettet: ${new Date(u.created_at).toLocaleString("da-DK")}`);
    console.log();
  }
}

console.log(`─── Konti (${accounts.length}) ──────────────────────────────────`);
for (const a of accounts) {
  console.log(`  user_id:  ${a.user_id}`);
  console.log(`  provider: ${a.provider_id}`);
  console.log();
}
