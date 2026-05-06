import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, gameStats } from "@/db";

const GameTypeSchema = z.enum(["keyboard", "multiplication"]);

// GET /api/stats?game=keyboard|multiplication
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const game = req.nextUrl.searchParams.get("game");
  const parsed = GameTypeSchema.safeParse(game);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldigt spil-parameter" }, { status: 400 });
  }

  const rows = await db
    .select({ statsJson: gameStats.statsJson, updatedAt: gameStats.updatedAt })
    .from(gameStats)
    .where(
      and(
        eq(gameStats.userId, session.user.id),
        eq(gameStats.gameType, parsed.data),
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ stats: null });
  }

  try {
    const stats = JSON.parse(rows[0].statsJson);
    return NextResponse.json({ stats, updatedAt: rows[0].updatedAt });
  } catch {
    return NextResponse.json({ stats: null });
  }
}

// POST /api/stats  { gameType: "keyboard"|"multiplication", stats: object }
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Ugyldig anmodning" }, { status: 400 });
  }

  const gameTypeParsed = GameTypeSchema.safeParse(body.gameType);
  if (!gameTypeParsed.success || typeof body.stats !== "object" || body.stats === null) {
    return NextResponse.json({ error: "Ugyldig data" }, { status: 422 });
  }

  const statsJson = JSON.stringify(body.stats);
  const now = new Date();

  await db
    .insert(gameStats)
    .values({
      userId:    session.user.id,
      gameType:  gameTypeParsed.data,
      statsJson,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [gameStats.userId, gameStats.gameType],
      set:    { statsJson, updatedAt: now },
    });

  return NextResponse.json({ saved: true });
}
