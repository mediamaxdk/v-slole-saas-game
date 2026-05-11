import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: "Email er påkrævet" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      // Don't reveal if email exists or not for security
      return Response.json(
        { success: true, message: "Hvis emailen findes i vores system, vil der blive sendt et nulstillingslink" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send the password reset email
    const { sendEmail } = await import("@/lib/email");
    
    try {
      await sendEmail({
        to: email,
        subject: "Nulstil din adgangskode — Tastatur Helten",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Nulstil din adgangskode</h2>
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

      console.log(`Password reset email sent to ${email}: ${resetUrl}`);

      return Response.json(
        { success: true, message: "Nulstillingslink er sendt til din email" },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return Response.json(
        { error: "Kunne ikke sende nulstillingslink" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forget password error:", error);
    return Response.json(
      { error: "Der opstod en fejl" },
      { status: 500 }
    );
  }
}
