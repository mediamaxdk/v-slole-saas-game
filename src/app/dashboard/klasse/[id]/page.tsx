import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";
import KlasseDetaljer from "./KlasseDetaljer";
import KlasseStats from "@/components/KlasseStats";

export default async function KlasseDetaljePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { id } = await params;

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

  if (!klasse) redirect("/dashboard/klasse");

  const members = await db
    .select({
      userId:   groupMembers.userId,
      name:     users.name,
      email:    users.email,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, id))
    .orderBy(groupMembers.joinedAt);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/dashboard/klasse" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
          ← Mine klasser
        </Link>
        <KlasseDetaljer klasse={klasse} members={members} />
        <div className="mt-8">
          <KlasseStats klasseId={id} />
        </div>
      </div>
    </main>
  );
}
