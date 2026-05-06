import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups } from "@/db";
import { genererUnikKode } from "@/lib/klasse";

// PATCH /api/klasse/[id]/kode — regenerér klassekode
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const { id } = await params;

  const [klasse] = await db
    .select({ id: groups.id })
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

  const nyKode = await genererUnikKode();

  await db
    .update(groups)
    .set({ code: nyKode, updatedAt: new Date() })
    .where(eq(groups.id, id));

  return NextResponse.json({ code: nyKode });
}
