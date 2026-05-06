import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { db, scores, users } from "@/db";

// GET /api/leaderboard?game=keyboard|multiplication&period=30d|all&level=<n>
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const game   = searchParams.get("game")   ?? "keyboard";
  const period = searchParams.get("period") ?? "30d";
  const level  = searchParams.get("level");

  if (game !== "keyboard" && game !== "multiplication") {
    return NextResponse.json({ error: "Ugyldigt spil" }, { status: 422 });
  }

  // Base filters
  const filters = [
    eq(scores.gameType, game as "keyboard" | "multiplication"),
    eq(scores.completed, true),
    eq(scores.flagged, false),
    eq(users.emailVerified, true),
  ];

  if (period === "30d") {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filters.push(gte(scores.playedAt, cutoff));
  }

  if (level) {
    const lvl = parseInt(level, 10);
    if (!isNaN(lvl)) {
      filters.push(eq(scores.levelId, lvl));
    }
  }

  const rows = await db
    .select({
      userId:     users.id,
      name:       users.name,
      totalScore: sql<number>`cast(sum(${scores.score}) as int)`,
      gamesPlayed: sql<number>`cast(count(*) as int)`,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(and(...filters))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`sum(${scores.score})`))
    .limit(50);

  return NextResponse.json({ leaderboard: rows });
}
