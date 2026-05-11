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

    // For now, just return success - in production you'd send an email
    // TODO: Implement email sending with the resetUrl
    console.log(`Password reset for ${email}: ${resetUrl}`);

    return Response.json(
      { success: true, message: "Hvis emailen findes i vores system, vil der blive sendt et nulstillingslink" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forget password error:", error);
    return Response.json(
      { error: "Der opstod en fejl" },
      { status: 500 }
    );
  }
}
