import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers } from "@/db";

// DELETE /api/klasse/[id]/elev/[userId] — fjern elev fra klasse
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const { id, userId } = await params;

  // Bekræft at klassen tilhører denne lærer
  const [klasse] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(
      and(
        eq(groups.id, id),
        eq(groups.teacherId, session.user.id)
      )
    )
    .limit(1);

  if (!klasse) {
    return NextResponse.json({ error: "Klasse ikke fundet" }, { status: 404 });
  }

  await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, id),
        eq(groupMembers.userId, userId)
      )
    );

  return NextResponse.json({ ok: true });
}
