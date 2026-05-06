import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";

// GET /api/klasse/[id] — klasse-detaljer og medlemsliste (kun lærerens egne)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const { id } = await params;

  const [klasse] = await db
    .select()
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

  const members = await db
    .select({
      userId:   groupMembers.userId,
      name:     users.name,
      email:    users.email,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, id))
    .orderBy(groupMembers.joinedAt);

  return NextResponse.json({ klasse, members });
}
