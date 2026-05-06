import { NextRequest, NextResponse } from "next/server";
import { eq, and, count, sum, avg, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, scores, gameStats } from "@/db";

// GET /api/stats/me — personlige statistikker for den indloggede bruger
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = url.searchParams.get("days");
  const daysFilter = days ? parseInt(days, 10) : 30;

  // Calculate date filter
  const dateFilter = daysFilter > 0 
    ? gte(scores.playedAt, sql`NOW() - INTERVAL '${daysFilter} days'`)
    : undefined;

  // Overall statistics
  const [overallStats] = await db
    .select({
      totalPlays: count(scores.id),
      totalScore: sum(scores.score).mapWith(Number),
      avgScore: avg(scores.score).mapWith(Number),
      totalCorrect: sum(scores.lettersCorrect).mapWith(Number),
      totalWrong: sum(scores.lettersWrong).mapWith(Number),
      totalDuration: sum(scores.durationMs).mapWith(Number),
      completedLevels: count(sql`CASE WHEN ${scores.completed} = true THEN 1 END`),
    })
    .from(scores)
    .where(
      and(
        eq(scores.userId, session.user.id),
        dateFilter || sql`1=1`
      )
    );

  // Game type breakdown
  const gameStats = await db
    .select({
      gameType: scores.gameType,
      totalPlays: count(scores.id),
      totalScore: sum(scores.score).mapWith(Number),
      avgScore: avg(scores.score).mapWith(Number),
      avgAccuracy: sql<number>`ROUND(AVG(CASE WHEN (${scores.lettersCorrect} + ${scores.lettersWrong}) > 0 
        THEN (${scores.lettersCorrect}::float / (${scores.lettersCorrect} + ${scores.lettersWrong})::float) * 100 
        ELSE 0 END), 2)`,
      avgDuration: avg(scores.durationMs).mapWith(Number),
      completedLevels: count(sql`CASE WHEN ${scores.completed} = true THEN 1 END`),
      highestLevel: sql<number>`MAX(${scores.levelId})`,
    })
    .from(scores)
    .where(
      and(
        eq(scores.userId, session.user.id),
        dateFilter || sql`1=1`
      )
    )
    .groupBy(scores.gameType);

  // Level breakdown
  const levelStats = await db
    .select({
      gameType: scores.gameType,
      levelId: scores.levelId,
      totalPlays: count(scores.id),
      bestScore: sql<number>`MAX(${scores.score})`,
      avgScore: avg(scores.score).mapWith(Number),
      completionRate: sql<number>`ROUND(AVG(CASE WHEN ${scores.completed} = true THEN 100.0 ELSE 0.0 END), 2)`,
      lastPlayed: sql<string>`MAX(${scores.playedAt})`,
    })
    .from(scores)
    .where(
      and(
        eq(scores.userId, session.user.id),
        dateFilter || sql`1=1`
      )
    )
    .groupBy(scores.gameType, scores.levelId)
    .orderBy(scores.gameType, scores.levelId);

  // Recent activity (last 10 games)
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

  // Activity chart (last 7 days)
  const activityChart = await db
    .select({
      date: sql<string>`DATE(${scores.playedAt})`,
      plays: count(scores.id),
      totalScore: sum(scores.score).mapWith(Number),
      avgScore: avg(scores.score).mapWith(Number),
      totalDuration: sum(scores.durationMs).mapWith(Number),
    })
    .from(scores)
    .where(
      and(
        eq(scores.userId, session.user.id),
        gte(scores.playedAt, sql`NOW() - INTERVAL '7 days'`)
      )
    )
    .groupBy(sql`DATE(${scores.playedAt})`)
    .orderBy(sql`DATE(${scores.playedAt})`);

  // Get detailed game stats from gameStats table
  const [keyboardStats] = await db
    .select({ statsJson: gameStats.statsJson })
    .from(gameStats)
    .where(
      and(
        eq(gameStats.userId, session.user.id),
        eq(gameStats.gameType, "keyboard")
      )
    )
    .limit(1);

  const [multiplicationStats] = await db
    .select({ statsJson: gameStats.statsJson })
    .from(gameStats)
    .where(
      and(
        eq(gameStats.userId, session.user.id),
        eq(gameStats.gameType, "multiplication")
      )
    )
    .limit(1);

  // Parse detailed stats if available
  let keyboardDetailedStats = null;
  let multiplicationDetailedStats = null;

  try {
    if (keyboardStats?.statsJson) {
      keyboardDetailedStats = JSON.parse(keyboardStats.statsJson);
    }
    if (multiplicationStats?.statsJson) {
      multiplicationDetailedStats = JSON.parse(multiplicationStats.statsJson);
    }
  } catch {
    // Ignore JSON parsing errors
  }

  // Calculate overall accuracy
  const totalLetters = (overallStats.totalCorrect || 0) + (overallStats.totalWrong || 0);
  const overallAccuracy = totalLetters > 0 
    ? Math.round((overallStats.totalCorrect! / totalLetters) * 100)
    : 0;

  // Calculate average game duration in minutes
  const avgGameDurationMinutes = overallStats.totalDuration && overallStats.totalPlays > 0
    ? Math.round((overallStats.totalDuration / overallStats.totalPlays) / 1000 / 60 * 10) / 10
    : 0;

  return NextResponse.json({
    overview: {
      totalPlays: overallStats.totalPlays || 0,
      totalScore: overallStats.totalScore || 0,
      avgScore: Math.round((overallStats.avgScore || 0) * 100) / 100,
      avgAccuracy: overallAccuracy,
      avgGameDurationMinutes,
      totalCompletedLevels: overallStats.completedLevels || 0,
    },
    gameBreakdown: gameStats,
    levelBreakdown: levelStats,
    recentGames: recentGames,
    activityChart: activityChart,
    detailedStats: {
      keyboard: keyboardDetailedStats,
      multiplication: multiplicationDetailedStats,
    },
  });
}
