"use client";

import { useState, useEffect } from "react";

interface Klasse {
  id: string;
  name: string;
  memberCount: number;
}

interface Overview {
  totalPlays: number;
  totalScore: number;
  avgScore: number;
  activeUsers: number;
  avgAccuracy: number;
}

interface GameBreakdown {
  gameType: "keyboard" | "multiplication";
  totalPlays: number;
  totalScore: number;
  avgScore: number;
  avgAccuracy: number;
}

interface LevelBreakdown {
  levelId: number;
  totalPlays: number;
  avgScore: number;
  completionRate: number;
}

interface TopStudent {
  userId: string;
  name: string | null;
  totalScore: number;
  totalPlays: number;
  avgScore: number;
}

interface ActivityChart {
  date: string;
  plays: number;
  uniqueUsers: number;
  totalScore: number;
}

interface StatsResponse {
  klasse: Klasse;
  overview: Overview;
  gameBreakdown: GameBreakdown[];
  levelBreakdown: LevelBreakdown[];
  topStudents: TopStudent[];
  activityChart: ActivityChart[];
}

interface Props {
  klasseId: string;
}

export default function KlasseStats({ klasseId }: Props) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/klasse/${klasseId}/stats?days=${days}`);
        if (!res.ok) throw new Error("Kunne ikke hente statistikker");
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ukendt fejl");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [klasseId, days]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Fejl</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const gameTypeLabels = {
    keyboard: "⌨️ Tastatur Helten",
    multiplication: "✖️ Gange Helten",
  };

  return (
    <div className="space-y-6">
      {/* Tidsperiode vælger */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Klassestatistikker</h2>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={7}>Seneste 7 dage</option>
            <option value={30}>Seneste 30 dage</option>
            <option value={90}>Seneste 90 dage</option>
            <option value={0}>Alle tider</option>
          </select>
        </div>

        {/* Oversigt */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.totalPlays}
            </p>
            <p className="text-xs text-gray-500 mt-1">Spil i alt</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.totalScore.toLocaleString("da-DK")}
            </p>
            <p className="text-xs text-gray-500 mt-1">Point i alt</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {Math.round(stats.overview.avgScore)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Gennemsnit</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.activeUsers}
            </p>
            <p className="text-xs text-gray-500 mt-1">Aktive elever</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.avgAccuracy}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Præcision</p>
          </div>
        </div>
      </div>

      {/* Spil-type fordeling */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">Spil-type fordeling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.gameBreakdown.map((game) => (
            <div key={game.gameType} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{gameTypeLabels[game.gameType]}</h4>
                <span className="text-sm text-gray-500">{game.totalPlays} spil</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total point:</span>
                  <span className="font-semibold">{game.totalScore.toLocaleString("da-DK")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gennemsnit:</span>
                  <span className="font-semibold">{Math.round(game.avgScore)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Præcision:</span>
                  <span className="font-semibold">{game.avgAccuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top elever */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">Top elever</h3>
        {stats.topStudents.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Ingen aktivitet endnu
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">#</th>
                  <th className="pb-3">Elev</th>
                  <th className="pb-3 text-right">Spil</th>
                  <th className="pb-3 text-right">Gns. point</th>
                  <th className="pb-3 text-right">Total point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.topStudents.map((student, index) => (
                  <tr key={student.userId} className="hover:bg-gray-50">
                    <td className="py-3 text-center text-gray-400 font-mono">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td className="py-3 font-medium">{student.name ?? "Anonym"}</td>
                    <td className="py-3 text-right text-gray-500">{student.totalPlays}</td>
                    <td className="py-3 text-right text-gray-500">{Math.round(student.avgScore)}</td>
                    <td className="py-3 text-right font-bold text-brand-700">
                      {student.totalScore.toLocaleString("da-DK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Niveau-statistik */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">Niveau-statistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.levelBreakdown.map((level) => (
            <div key={level.levelId} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Niveau {level.levelId}</span>
                <span className="text-xs text-gray-500">{level.totalPlays} spil</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gns. point:</span>
                  <span className="font-medium">{Math.round(level.avgScore)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuldført:</span>
                  <span className="font-medium">{level.completionRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
