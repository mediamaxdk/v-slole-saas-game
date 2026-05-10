"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import KeyboardGame, { type LevelCompleteData as KeyboardData } from "@/components/game/KeyboardGame";
import { MultiplicationGame, type MultiLevelCompleteData as MultiData } from "@/components/game/MultiplicationGame";

type GameType = "keyboard" | "multiplication";
type LevelData = KeyboardData | MultiData;

// Gæstenavn til anonyme spillere — stabilt inden for sessionen
const GUEST_NAME = "Gæst";

export default function SpilClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session } = useSession();

  const gameParam = searchParams.get("game");
  const [game, setGame] = useState<GameType>(gameParam === "gange" ? "multiplication" : "keyboard");
  const [toast, setToast] = useState<string | React.ReactNode | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stats hentet fra Neon (kun for indloggede) — null = ikke hentet endnu
  const [kbStats,  setKbStats]  = useState<Record<string, unknown> | null | undefined>(undefined);
  const [mulStats, setMulStats] = useState<Record<string, unknown> | null | undefined>(undefined);

  const playerName = session?.user?.name ?? session?.user?.email ?? GUEST_NAME;
  const isLoggedIn = !!session?.user?.id;

  // Sæt body-baggrund mørk mens spil-siden er aktiv, så der ikke vises hvidt bag spillet
  useEffect(() => {
    const prevBg  = document.body.style.background;
    const prevOvf = document.body.style.overflow;
    document.body.style.background = '#0b0e14';
    document.body.style.overflow   = 'hidden';
    return () => {
      document.body.style.background = prevBg;
      document.body.style.overflow   = prevOvf;
    };
  }, []);

  // Hent stats fra Neon når brugeren er logget ind
  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchStats(gameType: GameType) {
      try {
        const res = await fetch(`/api/stats?game=${gameType}`);
        if (!res.ok) return null;
        const { stats } = await res.json();
        return stats ?? null;
      } catch {
        return null;
      }
    }

    fetchStats("keyboard").then(setKbStats);
    fetchStats("multiplication").then(setMulStats);
  }, [isLoggedIn]);

  // Gem stats til Neon — kaldt fra game-engine via onSaveStats-callback
  const handleSaveStats = useCallback(
    (gameType: GameType) =>
      async (stats: Record<string, unknown>) => {
        if (!isLoggedIn) return;
        try {
          await fetch("/api/stats", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType, stats }),
          });
        } catch {
          console.warn("Stats sync til Neon fejlede");
        }
      },
    [isLoggedIn]
  );

  const showToast = useCallback((msg: string | React.ReactNode) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const handleLevelComplete = useCallback(async (data: LevelData) => {
    try {
      const res = await fetch("/api/score", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType:       data.gameType,
          levelId:        data.levelId,
          score:          data.score,
          lettersCorrect: data.lettersCorrect,
          lettersWrong:   data.lettersWrong,
          durationMs:     data.durationMs,
          completed:      data.completed,
        }),
      });

      const json = await res.json();

      if (json.saved) {
        if (json.onLeaderboard) {
          showToast(`✅ Score gemt — niveau ${data.levelId}: ${data.score} point`);
        } else if (session?.user && !session.user.emailVerified) {
          showToast(
            <div className="flex items-center gap-2">
              <span>Score gemt! Bekræft din email for at komme på leaderboardet.</span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/auth/resend-verification", {
                      method: "POST",
                    });
                    if (res.ok) {
                      showToast("📧 Verifikationsmail sendt! Tjek din indbakke.");
                    } else {
                      const errorData = await res.json().catch(() => ({}));
                      const errorMsg = errorData.details || errorData.error || "Ukendt fejl";
                      showToast(`❌ Fejl: ${errorMsg}`);
                    }
                  } catch (error) {
                    showToast(`❌ Fejl: ${error instanceof Error ? error.message : "Netværksfejl"}`);
                  }
                }}
                className="bg-white text-brand-600 px-2 py-1 rounded text-sm font-medium hover:bg-brand-50 transition-colors"
              >
                Gensend
              </button>
            </div>
          );
        }
      }
    } catch {
      console.warn("Score submission fejlede");
    }
  }, [session, showToast]);

  // Vent til stats er hentet (undefined = afventer) for indloggede brugere,
  // så game-engine aldrig starter med forældet localStorage
  const statsReady = !isLoggedIn || (kbStats !== undefined && mulStats !== undefined);

  return (
    <>
      {/* Mini-nav øverst — vises oven på spillet */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-2 bg-[#11151d]/90 border-b border-white/5"
        style={{ backdropFilter: "blur(6px)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-[#6b7a90] hover:text-[#e8eef5] text-sm transition-colors"
        >
          ← Hjem
        </button>

        {/* Spil-skifter */}
        <div className="flex gap-1">
          {(["keyboard", "multiplication"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                game === g
                  ? "bg-[#61f0c8] text-[#0b1218]"
                  : "text-[#6b7a90] hover:text-[#e8eef5]"
              }`}
            >
              {g === "keyboard" ? "⌨️ Tastatur" : "✖️ Gange"}
            </button>
          ))}
        </div>

        {/* Bruger-info */}
        {!session?.user ? (
          <button
            onClick={() => router.push("/login")}
            className="text-[#61f0c8] text-xs hover:underline"
          >
            Log ind for leaderboard →
          </button>
        ) : (
          <span className="text-[#6b7a90] text-xs">
            {session.user.name ?? session.user.email}
          </span>
        )}
      </div>

      {/* Spil — fylder hele skærmen under nav */}
      {statsReady && (
        game === "keyboard" ? (
          <KeyboardGame
            key="keyboard"
            playerName={playerName}
            onLevelComplete={handleLevelComplete as (data: KeyboardData) => void}
            initialStats={kbStats ?? undefined}
            onSaveStats={isLoggedIn ? handleSaveStats("keyboard") : undefined}
          />
        ) : (
          <MultiplicationGame
            key="multiplication"
            playerName={playerName}
            onLevelComplete={handleLevelComplete as (data: MultiData) => void}
            initialStats={mulStats ?? undefined}
            onSaveStats={isLoggedIn ? handleSaveStats("multiplication") : undefined}
          />
        )
      )}

      {/* Toast-notifikation fra score-submission */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#61f0c8] text-[#0b1218] px-5 py-3 rounded-xl text-sm font-semibold shadow-xl z-[200] animate-fade-in pointer-events-none">
          {toast}
        </div>
      )}
    </>
  );
}
