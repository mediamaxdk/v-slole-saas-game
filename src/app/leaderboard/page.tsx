"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type LeaderboardEntry = {
  userId: string;
  name: string | null;
  totalScore: number;
  gamesPlayed: number;
};

const POLL_INTERVAL = 30_000;

const LEVELS = [
  { label: "Alle niveauer", value: "" },
  ...Array.from({ length: 10 }, (_, i) => ({ label: `Niveau ${i + 1}`, value: String(i + 1) })),
];

export default function LeaderboardPage() {
  const [game, setGame]     = useState<"keyboard" | "multiplication">("keyboard");
  const [period, setPeriod] = useState<"30d" | "all">("30d");
  const [level, setLevel]   = useState("");
  const [rows, setRows]     = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    const params = new URLSearchParams({ game, period });
    if (level) params.set("level", level);

    const res = await fetch(`/api/leaderboard?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.leaderboard ?? []);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [game, period, level]);

  // Fetch on param change
  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Polling every 30s
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLeaderboard]);

  // Refresh on page focus
  useEffect(() => {
    const onFocus = () => fetchLeaderboard();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [fetchLeaderboard]);

  const medalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black">Leaderboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kun email-verificerede spillere vises.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
          {/* Game toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-semibold">
            <button
              onClick={() => setGame("keyboard")}
              className={`px-4 py-2 transition-colors ${
                game === "keyboard"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ⌨️ Tastatur
            </button>
            <button
              onClick={() => setGame("multiplication")}
              className={`px-4 py-2 border-l border-gray-200 transition-colors ${
                game === "multiplication"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ✖️ Gange
            </button>
          </div>

          {/* Period toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-semibold">
            <button
              onClick={() => setPeriod("30d")}
              className={`px-4 py-2 transition-colors ${
                period === "30d"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Seneste 30 dage
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-4 py-2 border-l border-gray-200 transition-colors ${
                period === "all"
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Alle tider
            </button>
          </div>

          {/* Level filter */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Henter data…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-gray-500 text-sm">Ingen resultater endnu. Vær den første!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3 w-12">#</th>
                  <th className="px-6 py-3">Spiller</th>
                  <th className="px-6 py-3 text-right">Spil</th>
                  <th className="px-6 py-3 text-right">Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const rank = i + 1;
                  const medal = medalEmoji(rank);
                  return (
                    <tr
                      key={row.userId}
                      className={`transition-colors ${rank <= 3 ? "bg-yellow-50/30" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 font-mono text-gray-400 text-center">
                        {medal ?? rank}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {row.name ?? "Anonym"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {row.gamesPlayed}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-700">
                        {row.totalScore.toLocaleString("da-DK")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-400 text-right mt-3">
            Opdateret {lastUpdated.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · opdateres hvert 30. sekund
          </p>
        )}
      </div>
    </main>
  );
}
