import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, scores } from "@/db";
import { isScorePlausible } from "@/lib/utils";

const ScoreSchema = z.object({
  gameType:       z.enum(["keyboard", "multiplication"]),
  levelId:        z.number().int().min(1).max(13),
  score:          z.number().int().min(0),
  lettersCorrect: z.number().int().min(0),
  lettersWrong:   z.number().int().min(0),
  durationMs:     z.number().int().min(1000),   // mindst 1 sekund
  completed:      z.boolean(),
  clientHash:     z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limiting håndteres af Cloudflare / middleware

  // Auth — anonym spil er tilladt, men scorer gemmes kun for indloggede
  const session = await auth.api.getSession({ headers: req.headers });

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Ugyldig anmodning" }, { status: 400 });
  }

  const parsed = ScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig data", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  // Basal anti-cheat (Lag 1)
  if (!isScorePlausible({
    lettersCorrect: data.lettersCorrect,
    lettersWrong:   data.lettersWrong,
    durationMs:     data.durationMs,
    score:          data.score,
  })) {
    return NextResponse.json({ error: "Score ser urealistisk ud" }, { status: 422 });
  }

  // Anonym spiller — bekræft modtagelse men gem ikke
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false, reason: "not_authenticated" });
  }

  // Tjek om email er verificeret (krav for leaderboard)
  const emailVerified = session.user.emailVerified;

  // Lag 3: flag outlier scores til manuel review (implementeres med percentil-query)
  // For nu: gem med flagged: false
  const [inserted] = await db.insert(scores).values({
    userId:         session.user.id,
    gameType:       data.gameType === "multiplication" ? "multiplication" : "keyboard",
    levelId:        data.levelId,
    score:          data.score,
    lettersCorrect: data.lettersCorrect,
    lettersWrong:   data.lettersWrong,
    durationMs:     data.durationMs,
    completed:      data.completed,
    clientHash:     data.clientHash,
    flagged:        false,
  }).returning({ id: scores.id });

  return NextResponse.json({
    saved:            true,
    id:               inserted.id,
    onLeaderboard:    emailVerified,
  });
}
