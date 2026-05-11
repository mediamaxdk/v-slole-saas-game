import { NextRequest, NextResponse } from "next/server";
import { db, users, verifications, accounts } from "@/db";
import { eq, and, lt, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token eller adgangskode mangler" },
        { status: 400 }
      );
    }

    // Find valid reset token
    const now = new Date();
    const tokenRecord = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.id, token),
          gt(verifications.expiresAt, now)
        )
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json(
        { error: "Ugyldigt eller udløbet nulstillingslink" },
        { status: 400 }
      );
    }

    // Find the user associated with this token
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, tokenRecord[0].identifier))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Bruger ikke fundet" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in accounts table
    await db
      .update(accounts)
      .set({ password: hashedPassword })
      .where(eq(accounts.userId, user[0].id));

    // Delete the used token
    await db
      .delete(verifications)
      .where(eq(verifications.id, token));

    console.log(`Password reset completed for user: ${user[0].email}`);

    return NextResponse.json(
      { success: true, message: "Adgangskode er blevet nulstillet" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Der opstod en fejl. Prøv venligst igen." },
      { status: 500 }
    );
  }
}
