import { NextRequest, NextResponse } from "next/server";
import { eq, and, count, sum, avg, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users, scores } from "@/db";

// GET /api/klasse/[id]/stats — klasse-statistikker (kun lærerens egne)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const { id } = await params;

  // Verificer at læreren ejer klassen
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

  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const daysFilter = daysParam ? parseInt(daysParam, 10) : 30;

  // Calculate date filter
  const dateFilter = daysFilter > 0 
    ? gte(scores.playedAt, sql`NOW() - INTERVAL '${daysFilter} day'`)
    : undefined;

  // Get class members
  const members = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, id));

  const memberIds = members.map((m: { userId: string }) => m.userId);

  if (memberIds.length === 0) {
    return NextResponse.json({
      klasse: {
        id: klasse.id,
        name: klasse.name,
        memberCount: 0,
      },
      overview: {
        totalPlays: 0,
        totalScore: 0,
        avgScore: 0,
        activeUsers: 0,
        avgAccuracy: 0,
      },
      gameBreakdown: [],
      levelBreakdown: [],
      topStudents: [],
      activityChart: [],
    });
  }

  // Overall statistics
  const [overallStats] = await db
    .select({
      totalPlays: count(scores.id),
      totalScore: sum(scores.score).mapWith(Number),
      avgScore: avg(scores.score).mapWith(Number),
      activeUsers: count(sql`DISTINCT ${scores.userId}`),
      totalCorrect: sum(scores.lettersCorrect).mapWith(Number),
      totalWrong: sum(scores.lettersWrong).mapWith(Number),
    })
    .from(scores)
    .where(
      and(
        sql`${scores.userId} = ANY(${memberIds})`,
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
    })
    .from(scores)
    .where(
      and(
        sql`${scores.userId} = ANY(${memberIds})`,
        dateFilter || sql`1=1`
      )
    )
    .groupBy(scores.gameType);

  // Level breakdown
  const levelStats = await db
    .select({
      levelId: scores.levelId,
      totalPlays: count(scores.id),
      avgScore: avg(scores.score).mapWith(Number),
      completionRate: sql<number>`ROUND(AVG(CASE WHEN ${scores.completed} = true THEN 100.0 ELSE 0.0 END), 2)`,
    })
    .from(scores)
    .where(
      and(
        sql`${scores.userId} = ANY(${memberIds})`,
        dateFilter || sql`1=1`
      )
    )
    .groupBy(scores.levelId)
    .orderBy(scores.levelId);

  // Top students
  const topStudents = await db
    .select({
      userId: scores.userId,
      name: users.name,
      totalScore: sum(scores.score).mapWith(Number),
      totalPlays: count(scores.id),
      avgScore: avg(scores.score).mapWith(Number),
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(
      and(
        sql`${scores.userId} = ANY(${memberIds})`,
        dateFilter || sql`1=1`
      )
    )
    .groupBy(scores.userId, users.name)
    .orderBy(sql`${sum(scores.score)} DESC`)
    .limit(10);

  // Activity chart (last 7 days)
  const activityChart = await db
    .select({
      date: sql<string>`DATE(${scores.playedAt})`,
      plays: count(scores.id),
      uniqueUsers: count(sql`DISTINCT ${scores.userId}`),
      totalScore: sum(scores.score).mapWith(Number),
    })
    .from(scores)
    .where(
      and(
        sql`${scores.userId} = ANY(${memberIds})`,
        gte(scores.playedAt, sql`NOW() - INTERVAL '7 day'`)
      )
    )
    .groupBy(sql`DATE(${scores.playedAt})`)
    .orderBy(sql`DATE(${scores.playedAt})`);

  // Calculate overall accuracy
  const totalLetters = (overallStats.totalCorrect || 0) + (overallStats.totalWrong || 0);
  const overallAccuracy = totalLetters > 0 
    ? Math.round((overallStats.totalCorrect! / totalLetters) * 100)
    : 0;

  return NextResponse.json({
    klasse: {
      id: klasse.id,
      name: klasse.name,
      memberCount: memberIds.length,
    },
    overview: {
      totalPlays: overallStats.totalPlays || 0,
      totalScore: overallStats.totalScore || 0,
      avgScore: Math.round((overallStats.avgScore || 0) * 100) / 100,
      activeUsers: overallStats.activeUsers || 0,
      avgAccuracy: overallAccuracy,
    },
    gameBreakdown: gameStats,
    levelBreakdown: levelStats,
    topStudents: topStudents,
    activityChart: activityChart,
  });
}
