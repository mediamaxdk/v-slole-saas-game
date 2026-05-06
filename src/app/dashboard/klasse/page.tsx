import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";

export default async function KlasseListePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (userRow?.role !== "teacher" && userRow?.role !== "admin") {
    redirect("/dashboard");
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
    .orderBy(groups.createdAt);

  const klasserMedAntal = await Promise.all(
    klasser.map(async (k: { id: string; name: string; code: string }) => {
      const members = await db
        .select({ count: groupMembers.userId })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, k.id));
      return { ...k, memberCount: members.length };
    })
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-black">Mine klasser</h1>
          </div>
          <Link
            href="/dashboard/klasse/ny"
            className="bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
          >
            + Ny klasse
          </Link>
        </div>

        {klasserMedAntal.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🏫</div>
            <h2 className="font-bold text-lg mb-2">Du har ingen klasser endnu</h2>
            <p className="text-gray-500 text-sm mb-6">
              Opret en klasse og del koden med dine elever.
            </p>
            <Link
              href="/dashboard/klasse/ny"
              className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Opret din første klasse
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {klasserMedAntal.map((k: { id: string; name: string; code: string; archived: boolean; createdAt: Date; memberCount: number }) => (
              <Link
                key={k.id}
                href={`/dashboard/klasse/${k.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-brand-200 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg group-hover:text-brand-700 transition-colors">
                      {k.name}
                      {k.archived && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Arkiveret
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {k.memberCount} elev{k.memberCount !== 1 ? "er" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Klassekode</p>
                    <p className="font-mono text-xl font-bold text-brand-700 tracking-widest">
                      {k.code}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
