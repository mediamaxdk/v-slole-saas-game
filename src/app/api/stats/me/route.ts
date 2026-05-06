import { NextRequest, NextResponse } from "next/server";
import { eq, count, sum, avg, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, scores } from "@/db";

// GET /api/stats/me — personlige statistikker for den indloggede bruger
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  try {
    // Simple statistics without complex SQL
    const [overallStats] = await db
      .select({
        totalPlays: count(scores.id),
        totalScore: sum(scores.score).mapWith(Number),
        avgScore: avg(scores.score).mapWith(Number),
      })
      .from(scores)
      .where(eq(scores.userId, session.user.id))
      .limit(1);

    // Game type breakdown
    const gameTypeStats = await db
      .select({
        gameType: scores.gameType,
        totalPlays: count(scores.id),
        totalScore: sum(scores.score).mapWith(Number),
        avgScore: avg(scores.score).mapWith(Number),
      })
      .from(scores)
      .where(eq(scores.userId, session.user.id))
      .groupBy(scores.gameType);

    // Recent games
    const recentGames = await db
      .select({
        gameType: scores.gameType,
        levelId: scores.levelId,
        score: scores.score,
        lettersCorrect: scores.lettersCorrect,
        lettersWrong: scores.lettersWrong,
        durationMs: scores.durationMs,
        completed: scores.completed,
        playedAt: scores.playedAt,
      })
      .from(scores)
      .where(eq(scores.userId, session.user.id))
      .orderBy(sql`${scores.playedAt} DESC`)
      .limit(10);

    // Calculate accuracy for overall stats
    const allScores = await db
      .select({
        lettersCorrect: scores.lettersCorrect,
        lettersWrong: scores.lettersWrong,
      })
      .from(scores)
      .where(eq(scores.userId, session.user.id));

    const totalCorrect = allScores.reduce((sum, s) => sum + (s.lettersCorrect || 0), 0);
    const totalWrong = allScores.reduce((sum, s) => sum + (s.lettersWrong || 0), 0);
    const totalLetters = totalCorrect + totalWrong;
    const overallAccuracy = totalLetters > 0 ? Math.round((totalCorrect / totalLetters) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalPlays: overallStats?.totalPlays || 0,
        totalScore: overallStats?.totalScore || 0,
        avgScore: Math.round((overallStats?.avgScore || 0) * 100) / 100,
        avgAccuracy: overallAccuracy,
        avgGameDurationMinutes: 0, // Calculate from durationMs if needed
        totalCompletedLevels: overallStats?.totalPlays || 0,
      },
      gameBreakdown: gameTypeStats,
      levelBreakdown: [], // Simplified for now
      recentGames: recentGames,
      activityChart: [], // Simplified for now
      detailedStats: {
        keyboard: null,
        multiplication: null,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente statistikker" },
      { status: 500 }
    );
  }
}
