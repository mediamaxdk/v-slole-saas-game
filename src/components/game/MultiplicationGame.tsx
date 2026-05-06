"use client";

import { useEffect, useRef } from "react";
import { initMultiplicationEngine, type MultiLevelCompleteData, type MultiplicationEngineOpts } from "./multiplication-engine";

export type { MultiLevelCompleteData };

interface Props {
  playerName: string;
  onLevelComplete: (data: MultiLevelCompleteData) => void;
  initialStats?: Record<string, unknown>;
  onSaveStats?: (stats: Record<string, unknown>) => void;
}

const GAME_CSS = `
#gh-game *, #gh-game *::before, #gh-game *::after { box-sizing: border-box; }
#gh-game {
  --bg: #0b0e14; --bg2: #11151d; --fg: #e8eef5; --dim: #6b7a90;
  --accent: #61f0c8; --accent2: #ffd166; --danger: #ff5c7a;
  --typed: #61f0c8; --untyped: #e8eef5; --equals: #8aa6c0;

  position: fixed; inset: 0; top: 37px;
  background: #0b0e14;
  background: var(--bg); color: var(--fg);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  overflow: hidden; -webkit-user-select: none; user-select: none;
  display: flex; flex-direction: column;
}
#gh-stage { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; }
#gh-game canvas {
  display: block; width: 100%; height: 100%;
  background: radial-gradient(ellipse at 50% 0%, #15202d 0%, var(--bg) 70%);
}
.gh-hud {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 12px 20px;
  display: flex; justify-content: space-between; align-items: center;
  pointer-events: none; font-size: 14px;
  text-shadow: 0 0 6px rgba(0,0,0,0.8);
}
.gh-hud .group { display: flex; gap: 18px; align-items: center; }
.gh-hud .label { color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
.gh-hud .val { color: var(--fg); font-size: 18px; font-weight: 600; margin-left: 4px; }
.gh-hud .lives { color: var(--danger); letter-spacing: 2px; font-size: 18px; }
.gh-hud .level-name { color: var(--accent2); font-size: 12px; }
.gh-hud .next-life { color: var(--dim); font-size: 11px; }
.gh-pause-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  color: var(--dim); font-size: 11px; letter-spacing: 0.1em; pointer-events: none;
}
.gh-toast {
  position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
  background: rgba(97,240,200,0.12); border: 1px solid var(--accent);
  color: var(--accent); padding: 10px 18px; border-radius: 8px; font-size: 13px;
  pointer-events: none; opacity: 0; transition: opacity 0.4s ease;
  z-index: 30; text-align: center; letter-spacing: 0.04em;
}
.gh-toast.show { opacity: 1; }
#wrong-flash {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 28%, rgba(255,92,122,0.40) 100%);
  opacity: 0; z-index: 5;
}
#wrong-flash.flash { animation: ghWrongFlash 0.30s ease-out; }
@keyframes ghWrongFlash { 0% { opacity: 1; } 100% { opacity: 0; } }
#minus-one {
  position: absolute; top: 48px; right: 28px;
  color: var(--danger); font-weight: 700; font-size: 22px;
  pointer-events: none; opacity: 0;
  text-shadow: 0 0 8px rgba(0,0,0,0.7); z-index: 6;
}
#minus-one.show { animation: ghMinusOne 0.65s ease-out; }
@keyframes ghMinusOne {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-34px); }
}
.gh-overlay {
  position: absolute; inset: 0;
  background: rgba(8,11,16,0.92);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); z-index: 20;
}
.gh-overlay.hidden { display: none; }
.gh-panel {
  background: var(--bg2); border: 1px solid rgba(120,160,200,0.15);
  border-radius: 14px; padding: 32px 36px;
  width: min(560px, 92vw); max-height: 92vh; overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset;
}
.gh-panel h1 { margin: 0 0 6px; font-size: 28px; letter-spacing: 0.04em; color: var(--accent); }
.gh-panel h2 { margin: 0 0 16px; font-size: 14px; color: var(--dim); font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; }
.gh-panel p { color: var(--fg); line-height: 1.5; margin: 12px 0; font-size: 14px; }
.gh-panel small { color: var(--dim); }
.gh-row { display: flex; gap: 10px; margin: 12px 0; }
.gh-btn {
  background: transparent; color: var(--fg);
  border: 1px solid rgba(120,160,200,0.25); border-radius: 8px;
  padding: 12px 18px; font-family: inherit; font-size: 14px;
  cursor: pointer; transition: all 0.12s ease; letter-spacing: 0.04em;
}
.gh-btn:hover { border-color: var(--accent); color: var(--accent); }
.gh-btn.primary { background: var(--accent); color: #0b1218; border-color: var(--accent); font-weight: 600; }
.gh-btn.primary:hover { background: #7af2d4; color: #0b1218; }
.gh-btn.danger { color: var(--danger); border-color: rgba(255,92,122,0.4); }
.gh-btn.danger:hover { background: var(--danger); color: #fff; }
.gh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.gh-levels {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px; margin: 14px 0 6px;
}
#gh-game .lvl {
  background: #0d1219; border: 1px solid rgba(120,160,200,0.12);
  border-radius: 8px; padding: 10px 6px; text-align: center;
  cursor: pointer; transition: all 0.12s;
}
#gh-game .lvl:hover { border-color: var(--accent); }
#gh-game .lvl.locked { opacity: 0.35; cursor: not-allowed; }
#gh-game .lvl.locked:hover { border-color: rgba(120,160,200,0.12); }
#gh-game .lvl.mix .num { color: var(--accent); }
#gh-game .lvl .num { font-size: 22px; color: var(--accent2); font-weight: 600; }
#gh-game .lvl .lbl { font-size: 10px; color: var(--dim); margin-top: 4px; letter-spacing: 0.04em; }
.gh-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin: 12px 0; }
.stat-row {
  display: flex; justify-content: space-between;
  padding: 6px 0; border-bottom: 1px dashed rgba(120,160,200,0.1); font-size: 13px;
}
.stat-row .k { color: var(--dim); }
.stat-row .v { color: var(--fg); font-weight: 600; }
/* MIX grid */
.gh-mix-grid {
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px; margin: 14px 0;
}
.mix-cell {
  background: #0d1219; border: 2px solid rgba(120,160,200,0.18);
  border-radius: 10px; padding: 14px 4px 12px; text-align: center;
  cursor: pointer; transition: all 0.12s; font-size: 16px; font-weight: 700;
  color: var(--dim); user-select: none;
}
.mix-cell:hover { border-color: rgba(97,240,200,0.4); }
.mix-cell .check { display: block; font-size: 11px; font-weight: 400; color: var(--dim); margin-top: 4px; letter-spacing: 0.04em; }
.mix-cell.active { background: rgba(97,240,200,0.10); border-color: var(--accent); color: var(--accent); }
.mix-cell.active .check { color: var(--accent); }
.mix-summary { color: var(--dim); font-size: 12px; margin: 8px 0; letter-spacing: 0.04em; }
.mix-summary.warn { color: var(--danger); }
@media (max-width: 480px) {
  .gh-hud { padding: 8px 12px; font-size: 12px; }
  .gh-hud .val { font-size: 15px; }
  .gh-panel { padding: 24px 20px; }
  .gh-panel h1 { font-size: 22px; }
  .gh-mix-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`;

export function MultiplicationGame({ playerName, onLevelComplete, initialStats, onSaveStats }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const engineOpts: MultiplicationEngineOpts = { initialStats, onSaveStats };
    const cleanup = initMultiplicationEngine(containerRef.current, playerName, onLevelComplete, engineOpts);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GAME_CSS }} />

      <div id="gh-game" ref={containerRef}>
        <div id="gh-stage">
          <canvas id="canvas" />

          <div className="gh-hud" id="hud">
            <div className="group">
              <div><span className="label">Spiller</span><span className="val" id="hud-name">—</span></div>
              <div><span className="label">Niveau</span><span className="val" id="hud-level">1</span> <span className="level-name" id="hud-level-name">1-tabellen</span></div>
            </div>
            <div className="group">
              <div><span className="label">Point</span><span className="val" id="hud-score">0</span></div>
              <div className="next-life" id="hud-nextlife"></div>
              <div><span className="label">Liv</span><span className="lives" id="hud-lives">♥♥♥♥♥</span></div>
            </div>
          </div>

          <div className="gh-pause-hint">ESC pause · TAB stats</div>
          <div className="gh-toast" id="toast" />
          <div id="wrong-flash" />
          <div id="minus-one">−1</div>
        </div>

        {/* Menu */}
        <div className="gh-overlay" id="screen-menu">
          <div className="gh-panel">
            <h1 id="menu-greeting">Hej!</h1>
            <h2>Vælg tabel</h2>
            <div className="gh-levels" id="level-grid" />
            <p><small id="menu-hint">Du kan kun starte på niveauer du har låst op.</small></p>
            <div className="gh-row" style={{ marginTop: 18, flexWrap: "wrap" }}>
              <button className="gh-btn primary" id="btn-menu-play">Spil videre</button>
              <button className="gh-btn" id="btn-menu-stats">Mine stats</button>
              <button className="gh-btn" id="btn-menu-name" style={{ display: "none" }}>Skift navn</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="gh-overlay hidden" id="screen-stats">
          <div className="gh-panel">
            <h1>Stats</h1>
            <h2 id="stats-name">—</h2>
            <div className="gh-stats-grid" id="stats-overall" />
            <h2 style={{ marginTop: 24 }}>Pr. niveau</h2>
            <div id="stats-perlevel" />
            <div className="gh-row" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="gh-btn danger" id="btn-stats-reset">Nulstil stats</button>
              <button className="gh-btn primary" id="btn-stats-back">Tilbage</button>
            </div>
          </div>
        </div>

        {/* Pause */}
        <div className="gh-overlay hidden" id="screen-pause">
          <div className="gh-panel">
            <h1>Pause</h1>
            <p>Tryk ESC eller fortsæt.</p>
            <div className="gh-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="gh-btn" id="btn-pause-quit">Til menuen</button>
              <button className="gh-btn primary" id="btn-pause-resume">Fortsæt</button>
            </div>
          </div>
        </div>

        {/* Level complete */}
        <div className="gh-overlay hidden" id="screen-levelup">
          <div className="gh-panel">
            <h1>Godt klaret!</h1>
            <h2 id="levelup-text">Niveau gennemført</h2>
            <p id="levelup-summary" />
            <div className="gh-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="gh-btn" id="btn-levelup-menu">Til menuen</button>
              <button className="gh-btn primary" id="btn-levelup-next">Næste niveau →</button>
            </div>
          </div>
        </div>

        {/* Game over */}
        <div className="gh-overlay hidden" id="screen-gameover">
          <div className="gh-panel">
            <h1>Game over</h1>
            <h2 id="gameover-text">Du løb tør for liv</h2>
            <p id="gameover-summary" />
            <div className="gh-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="gh-btn" id="btn-gameover-menu">Til menuen</button>
              <button className="gh-btn primary" id="btn-gameover-retry">Prøv igen</button>
            </div>
          </div>
        </div>

        {/* MIX opsætning */}
        <div className="gh-overlay hidden" id="screen-mix">
          <div className="gh-panel" style={{ width: "min(600px, 96vw)" }}>
            <h1>MIX-tilstand</h1>
            <h2>Vælg hvilke tabeller der indgår</h2>
            <div className="gh-mix-grid" id="mix-grid" />
            <p className="mix-summary" id="mix-summary">12 tabeller valgt</p>
            <div className="gh-row" style={{ justifyContent: "space-between", marginTop: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gh-btn" id="btn-mix-all-on">Alle til</button>
                <button className="gh-btn" id="btn-mix-all-off">Alle fra</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gh-btn" id="btn-mix-cancel">Tilbage</button>
                <button className="gh-btn primary" id="btn-mix-start">Start</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
