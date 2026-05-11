import { NextRequest, NextResponse } from "next/server";
import { db, users, verifications, accounts } from "@/db";
import { eq, and, lt, gt } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";

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

    // Hash the new password using Better Auth's official hashPassword function
    const hashedPassword = await hashPassword(newPassword);
    console.log(`Generated hash: ${hashedPassword.substring(0, 20)}...`);

    // Check existing account records for this user
    const existingAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user[0].id));
    
    console.log(`Found ${existingAccounts.length} account(s) for user ${user[0].id}:`);
    existingAccounts.forEach(acc => {
      console.log(`  - Provider: ${acc.providerId}, AccountId: ${acc.accountId}`);
    });

    // Update user's password in accounts table
    // Ensure we're updating the credential provider account
    const updateResult = await db
      .update(accounts)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(accounts.userId, user[0].id),
          eq(accounts.providerId, "credential") // Better Auth uses "credential" for email/password
        )
      );
    
    console.log(`Updated ${updateResult.rowCount || 1} account record(s)`);

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
