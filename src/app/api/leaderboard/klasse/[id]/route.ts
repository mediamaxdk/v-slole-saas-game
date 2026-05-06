import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, sql, desc, inArray } from "drizzle-orm";
import { db, scores, users, groups, groupMembers } from "@/db";

// GET /api/leaderboard/klasse/[id]?game=keyboard|multiplication&period=30d|all
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const { searchParams } = req.nextUrl;
  const game   = searchParams.get("game")   ?? "keyboard";
  const period = searchParams.get("period") ?? "30d";

  if (game !== "keyboard" && game !== "multiplication") {
    return NextResponse.json({ error: "Ugyldigt spil" }, { status: 422 });
  }

  // Check class exists
  const [klasse] = await db
    .select({ id: groups.id, name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!klasse) {
    return NextResponse.json({ error: "Klasse ikke fundet" }, { status: 404 });
  }

  // Get member IDs in this class
  const members = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  if (members.length === 0) {
    return NextResponse.json({ leaderboard: [], className: klasse.name });
  }

  const memberIds = members.map((m: { userId: string }) => m.userId);

  // Base filters
  const filters = [
    eq(scores.gameType, game as "keyboard" | "multiplication"),
    eq(scores.completed, true),
    eq(scores.flagged, false),
    inArray(scores.userId, memberIds),
  ];

  if (period === "30d") {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filters.push(gte(scores.playedAt, cutoff));
  }

  const rows = await db
    .select({
      userId:      users.id,
      name:        users.name,
      totalScore:  sql<number>`cast(sum(${scores.score}) as int)`,
      gamesPlayed: sql<number>`cast(count(*) as int)`,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(and(...filters))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`sum(${scores.score})`))
    .limit(100);

  return NextResponse.json({ leaderboard: rows, className: klasse.name });
}
