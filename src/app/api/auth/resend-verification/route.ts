import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, users, verifications } from "@/db";
import { sendEmail } from "@/lib/email";
import { nanoid } from "nanoid";

// POST /api/auth/resend-verification — send ny verifikationsmail
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  // Hent brugerinfo
  const [user] = await db
    .select({
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
  }

  // Hvis allerede verificeret, returner success
  if (user.emailVerified) {
    return NextResponse.json({ message: "Email er allerede verificeret" });
  }

  // Slet gamle verifikationstokens
  await db
    .delete(verifications)
    .where(eq(verifications.identifier, user.email));

  // Opret nyt token
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 timer

  await db.insert(verifications).values({
    id: token,
    identifier: user.email,
    value: token,
    expiresAt,
  });

  // Send email
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&callbackURL=%2F`;
  
  const html = `
<!DOCTYPE html>
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
    
    <h2 style="margin:0 0 8px">Hej ${session.user.name || "bruger"}!</h2>
    <p>Klik på knappen herunder for at bekræfte din email-adresse og låse op for leaderboardet.</p>
    <a href="${verificationUrl}" class="btn">Bekræft email</a>
    <p>Linket udløber om 24 timer.</p>
    <p class="muted">Hvis du ikke oprettede en konto, kan du ignorere denne email.</p>
    
    <p class="muted">Denne email blev sendt automatisk. Du kan svare, hvis du har spørgsmål.</p>
  </div>
</body>
</html>`;

  try {
    console.log("Sending verification email to:", user.email);
    console.log("Using EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    
    await sendEmail({
      to: user.email,
      subject: "Bekræft din email — Tastatur Helten",
      html,
    });

    console.log("Verification email sent successfully to:", user.email);
    return NextResponse.json({ message: "Verifikationsmail sendt" });
  } catch (error) {
    console.error("Resend verification error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      email: user.email,
      emailFrom: process.env.EMAIL_FROM,
      resendKeyExists: !!process.env.RESEND_API_KEY,
    });
    return NextResponse.json(
      { error: "Kunne ikke sende email", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
