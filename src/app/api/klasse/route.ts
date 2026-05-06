import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";
import { genererUnikKode } from "@/lib/klasse";

// GET /api/klasse — lærerens egne klasser
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRow?.role !== "teacher" && userRow?.role !== "admin") {
    return NextResponse.json({ error: "Kun lærere kan se klasser" }, { status: 403 });
  }

  const klasser = await db
    .select({
      id:        groups.id,
      name:      groups.name,
      code:      groups.code,
      archived:  groups.archived,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(eq(groups.teacherId, session.user.id))
    .orderBy(desc(groups.createdAt));

  // Tilføj antal elever pr. klasse
  const result = await Promise.all(
    klasser.map(async (k: { id: string; name: string; code: string }) => {
      const members = await db
        .select({ count: groupMembers.userId })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, k.id));
      return { ...k, memberCount: members.length };
    })
  );

  return NextResponse.json({ klasser: result });
}

// POST /api/klasse — opret ny klasse
const OpretSchema = z.object({
  name: z.string().min(2).max(60).trim(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRow?.role !== "teacher" && userRow?.role !== "admin") {
    return NextResponse.json({ error: "Kun lærere kan oprette klasser" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = OpretSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldigt klassenavn" }, { status: 422 });
  }

  const kode = await genererUnikKode();

  const [klasse] = await db
    .insert(groups)
    .values({
      name:      parsed.data.name,
      code:      kode,
      teacherId: session.user.id,
    })
    .returning({ id: groups.id, name: groups.name, code: groups.code });

  return NextResponse.json({ klasse }, { status: 201 });
}
