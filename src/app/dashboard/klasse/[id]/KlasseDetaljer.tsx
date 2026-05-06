"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Member {
  userId: string;
  name: string | null;
  email: string;
  joinedAt: Date;
}

interface Klasse {
  id: string;
  name: string;
  code: string;
  archived: boolean;
}

interface LeaderboardEntry {
  userId: string;
  name: string | null;
  totalScore: number;
  gamesPlayed: number;
}

interface Props {
  klasse: Klasse;
  members: Member[];
}

const POLL_INTERVAL = 30_000;

export default function KlasseDetaljer({ klasse, members: initialMembers }: Props) {
  const [code, setCode]           = useState(klasse.code);
  const [members, setMembers]     = useState(initialMembers);
  const [kopieret, setKopieret]   = useState(false);
  const [regenererer, setRegen]   = useState(false);
  const [fjerner, setFjerner]     = useState<string | null>(null);

  // Leaderboard state
  const [lbGame, setLbGame]     = useState<"keyboard" | "multiplication">("keyboard");
  const [lbPeriod, setLbPeriod] = useState<"30d" | "all">("30d");
  const [lbRows, setLbRows]     = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    const params = new URLSearchParams({ game: lbGame, period: lbPeriod });
    const res = await fetch(`/api/leaderboard/klasse/${klasse.id}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLbRows(data.leaderboard ?? []);
    }
    setLbLoading(false);
  }, [klasse.id, lbGame, lbPeriod]);

  useEffect(() => {
    setLbLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchLeaderboard]);

  useEffect(() => {
    const onFocus = () => fetchLeaderboard();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [fetchLeaderboard]);

  // Kopiér tilmeldingslink
  function kopierLink() {
    const url = `${window.location.origin}/tilmeld?kode=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setKopieret(true);
      setTimeout(() => setKopieret(false), 2000);
    });
  }

  // Regenerér klassekode
  async function regenererKode() {
    if (!confirm("Er du sikker? Den gamle kode vil holde op med at virke.")) return;
    setRegen(true);
    const res = await fetch(`/api/klasse/${klasse.id}/kode`, { method: "PATCH" });
    const json = await res.json();
    setRegen(false);
    if (res.ok) setCode(json.code);
  }

  // Fjern elev
  async function fjernElev(userId: string, navn: string) {
    if (!confirm(`Fjern ${navn || "eleven"} fra klassen?`)) return;
    setFjerner(userId);
    const res = await fetch(`/api/klasse/${klasse.id}/elev/${userId}`, { method: "DELETE" });
    setFjerner(null);
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    }
  }

  const medalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <>
      {/* Overskrift + kode-panel */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">{klasse.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {members.length} elev{members.length !== 1 ? "er" : ""}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center min-w-[180px]">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Klassekode</p>
          <p className="font-mono text-3xl font-black text-brand-700 tracking-widest mb-3">
            {code}
          </p>
          <div className="flex gap-2">
            <button
              onClick={kopierLink}
              className="flex-1 text-xs bg-brand-50 text-brand-700 font-semibold py-2 rounded-lg hover:bg-brand-100 transition-colors"
            >
              {kopieret ? "✓ Kopieret" : "Kopiér link"}
            </button>
            <button
              onClick={regenererKode}
              disabled={regenererer}
              className="flex-1 text-xs bg-gray-50 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Generér ny kode (den gamle invalideres)"
            >
              {regenererer ? "…" : "Ny kode"}
            </button>
          </div>
        </div>
      </div>

      {/* Tilmeldingslink visning */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
        <span className="text-2xl">🔗</span>
        <div>
          <p className="text-sm font-semibold text-brand-800">Del dette link med dine elever</p>
          <p className="text-xs text-brand-600 font-mono mt-0.5 break-all">
            {typeof window !== "undefined" ? window.location.origin : ""}/tilmeld?kode={code}
          </p>
        </div>
        <button
          onClick={kopierLink}
          className="ml-auto shrink-0 text-xs bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
        >
          {kopieret ? "✓" : "Kopiér"}
        </button>
      </div>

      {/* Elevliste */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">Elever</h2>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            Ingen elever endnu. Del koden ovenfor så de kan tilmelde sig.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {members.map((m) => (
              <li key={m.userId} className="flex items-center justify-between px-6 py-4 group">
                <div>
                  <p className="font-medium text-sm">{m.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Tilmeldt {new Date(m.joinedAt).toLocaleDateString("da-DK")}
                  </span>
                  <button
                    onClick={() => fjernElev(m.userId, m.name ?? m.email)}
                    disabled={fjerner === m.userId}
                    className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    Fjern
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Klassens leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-lg">Klassens leaderboard</h2>
          <div className="flex gap-2">
            {/* Game toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setLbGame("keyboard")}
                className={`px-3 py-1.5 transition-colors ${lbGame === "keyboard" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                ⌨️
              </button>
              <button
                onClick={() => setLbGame("multiplication")}
                className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${lbGame === "multiplication" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                ✖️
              </button>
            </div>
            {/* Period toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setLbPeriod("30d")}
                className={`px-3 py-1.5 transition-colors ${lbPeriod === "30d" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                30 dage
              </button>
              <button
                onClick={() => setLbPeriod("all")}
                className={`px-3 py-1.5 border-l border-gray-200 transition-colors ${lbPeriod === "all" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                Alle tider
              </button>
            </div>
          </div>
        </div>

        {lbLoading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Henter…</div>
        ) : lbRows.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            Ingen scores endnu — lad eleverne spille!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">Elev</th>
                <th className="px-6 py-3 text-right">Spil</th>
                <th className="px-6 py-3 text-right">Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lbRows.map((row, i) => {
                const rank = i + 1;
                const medal = medalEmoji(rank);
                return (
                  <tr key={row.userId} className={rank <= 3 ? "bg-yellow-50/40" : "hover:bg-gray-50"}>
                    <td className="px-6 py-3 text-center text-gray-400 font-mono">{medal ?? rank}</td>
                    <td className="px-6 py-3 font-semibold text-gray-800">{row.name ?? "Anonym"}</td>
                    <td className="px-6 py-3 text-right text-gray-500">{row.gamesPlayed}</td>
                    <td className="px-6 py-3 text-right font-bold text-brand-700">
                      {row.totalScore.toLocaleString("da-DK")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
