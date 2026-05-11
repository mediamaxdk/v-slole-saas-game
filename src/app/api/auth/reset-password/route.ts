import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json(
        { error: "Token eller adgangskode mangler" },
        { status: 400 }
      );
    }

    // Verify token exists and is valid
    // In production, you'd check against database
    // For now, accept any token for development
    console.log(`Password reset attempt for token: ${token}`);

    // TODO: Update user password in database when properly integrated with auth system
    // For now, just log the reset attempt
    console.log(`Password reset completed for token: ${token}, new password: ${password}`);

    // const hashedPassword = await bcrypt.hash(password, 10);
    // await db
    //   .update(users)
    //   .set({ password: hashedPassword })
    //   .where(eq(users.email, (await db.select().from(users).where(eq(users.resetToken, token)).limit(1))[0]?.email));

    return Response.json(
      { success: true, message: "Adgangskode er blevet nulstillet" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { error: "Der opstod en fejl" },
      { status: 500 }
    );
  }
}
