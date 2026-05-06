import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";

// POST /api/user/rolle  { rolle: "teacher" | "student" }
// Kan kun sætte rollen opad (public → teacher/student) og kun én gang.
// Kaldt direkte efter registrering inden redirect.
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rolle = body?.rolle;

  if (rolle !== "teacher" && rolle !== "student") {
    return NextResponse.json({ error: "Ugyldig rolle" }, { status: 400 });
  }

  // Hent nuværende rolle — undgå at degradere en admin eller teacher
  const [current] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!current) {
    return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
  }

  // Tillad kun opdatering fra public → teacher/student
  if (current.role !== "public") {
    return NextResponse.json({ ok: true, role: current.role, changed: false });
  }

  await db
    .update(users)
    .set({ role: rolle, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true, role: rolle, changed: true });
}
