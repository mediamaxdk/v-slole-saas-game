"use client";

import { useState, useEffect } from "react";

interface Overview {
  totalPlays: number;
  totalScore: number;
  avgScore: number;
  avgAccuracy: number;
  avgGameDurationMinutes: number;
  totalCompletedLevels: number;
}

interface GameBreakdown {
  gameType: "keyboard" | "multiplication";
  totalPlays: number;
  totalScore: number;
  avgScore: number;
  avgAccuracy: number;
  avgDuration: number;
  completedLevels: number;
  highestLevel: number;
}

interface LevelBreakdown {
  gameType: "keyboard" | "multiplication";
  levelId: number;
  totalPlays: number;
  bestScore: number;
  avgScore: number;
  completionRate: number;
  lastPlayed: string;
}

interface RecentGame {
  gameType: "keyboard" | "multiplication";
  levelId: number;
  score: number;
  lettersCorrect: number;
  lettersWrong: number;
  durationMs: number;
  completed: boolean;
  playedAt: string;
}

interface ActivityChart {
  date: string;
  plays: number;
  totalScore: number;
  avgScore: number;
  totalDuration: number;
}

interface StatsResponse {
  overview: Overview;
  gameBreakdown: GameBreakdown[];
  levelBreakdown: LevelBreakdown[];
  recentGames: RecentGame[];
  activityChart: ActivityChart[];
  detailedStats: {
    keyboard: any;
    multiplication: any;
  };
}

export default function PersonalStats() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/stats/me?days=${days}`);
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
  }, [days]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
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

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tidsperiode vælger */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Mine statistikker</h2>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              {stats.overview.avgAccuracy}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Præcision</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.avgGameDurationMinutes}m
            </p>
            <p className="text-xs text-gray-500 mt-1">Gns. varighed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-700">
              {stats.overview.totalCompletedLevels}
            </p>
            <p className="text-xs text-gray-500 mt-1">Fuldførte niveauer</p>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Højeste niveau:</span>
                  <span className="font-semibold">Niveau {game.highestLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuldførte:</span>
                  <span className="font-semibold">{game.completedLevels}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seneste spil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">Seneste spil</h3>
        {stats.recentGames.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Du har ikke spillet endnu
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Spil</th>
                  <th className="pb-3">Niveau</th>
                  <th className="pb-3 text-right">Point</th>
                  <th className="pb-3 text-right">Præcision</th>
                  <th className="pb-3 text-right">Varighed</th>
                  <th className="pb-3 text-right">Tidspunkt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentGames.map((game, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-medium">
                        {gameTypeLabels[game.gameType]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-600">Niveau {game.levelId}</span>
                      {game.completed && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-bold text-brand-700">
                      {game.score.toLocaleString("da-DK")}
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {game.lettersCorrect + game.lettersWrong > 0
                        ? Math.round((game.lettersCorrect / (game.lettersCorrect + game.lettersWrong)) * 100)
                        : 0}%
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {formatDuration(game.durationMs)}
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {new Date(game.playedAt).toLocaleString("da-DK", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Aktivitet over tid */}
      {stats.activityChart.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg mb-4">Aktivitet over tid</h3>
          <div className="space-y-2">
            {stats.activityChart.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">
                  {formatDate(day.date)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className="bg-brand-600 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((day.plays / Math.max(...stats.activityChart.map(d => d.plays))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {day.plays}
                </div>
                <div className="text-sm text-gray-500 w-20 text-right">
                  {day.totalScore.toLocaleString("da-DK")}p
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
