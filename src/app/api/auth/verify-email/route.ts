import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, verifications, users } from "@/db";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/auth/verify-email — Better Auth email verification endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
    }

    // Find verification token
    const [verification] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.id, token))
      .limit(1);

    if (!verification) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
    }

    // Check if token is expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.redirect(new URL("/login?error=expired-token", req.url));
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, verification.identifier))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user-not-found", req.url));
    }

    // Update user email verification
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, user.id));

    // Delete verification token
    await db
      .delete(verifications)
      .where(eq(verifications.id, token));

    // Redirect to success page
    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/login?error=verification-failed", req.url));
  }
}
