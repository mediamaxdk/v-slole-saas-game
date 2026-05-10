"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { initKeyboardEngine, type LevelCompleteData, type KeyboardEngineOpts } from "./keyboard-engine";

export type { LevelCompleteData };

interface Props {
  playerName: string;
  onLevelComplete: (data: LevelCompleteData) => void;
  initialStats?: Record<string, unknown>;
  onSaveStats?: (stats: Record<string, unknown>) => void;
}

/* ------------------------------------------------------------------ */
/*  CSS — identisk med tastatur.html <style>-blokken                   */
/* ------------------------------------------------------------------ */
const GAME_CSS = `
#th-game *, #th-game *::before, #th-game *::after { box-sizing: border-box; }
#th-game {
  /* CSS custom properties scoped to the game container */
  --bg: #0b0e14; --bg2: #11151d; --fg: #e8eef5; --dim: #6b7a90;
  --accent: #61f0c8; --accent2: #ffd166; --danger: #ff5c7a;
  --typed: #61f0c8; --untyped: #e8eef5; --grid: rgba(120,160,200,0.06);
  --finger-pinky: #ff5c7a; --finger-ring: #ff9f43; --finger-middle: #ffd166;
  --finger-index: #61f0c8; --finger-thumb: #4cc9f0;

  position: fixed; inset: 0; top: 37px;
  background: #0b0e14;  /* hardcoded fallback so it always shows dark */
  background: var(--bg);
  color: var(--fg);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  overflow: hidden;
  -webkit-user-select: none; user-select: none;
  display: flex; flex-direction: column;
}
#th-stage { position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; }
#th-game canvas {
  display: block; width: 100%; height: 100%;
  background: radial-gradient(ellipse at 50% 0%, #15202d 0%, var(--bg) 70%);
}
#th-keyboard {
  flex: 0 0 auto;
  padding: 8px 10px 10px;
  background: linear-gradient(to bottom, rgba(15,20,28,0) 0%, rgba(15,20,28,0.7) 25%, rgba(15,20,28,0.95) 100%);
  border-top: 1px solid rgba(120,160,200,0.10);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: max-height 0.25s ease, padding 0.25s ease, opacity 0.25s ease;
  position: relative;
}
#keyboard {
  flex: 0 0 auto;
  padding: 8px 10px 10px;
  background: linear-gradient(to bottom, rgba(15,20,28,0) 0%, rgba(15,20,28,0.7) 25%, rgba(15,20,28,0.95) 100%);
  border-top: 1px solid rgba(120,160,200,0.10);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: max-height 0.25s ease, padding 0.25s ease, opacity 0.25s ease;
  position: relative;
}
#keyboard.hidden-kb { max-height: 0; padding: 0; opacity: 0; overflow: hidden; }
#th-kb-rows { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.th-kb-row, .kb-row { display: flex; gap: 4px; }
.th-kb-row.r-spc, .kb-row.r-spc { align-self: center; padding-top: 2px; }
.th-kb-row.r-mid, .kb-row.r-mid { padding-left: clamp(10px, 1.6vw, 22px); }
.th-kb-row.r-bot, .kb-row.r-bot { padding-left: clamp(22px, 3.6vw, 46px); }
#th-game .key {
  --fc: #6b7a90;
  box-sizing: border-box;
  width: clamp(28px, 4.4vw, 50px); height: clamp(28px, 4.4vw, 50px);
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
  font-size: clamp(11px, 1.6vw, 17px); font-weight: 600;
  background: color-mix(in srgb, var(--fc) 14%, var(--bg2));
  color: var(--fc);
  border: 1px solid color-mix(in srgb, var(--fc) 35%, transparent);
  text-transform: uppercase;
  transition: transform 0.08s ease, background 0.15s ease, box-shadow 0.15s ease;
}
#th-game .key.space { width: clamp(160px, 32vw, 320px); font-size: 10px; letter-spacing: 0.3em; }
#th-game .key.f-pinky  { --fc: var(--finger-pinky); }
#th-game .key.f-ring   { --fc: var(--finger-ring); }
#th-game .key.f-middle { --fc: var(--finger-middle); }
#th-game .key.f-index  { --fc: var(--finger-index); }
#th-game .key.f-thumb  { --fc: var(--finger-thumb); }
#th-game .key.active {
  background: var(--fc); color: #0b1218;
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--fc) 60%, transparent), 0 0 0 2px var(--bg);
}
#th-game .key.wrong-key {
  background: var(--danger) !important; color: #fff !important;
  box-shadow: 0 0 14px var(--danger); transform: translateY(-2px) scale(1.06);
}
#th-finger-hint {
  height: 22px; line-height: 22px; font-size: 12px; letter-spacing: 0.06em;
  color: var(--dim); display: flex; align-items: center; gap: 8px; margin-top: 4px;
}
#th-finger-hint .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--dim); box-shadow: 0 0 6px currentColor; }
#th-finger-hint.has-target { color: var(--fg); }
#th-kb-toggle {
  position: absolute; right: 10px; top: 4px;
  background: transparent; border: 1px solid rgba(120,160,200,0.15);
  color: var(--dim); width: 22px; height: 22px; border-radius: 4px;
  cursor: pointer; font-size: 11px; line-height: 18px; padding: 0;
}
#th-kb-toggle:hover { color: var(--accent); border-color: var(--accent); }
.th-hud {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 12px 20px;
  display: flex; justify-content: space-between; align-items: center;
  pointer-events: none; font-size: 14px;
  text-shadow: 0 0 6px rgba(0,0,0,0.8);
}
.th-hud .group { display: flex; gap: 18px; align-items: center; }
.th-hud .label { color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
.th-hud .val { color: var(--fg); font-size: 18px; font-weight: 600; margin-left: 4px; }
.th-hud .lives { color: var(--danger); letter-spacing: 2px; font-size: 18px; }
.th-hud .level-name { color: var(--accent2); font-size: 12px; }
.th-hud .next-life { color: var(--dim); font-size: 11px; }
.th-pause-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  color: var(--dim); font-size: 11px; letter-spacing: 0.1em; pointer-events: none;
}
.th-toast {
  position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
  background: rgba(97,240,200,0.12); border: 1px solid var(--accent);
  color: var(--accent); padding: 10px 18px; border-radius: 8px; font-size: 13px;
  pointer-events: none; opacity: 0; transition: opacity 0.4s ease;
  z-index: 30; text-align: center; letter-spacing: 0.04em;
}
.th-toast.show { opacity: 1; }
#wrong-flash {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 28%, rgba(255,92,122,0.40) 100%);
  opacity: 0; z-index: 5;
}
#wrong-flash.flash { animation: thWrongFlash 0.30s ease-out; }
@keyframes thWrongFlash { 0% { opacity: 1; } 100% { opacity: 0; } }
#minus-one {
  position: absolute; top: 48px; right: 28px;
  color: var(--danger); font-weight: 700; font-size: 22px;
  pointer-events: none; opacity: 0;
  text-shadow: 0 0 8px rgba(0,0,0,0.7); z-index: 6;
}
#minus-one.show { animation: thMinusOne 0.65s ease-out; }
@keyframes thMinusOne {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-34px); }
}
.th-overlay {
  position: absolute; inset: 0;
  background: rgba(8,11,16,0.92);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 20;
}
.th-overlay.hidden { display: none; }
.th-panel {
  background: var(--bg2);
  border: 1px solid rgba(120,160,200,0.15);
  border-radius: 14px; padding: 32px 36px;
  width: min(560px, 92vw); max-height: 92vh; overflow-y: auto;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset;
}
.th-panel h1 { margin: 0 0 6px; font-size: 28px; letter-spacing: 0.04em; color: var(--accent); }
.th-panel h2 { margin: 0 0 16px; font-size: 14px; color: var(--dim); font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; }
.th-panel p { color: var(--fg); line-height: 1.5; margin: 12px 0; font-size: 14px; }
.th-panel small { color: var(--dim); }
.th-row { display: flex; gap: 10px; margin: 12px 0; }
.th-btn {
  background: transparent; color: var(--fg);
  border: 1px solid rgba(120,160,200,0.25); border-radius: 8px;
  padding: 12px 18px; font-family: inherit; font-size: 14px;
  cursor: pointer; transition: all 0.12s ease; letter-spacing: 0.04em;
}
.th-btn:hover { border-color: var(--accent); color: var(--accent); }
.th-btn.primary { background: var(--accent); color: #0b1218; border-color: var(--accent); font-weight: 600; }
.th-btn.primary:hover { background: #7af2d4; color: #0b1218; }
.th-btn.danger { color: var(--danger); border-color: rgba(255,92,122,0.4); }
.th-btn.danger:hover { background: var(--danger); color: #fff; }
.th-levels {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 8px; margin: 14px 0 6px;
}
#th-game .lvl {
  background: #0d1219; border: 1px solid rgba(120,160,200,0.12);
  border-radius: 8px; padding: 10px 6px; text-align: center;
  cursor: pointer; transition: all 0.12s;
}
#th-game .lvl:hover { border-color: var(--accent); }
#th-game .lvl.locked { opacity: 0.35; cursor: not-allowed; }
#th-game .lvl.locked:hover { border-color: rgba(120,160,200,0.12); }
#th-game .lvl .num { font-size: 22px; color: var(--accent2); font-weight: 600; }
#th-game .lvl .lbl { font-size: 10px; color: var(--dim); margin-top: 4px; letter-spacing: 0.04em; }
.th-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin: 12px 0; }
.stat-row {
  display: flex; justify-content: space-between;
  padding: 6px 0; border-bottom: 1px dashed rgba(120,160,200,0.1); font-size: 13px;
}
.stat-row .k { color: var(--dim); }
.stat-row .v { color: var(--fg); font-weight: 600; }
@media (max-width: 480px) {
  .th-hud { padding: 8px 12px; font-size: 12px; }
  .th-hud .val { font-size: 15px; }
  .th-panel { padding: 24px 20px; }
  .th-panel h1 { font-size: 22px; }
}
`;

export default function KeyboardGame({ playerName, onLevelComplete, initialStats, onSaveStats }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [showKeyboard, setShowKeyboard] = useState(true);

  // Handle keyboard toggle button click
  const handleKeyboardToggle = useCallback(() => {
    console.log("HUD keyboard toggle button clicked!");
    const keyboard = document.getElementById('keyboard');
    console.log("Keyboard element found:", keyboard);
    if (keyboard) {
      const wasHidden = keyboard.classList.contains('hidden-kb');
      keyboard.classList.toggle('hidden-kb');
      const isHidden = keyboard.classList.contains('hidden-kb');
      console.log(`Keyboard visibility changed from ${wasHidden} to ${isHidden}`);
      console.log("Keyboard classes after toggle:", keyboard.className);
      // Trigger resize to adjust game area
      window.dispatchEvent(new Event('resize'));
    } else {
      console.error("Keyboard element not found!");
    }
  }, []);

  // Add event listener after component mounts
  useEffect(() => {
    const toggleButton = document.getElementById('hud-keyboard-toggle');
    if (toggleButton) {
      console.log("Adding click listener to HUD keyboard toggle button");
      toggleButton.addEventListener('click', handleKeyboardToggle);
      return () => {
        toggleButton.removeEventListener('click', handleKeyboardToggle);
      };
    } else {
      console.error("HUD keyboard toggle button not found in DOM!");
    }
  }, [handleKeyboardToggle]);

  useEffect(() => {
    if (!containerRef.current) return;
    const engineOpts: KeyboardEngineOpts = { 
      initialStats, 
      onSaveStats, 
      speedMultiplier, 
      showKeyboard 
    };
    const cleanup = initKeyboardEngine(containerRef.current, playerName, onLevelComplete, engineOpts);
    return cleanup;
    // onLevelComplete/initialStats/onSaveStats intentionally excluded — stable refs from parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, speedMultiplier, showKeyboard]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GAME_CSS }} />

      <div id="th-game" ref={containerRef}>
        <div id="th-stage">
          <canvas id="canvas" />

          <div className="th-hud" id="hud">
            <div className="group">
              <div><span className="label">Spiller</span><span className="val" id="hud-name">—</span></div>
              <div><span className="label">Niveau</span><span className="val" id="hud-level">1</span> <span className="level-name" id="hud-level-name">Bogstaver</span></div>
            </div>
            <div className="group">
              <div><span className="label">Point</span><span className="val" id="hud-score">0</span></div>
              <div className="next-life" id="hud-nextlife"></div>
              <div><span className="label">Liv</span><span className="lives" id="hud-lives">♥♥♥♥♥</span></div>
            </div>
            <div className="group">
              <button 
                id="hud-keyboard-toggle"
                className="px-3 py-1 bg-brand-600 text-white text-xs font-medium rounded hover:bg-brand-700 transition-colors"
                title="Skjul/Vis tastatur"
              >
                🎹 Tastatur
              </button>
            </div>
          </div>

          <div className="th-pause-hint">ESC pause · TAB stats · 🎹 Tastatur (skjul/vis)</div>
          <div className="th-toast" id="toast" />
          <div id="wrong-flash" />
          <div id="minus-one">−1</div>
        </div>

        {/* Tastaturguide */}
        <div id="keyboard">
          <button id="kb-toggle" title="Skjul tastatur (Ctrl+K)">▾</button>
          <div id="kb-rows">
            <div className="th-kb-row r-top" id="kb-row-top" />
            <div className="th-kb-row r-mid" id="kb-row-mid" />
            <div className="th-kb-row r-bot" id="kb-row-bot" />
            <div className="th-kb-row r-spc">
              <div className="key f-thumb space" data-k=" ">mellemrum</div>
            </div>
          </div>
          <div id="finger-hint">
            <span className="dot" id="fh-dot" />
            <span id="fh-text">Brug fingrene fra hjemmerækken (asdf jkl)</span>
          </div>
        </div>

        {/* Menu */}
        <div className="th-overlay" id="screen-menu">
          <div className="th-panel">
            <h1 id="menu-greeting">Hej!</h1>
            <h2>Vælg niveau</h2>
            <div className="th-levels" id="level-grid" />
            <p><small id="menu-hint">Du kan kun starte på niveauer du har låst op.</small></p>
            <div className="th-row" style={{ marginTop: 18, flexWrap: "wrap" }}>
              <button className="th-btn primary" id="btn-menu-play">Spil videre</button>
              <button className="th-btn" id="btn-menu-tutorial">Vis tastatur-guide</button>
              <button className="th-btn" id="btn-menu-stats">Mine stats</button>
              <button className="th-btn" id="btn-menu-name" style={{ display: "none" }}>Skift navn</button>
            </div>
            
            {/* Game Settings */}
            <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <h3 style={{ color: "var(--fg)", fontSize: 14, marginBottom: 12 }}>Indstillinger</h3>
              
              {/* Speed Control */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "var(--dim)", fontSize: 12, display: "block", marginBottom: 4 }}>
                  Hastighed: {(speedMultiplier * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  style={{ 
                    width: "100%", 
                    height: 6, 
                    background: "var(--bg2)", 
                    outline: "none",
                    borderRadius: 3
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: "var(--dim)", fontSize: 10 }}>50%</span>
                  <span style={{ color: "var(--dim)", fontSize: 10 }}>100%</span>
                  <span style={{ color: "var(--dim)", fontSize: 10 }}>200%</span>
                </div>
              </div>
              
              {/* Keyboard Toggle */}
              <div>
                <label style={{ color: "var(--dim)", fontSize: 12, display: "block", marginBottom: 8 }}>
                  Vis tastatur
                </label>
                <button
                  className={`th-btn ${showKeyboard ? "primary" : ""}`}
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  style={{ width: "100%" }}
                >
                  {showKeyboard ? "Skjul tastatur" : "Vis tastatur"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="th-overlay hidden" id="screen-stats">
          <div className="th-panel">
            <h1>Stats</h1>
            <h2 id="stats-name">—</h2>
            <div className="th-stats-grid" id="stats-overall" />
            <h2 style={{ marginTop: 24 }}>Pr. niveau</h2>
            <div id="stats-perlevel" />
            <div className="th-row" style={{ justifyContent: "flex-end", marginTop: 20 }}>
              <button className="th-btn danger" id="btn-stats-reset">Nulstil stats</button>
              <button className="th-btn primary" id="btn-stats-back">Tilbage</button>
            </div>
          </div>
        </div>

        {/* Pause */}
        <div className="th-overlay hidden" id="screen-pause">
          <div className="th-panel">
            <h1>Pause</h1>
            <p>Tryk ESC eller fortsæt.</p>
            <div className="th-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="th-btn" id="btn-pause-quit">Til menuen</button>
              <button className="th-btn primary" id="btn-pause-resume">Fortsæt</button>
            </div>
          </div>
        </div>

        {/* Level complete */}
        <div className="th-overlay hidden" id="screen-levelup">
          <div className="th-panel">
            <h1>Godt klaret!</h1>
            <h2 id="levelup-text">Niveau gennemført</h2>
            <p id="levelup-summary" />
            <div className="th-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="th-btn" id="btn-levelup-menu">Til menuen</button>
              <button className="th-btn primary" id="btn-levelup-next">Næste niveau →</button>
            </div>
          </div>
        </div>

        {/* Tutorial */}
        <div className="th-overlay hidden" id="screen-tutorial">
          <div className="th-panel" style={{ width: "min(680px, 96vw)" }}>
            <h1>Sådan bruger du tastaturet</h1>
            <h2>Touch-typing — hver finger har sine taster</h2>
            <p>Læg <b>venstre hånd</b> på <b>A&nbsp;S&nbsp;D&nbsp;F</b> og <b>højre hånd</b> på <b>J&nbsp;K&nbsp;L&nbsp;Æ</b>. Det er hjemmerækken — fingrene starter altid her.</p>
            <p>Hver tast er farvet efter, hvilken finger der skal bruge den.</p>
            <div id="tutorial-legend" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px 14px", margin: "14px 0" }} />
            <div id="tutorial-kb" style={{ margin: "16px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} />
            <div className="th-row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
              <button className="th-btn" id="btn-tutorial-skip">Spring over</button>
              <button className="th-btn primary" id="btn-tutorial-go">Forstået, lad os spille!</button>
            </div>
          </div>
        </div>

        {/* Game over */}
        <div className="th-overlay hidden" id="screen-gameover">
          <div className="th-panel">
            <h1>Game over</h1>
            <h2 id="gameover-text">Du løb tør for liv</h2>
            <p id="gameover-summary" />
            <div className="th-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="th-btn" id="btn-gameover-menu">Til menuen</button>
              <button className="th-btn primary" id="btn-gameover-retry">Prøv igen</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
