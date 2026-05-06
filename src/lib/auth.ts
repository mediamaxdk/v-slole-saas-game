import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user:         schema.users,
      session:      schema.sessions,
      account:      schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Email + adgangskode
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Tillad login uden verify — score kræver verify
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to:      user.email,
        subject: "Nulstil din adgangskode — Tastatur Helten",
        html:    resetPasswordEmail(url),
      });
    },
  },

  // Email-verifikation
  emailVerification: {
    sendOnSignUp:         true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to:      user.email,
        subject: "Bekræft din email — Tastatur Helten",
        html:    verificationEmail(url, user.name ?? user.email),
      });
    },
  },

  // Sociale logins kan tilføjes her senere (fx Google)
  // socialProviders: { google: { ... } },

  session: {
    expiresIn:          60 * 60 * 24 * 30, // 30 dage
    updateAge:          60 * 60 * 24,       // Forny session dagligt ved aktivitet
    cookieCache: {
      enabled: true,
      maxAge:  60 * 5, // 5 minutter client-side cache
    },
  },

  advanced: {
    cookiePrefix: "th", // tastatur-helten
  },
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;

// ─── Email-skabeloner ─────────────────────────────────────────────────────────

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 32px 16px; }
    .card { background: #fff; border-radius: 12px; max-width: 480px; margin: 0 auto; padding: 40px 32px; }
    .logo { font-size: 24px; font-weight: 800; color: #3340f5; margin-bottom: 24px; }
    .btn { display: inline-block; background: #3340f5; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .muted { color: #6b7280; font-size: 13px; margin-top: 24px; }
    a { color: #3340f5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⌨️ Tastatur Helten</div>
    ${content}
    <p class="muted">Denne email blev sendt automatisk. Du kan svare, hvis du har spørgsmål.</p>
  </div>
</body>
</html>`;
}

function verificationEmail(url: string, name: string) {
  return baseLayout(`
    <h2 style="margin:0 0 8px">Hej ${name}!</h2>
    <p>Klik på knappen herunder for at bekræfte din email-adresse og låse op for leaderboardet.</p>
    <a href="${url}" class="btn">Bekræft email</a>
    <p>Linket udløber om 24 timer.</p>
    <p class="muted">Hvis du ikke oprettede en konto, kan du ignorere denne email.</p>
  `);
}

function resetPasswordEmail(url: string) {
  return baseLayout(`
    <h2 style="margin:0 0 8px">Nulstil adgangskode</h2>
    <p>Vi har modtaget en anmodning om at nulstille adgangskoden til din konto.</p>
    <a href="${url}" class="btn">Nulstil adgangskode</a>
    <p>Linket udløber om 1 time.</p>
    <p class="muted">Hvis du ikke bad om dette, kan du ignorere denne email — din adgangskode er ikke ændret.</p>
  `);
}
