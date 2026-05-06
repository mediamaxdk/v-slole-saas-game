import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";

const TilmeldSchema = z.object({
  kode: z.string().min(1).max(20).trim().toUpperCase(),
});

// GET /api/tilmeld?kode=XXX — forhåndsvis klasse (uden at tilmelde)
export async function GET(req: NextRequest) {
  const kode = req.nextUrl.searchParams.get("kode")?.toUpperCase();
  if (!kode) {
    return NextResponse.json({ error: "Mangler kode" }, { status: 400 });
  }

  const [klasse] = await db
    .select({ id: groups.id, name: groups.name, archived: groups.archived })
    .from(groups)
    .where(eq(groups.code, kode))
    .limit(1);

  if (!klasse || klasse.archived) {
    return NextResponse.json({ error: "Ugyldig eller udløbet kode" }, { status: 404 });
  }

  return NextResponse.json({ klasse: { id: klasse.id, name: klasse.name } });
}

// POST /api/tilmeld  { kode: "XXXXXX" } — tilmeld indlogget bruger til klasse
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = TilmeldSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig kode" }, { status: 422 });
  }

  const [klasse] = await db
    .select({ id: groups.id, name: groups.name, archived: groups.archived })
    .from(groups)
    .where(eq(groups.code, parsed.data.kode))
    .limit(1);

  if (!klasse || klasse.archived) {
    return NextResponse.json({ error: "Ugyldig eller udløbet kode" }, { status: 404 });
  }

  // Tjek om allerede tilmeldt
  const [existing] = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, klasse.id),
        eq(groupMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ ok: true, klasseName: klasse.name, alreadyMember: true });
  }

  // Tilmeld og opgrader rolle til student hvis nødvendigt
  await db.insert(groupMembers).values({
    groupId:  klasse.id,
    userId:   session.user.id,
    joinedAt: new Date(),
  });

  // Opgrader rolle fra public → student
  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRow?.role === "public") {
    await db
      .update(users)
      .set({ role: "student", updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
  }

  return NextResponse.json({ ok: true, klasseName: klasse.name, alreadyMember: false });
}
