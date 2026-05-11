import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users, verifications } from "@/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email er påkrævet" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { success: true, message: "Hvis emailen findes i vores system, vil der blive sendt et nulstillingslink" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token in database
    await db.insert(verifications).values({
      id: resetToken,
      identifier: email,
      value: resetToken,
      expiresAt,
    });
    
    // Send the password reset email using Better Auth's configured function
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    // Import and use Better Auth's email sending function
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      subject: "Nulstil din adgangskode — Tastatur Helten",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Nulstil adgangskode</h2>
            <p style="color: #666; margin-bottom: 20px;">Hej!</p>
            <p style="color: #666; margin-bottom: 20px;">Du har bedt om at nulstille din adgangskode til Tastatur Helten.</p>
            <p style="color: #666; margin-bottom: 30px;">Klik på linken nedenfor for at nulstille din adgangskode:</p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Nulstil adgangskode</a>
            </div>
            <p style="color: #999; font-size: 12px;">Linken er gyldig i 1 time.</p>
            <p style="color: #666; margin-bottom: 20px;">Hvis du ikke har bedt om at nulstille din adgangskode, kan du ignorere denne email.</p>
            <p style="color: #666;">Med venlig hilsen,<br>Tastatur Helten Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Nulstillingslink er sendt til din email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Der opstod en fejl. Prøv venligst igen." },
      { status: 500 }
    );
  }
}
