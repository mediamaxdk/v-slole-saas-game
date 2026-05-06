/**
 * Test database og email forbindelser.
 * Kør med: node scripts/test-connections.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Læs .env.local manuelt (vi er uden for Next.js) ─────────────────────────
const envPath = resolve(__dirname, "../.env.local");
try {
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
  console.log("✅ .env.local indlæst\n");
} catch {
  console.error("❌ Kunne ikke læse .env.local — er filen der?");
  process.exit(1);
}

// ─── 1. Test database ─────────────────────────────────────────────────────────
async function testDatabase() {
  console.log("─── Database (Neon) ───────────────────────────────────");
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL mangler i .env.local");
    return false;
  }
  console.log(`   URL: ${url.replace(/:([^@]+)@/, ":****@")}`); // skjul password

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    const result = await sql`SELECT current_database() AS db, now() AS tid`;
    console.log(`✅ Forbundet til database: "${result[0].db}"`);
    console.log(`   Servertid: ${result[0].tid}`);
    return true;
  } catch (err) {
    console.error("❌ Databasefejl:", err.message);
    return false;
  }
}

// ─── 2. Test email (Resend) ───────────────────────────────────────────────────
async function testEmail() {
  console.log("\n─── Email (Resend) ────────────────────────────────────");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Tastatur Helten <onboarding@resend.dev>";
  const to   = process.env.TEST_EMAIL ?? "info@mediamax.dk";

  if (!key) {
    console.error("❌ RESEND_API_KEY mangler i .env.local");
    return false;
  }
  console.log(`   Sender fra: ${from}`);
  console.log(`   Sender til: ${to}`);

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "✅ Tastatur Helten — forbindelsestest",
      html: `<p>Hvis du modtager denne email virker Resend-integrationen korrekt.</p>
             <p><small>Sendt fra test-connections.mjs · ${new Date().toLocaleString("da-DK")}</small></p>`,
    });

    if (error) {
      console.error("❌ Resend-fejl:", error.message ?? JSON.stringify(error));
      return false;
    }
    console.log(`✅ Email sendt — ID: ${data.id}`);
    return true;
  } catch (err) {
    console.error("❌ Email-fejl:", err.message);
    return false;
  }
}

// ─── Kør begge tests ──────────────────────────────────────────────────────────
const dbOk    = await testDatabase();
const emailOk = await testEmail();

console.log("\n─── Resultat ──────────────────────────────────────────");
console.log(`   Database : ${dbOk    ? "✅ OK" : "❌ Fejl"}`);
console.log(`   Email    : ${emailOk ? "✅ OK" : "❌ Fejl"}`);

if (dbOk && emailOk) {
  console.log("\n🎉 Alt virker — klar til næste fase!\n");
} else {
  console.log("\n⚠️  Ret fejlene ovenfor inden du fortsætter.\n");
  process.exit(1);
}
