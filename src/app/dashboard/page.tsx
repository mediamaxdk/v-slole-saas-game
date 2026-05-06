import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, groups, groupMembers, users } from "@/db";
import PersonalStats from "@/components/PersonalStats";
import ResendVerificationButton from "@/components/ResendVerificationButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const user = session.user;

  // Hent fuldt brugerobjekt inkl. rolle
  const [userRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const rolle = userRow?.role ?? "public";
  const erLærer = rolle === "teacher" || rolle === "admin";

  // Hent klasser baseret på rolle
  let lærerKlasser: { id: string; name: string; code: string; memberCount: number }[] = [];
  let elevKlasser:  { id: string; name: string; teacherName: string | null }[] = [];

  if (erLærer) {
    const klasser = await db
      .select({ id: groups.id, name: groups.name, code: groups.code })
      .from(groups)
      .where(eq(groups.teacherId, user.id))
      .orderBy(groups.createdAt);

    lærerKlasser = await Promise.all(
      klasser.map(async (k: { id: string; name: string; code: string }) => {
        const members = await db
          .select({ count: groupMembers.userId })
          .from(groupMembers)
          .where(eq(groupMembers.groupId, k.id));
        return { ...k, memberCount: members.length };
      })
    );
  } else {
    // Elev/public — find tilmeldte klasser
    const tilmeldte = await db
      .select({
        id:          groups.id,
        name:        groups.name,
        teacherName: users.name,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .innerJoin(users, eq(groups.teacherId, users.id))
      .where(eq(groupMembers.userId, user.id))
      .orderBy(groupMembers.joinedAt);

    elevKlasser = tilmeldte;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Velkomst */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">
            Hej, {user.name ?? user.email} 👋
          </h1>
          {!user.emailVerified && (
            <div className="inline-flex items-center gap-2">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                ⚠️ Bekræft din email for at komme på leaderboardet
              </span>
              <ResendVerificationButton />
            </div>
          )}
        </div>

        {/* Spil-kort */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/spil"
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-brand-200 transition-colors group"
          >
            <div className="text-3xl mb-3">⌨️</div>
            <h2 className="font-bold text-lg group-hover:text-brand-700">Tastatur Helten</h2>
            <p className="text-gray-500 text-sm mt-1">Øv bogstaver og tegnsætning</p>
          </Link>

          <Link
            href="/spil?game=gange"
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-brand-200 transition-colors group"
          >
            <div className="text-3xl mb-3">✖️</div>
            <h2 className="font-bold text-lg group-hover:text-brand-700">Gange Helten</h2>
            <p className="text-gray-500 text-sm mt-1">Øv gangetabeller 1-12</p>
          </Link>
        </div>

        {/* Lærer — klasse-panel */}
        {erLærer && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">Mine klasser</h2>
              <Link
                href="/dashboard/klasse/ny"
                className="text-sm text-brand-600 font-semibold hover:underline"
              >
                + Ny klasse
              </Link>
            </div>

            {lærerKlasser.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400 text-sm mb-4">Du har ingen klasser endnu.</p>
                <Link
                  href="/dashboard/klasse/ny"
                  className="inline-block bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Opret din første klasse
                </Link>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-50">
                  {lærerKlasser.slice(0, 5).map((k) => (
                    <li key={k.id}>
                      <Link
                        href={`/dashboard/klasse/${k.id}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{k.name}</p>
                          <p className="text-xs text-gray-400">{k.memberCount} elev{k.memberCount !== 1 ? "er" : ""}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-brand-700 tracking-widest">
                          {k.code}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {lærerKlasser.length > 5 && (
                  <div className="px-6 py-3 border-t border-gray-50">
                    <Link href="/dashboard/klasse" className="text-sm text-brand-600 font-medium hover:underline">
                      Se alle {lærerKlasser.length} klasser →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Elev/public — tilmeldte klasser */}
        {!erLærer && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">Mine klasser</h2>
              <Link href="/tilmeld" className="text-sm text-brand-600 font-semibold hover:underline">
                + Tilmeld med kode
              </Link>
            </div>

            {elevKlasser.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Du er ikke tilmeldt nogen klasse. Spørg din lærer om klassekoden.
                </p>
                <Link
                  href="/tilmeld"
                  className="inline-block bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Tilmeld med kode
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {elevKlasser.map((k) => (
                  <li key={k.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-sm">{k.name}</p>
                      <p className="text-xs text-gray-400">Lærer: {k.teacherName ?? "—"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Leaderboard */}
        <Link
          href="/leaderboard"
          className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-brand-200 transition-colors group mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg group-hover:text-brand-700 transition-colors">🏆 Leaderboard</h2>
              <p className="text-gray-500 text-sm mt-1">Se hvem der har flest point</p>
            </div>
            <span className="text-gray-300 group-hover:text-brand-400 transition-colors text-xl">→</span>
          </div>
        </Link>

        {/* Stats — Fase 5 */}
        <PersonalStats />
      </div>
    </main>
  );
}
