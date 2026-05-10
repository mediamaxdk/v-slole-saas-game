/* =========================================================================
   GANGE HELTEN — Canvas-spil motor (React-kompatibel)
   Porteret fra public/games/gange.html til et TypeScript-modul.

   Brug: initMultiplicationEngine(container, playerName, onLevelComplete)
   ========================================================================= */

export interface MultiLevelCompleteData {
  gameType: "multiplication";
  levelId: number;
  score: number;
  lettersCorrect: number;
  lettersWrong: number;
  durationMs: number;
  completed: true;
}

const MAX_LIVES = 5;
const POINTS_PER_LIFE = 500;

export interface MultiplicationEngineOpts {
  initialStats?: Record<string, unknown>;
  onSaveStats?: (stats: Record<string, unknown>) => void;
  speedMultiplier?: number;
  showKeyboard?: boolean;
}

export function initMultiplicationEngine(
  container: HTMLElement,
  playerName: string,
  onLevelComplete: (data: MultiLevelCompleteData) => void,
  opts?: MultiplicationEngineOpts
): () => void {
  const $ = (id: string) => container.querySelector('#' + id) as HTMLElement;

  /* --- Niveauer --- */
  const LEVELS = (() => {
    const arr: {
      id: number; name: string; target: number; baseSpeed: number;
      speedInc: number; table: number | "mix"; maxBlocks: number; spawnGap: number;
    }[] = [];
    for (let n = 1; n <= 12; n++) {
      arr.push({
        id: n, name: `${n}-tabellen`, target: 20,
        baseSpeed: 57.6 + (n - 1) * 1.68, speedInc: 1.68 + (n - 1) * 0.096,
        table: n, maxBlocks: 1, spawnGap: 1830
      });
    }
    arr.push({ id: 13, name: "MIX", target: 25, baseSpeed: 76.8, speedInc: 2.64, table: "mix", maxBlocks: 1, spawnGap: 1670 });
    return arr;
  })();

  /* --- State --- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const STATE: any = {
    player: playerName,
    stats: null,
    level: null,
    levelHits: 0,
    totalLevelDigits: 0,
    totalLevelMissed: 0,
    score: 0,
    lives: 5,
    pointsToNextLife: POINTS_PER_LIFE,
    blocks: [],
    particles: [],
    paused: false,
    running: false,
    lastSpawn: 0,
    lastFrame: 0,
    runStart: 0,
    mixTables: new Set([1,2,3,4,5,6,7,8,9,10,11,12]),
  };

  const STORAGE_KEY = 'th_mul_' + encodeURIComponent(playerName);

  function saveStats() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.stats)); } catch { /* quota / private mode */ }
    opts?.onSaveStats?.(STATE.stats as Record<string, unknown>);
  }

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* parse error */ }
    return null;
  }

  function newStatsFor(name: string) {
    return {
      name, created: Date.now(), lastPlayed: Date.now(),
      totalScore: 0, totalDigits: 0, totalMissed: 0, totalProblems: 0, totalSeconds: 0,
      highestLevel: 1,
      perLevel: {} as Record<string, { problems: number; score: number; plays: number; best: number; completed: number }>,
      mixTables: [1,2,3,4,5,6,7,8,9,10,11,12],
    };
  }

  function getLevelStats(levelId: number) {
    const k = String(levelId);
    if (!STATE.stats.perLevel[k])
      STATE.stats.perLevel[k] = { problems: 0, score: 0, plays: 0, best: 0, completed: 0 };
    return STATE.stats.perLevel[k];
  }

  /* --- Canvas --- */
  const canvas = container.querySelector('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  let cssW = 0, cssH = 0;

  function resizeCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cssW = canvas.clientWidth; cssH = canvas.clientHeight;
    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const cssVarCache: Record<string, string> = {};
  function getCss(varName: string): string {
    if (cssVarCache[varName]) return cssVarCache[varName];
    const v = getComputedStyle(container).getPropertyValue(varName).trim()
           || getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    cssVarCache[varName] = v;
    return v;
  }

  /* --- Problemgenerering --- */
  function pickProblem() {
    const lvl = STATE.level;
    let table: number;
    if (lvl.table === "mix") {
      const enabled = [...STATE.mixTables] as number[];
      table = enabled.length > 0 ? enabled[Math.floor(Math.random() * enabled.length)] : 1;
    } else {
      table = lvl.table as number;
    }
    const m = 1 + Math.floor(Math.random() * 10);
    const reverse = Math.random() < 0.5;
    const a = reverse ? m : table;
    const b = reverse ? table : m;
    return { a, b };
  }

  /* --- Blokke --- */
  function fontSizeForBlock(text: string): number {
    let size = Math.min(82, Math.max(40, cssW * 0.075));
    const maxW = cssW * 0.88;
    ctx.font = `700 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    while (size > 18 && ctx.measureText(text).width > maxW) {
      size -= 2;
      ctx.font = `700 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    }
    return size;
  }

  function makeBlock() {
    const p = pickProblem();
    const prefix = `${p.a} × ${p.b} = `;
    const answer = String(p.a * p.b);
    const fullText = prefix + answer;
    const fontSize = fontSizeForBlock(fullText);
    ctx.font = `700 ${fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    const width = ctx.measureText(fullText).width;
    const margin = 30;
    const x = margin + Math.random() * Math.max(10, cssW - 2 * margin - width);
    const y = -fontSize;
    const baseSpeed = STATE.level.baseSpeed + STATE.levelHits * STATE.level.speedInc;
    const speedMultiplier = opts?.speedMultiplier || 1.0;
    const speed = baseSpeed * speedMultiplier;
    return { prefix, answer, typed: 0, x, y, fontSize, width, speed, state: "fall", explode: 0, shake: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawBlock(b: any) {
    ctx.font = `700 ${b.fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    const shakeX = b.shake > 0 ? Math.sin(b.shake * 80) * 6 : 0;
    if (b.typed > 0) {
      ctx.save();
      ctx.fillStyle = b.shake > 0 ? "rgba(255,92,122,0.18)" : "rgba(97,240,200,0.07)";
      const pad = 14; const r = 10;
      roundRect(ctx, b.x + shakeX - pad, b.y - pad/2, b.width + 2*pad, b.fontSize + pad, r);
      ctx.fill();
      ctx.restore();
    }
    let dx = b.x + shakeX;
    ctx.fillStyle = getCss("--equals");
    ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;
    ctx.fillText(b.prefix, dx, b.y);
    dx += ctx.measureText(b.prefix).width;
    ctx.fillStyle = getCss("--typed");
    ctx.shadowColor = getCss("--typed"); ctx.shadowBlur = 10;
    for (let i = 0; i < b.typed; i++) {
      const ch = b.answer[i];
      ctx.fillText(ch, dx, b.y);
      dx += ctx.measureText(ch).width;
    }
    ctx.shadowBlur = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawExplosion(b: any) {
    const frames = ["x X x ·", "X * X *", "* · * ·", "· · ·", " ·  · "];
    const f = Math.min(frames.length - 1, Math.floor(b.explode / 0.11));
    const txt = frames[f];
    const size = Math.min(64, Math.max(28, b.fontSize * 0.85));
    ctx.font = `700 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = getCss("--accent2"); ctx.shadowColor = getCss("--accent2"); ctx.shadowBlur = 14;
    const w = ctx.measureText(txt).width;
    const cx = b.x + b.width / 2;
    ctx.fillText(txt, cx - w / 2, b.y);
    ctx.shadowBlur = 0;
  }

  function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
    c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y);
    c.closePath();
  }

  /* --- Game loop --- */
  function update(dt: number, now: number) {
    const lvl = STATE.level;
    const fallingCount = STATE.blocks.filter((b: {state:string}) => b.state === "fall").length;
    if (fallingCount < lvl.maxBlocks && (now - STATE.lastSpawn) > lvl.spawnGap) {
      const lowest = STATE.blocks.filter((b: {state:string}) => b.state === "fall")
        .reduce((m: number, b: {y:number}) => Math.max(m, b.y), -Infinity);
      if (fallingCount === 0 || lowest > cssH * 0.20) {
        STATE.blocks.push(makeBlock());
        STATE.lastSpawn = now;
      }
    }
    for (const b of STATE.blocks) {
      if (b.shake > 0) b.shake = Math.max(0, b.shake - dt);
      if (b.state === "fall") {
        b.y += b.speed * dt;
        if (b.y > cssH - 6) { b.state = "miss"; loseLife(b); }
      } else if (b.state === "explode") { b.explode += dt; }
    }
    STATE.blocks = STATE.blocks.filter((b: {state:string;explode:number}) => {
      if (b.state === "explode" && b.explode > 0.55) return false;
      if (b.state === "miss") return false;
      return true;
    });
    for (const p of STATE.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 380 * dt; p.life -= dt;
    }
    STATE.particles = STATE.particles.filter((p: {life:number}) => p.life > 0);
  }

  function render() {
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 92, 122, 0.18)"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(0, cssH - 3); ctx.lineTo(cssW, cssH - 3); ctx.stroke();
    ctx.restore();
    for (const b of STATE.blocks) {
      if (b.state === "fall") drawBlock(b);
      else if (b.state === "explode") drawExplosion(b);
    }
    for (const p of STATE.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    if (!STATE.running) return;
    const dt = Math.min(0.05, (now - STATE.lastFrame) / 1000);
    STATE.lastFrame = now;
    if (!STATE.paused) update(dt, now);
    render();
    requestAnimationFrame(frame);
  }

  /* --- Tastaturguide --- */
  const KEY_NODES: Record<string, HTMLElement> = {};

  function buildKeyboard() {
    const rows: [keyof typeof KB_LAYOUT, string][] = [["top","kb-row-top"],["mid","kb-row-mid"],["bot","kb-row-bot"]];
    for (const [rk, rid] of rows) {
      const el = $(rid);
      if (!el) continue;
      const rowKeys = KB_LAYOUT[rk];
      el.innerHTML = "";
      for (const key of rowKeys) {
        const keyEl = document.createElement("div");
        keyEl.className = `key ${getFingerClass(key)}`;
        keyEl.setAttribute("data-k", key);
        keyEl.textContent = key;
        el.appendChild(keyEl);
        KEY_NODES[key] = keyEl;
      }
    }
  }

  function getFingerClass(key: string): string {
    const FINGER_MAP: Record<string, string> = {
      '1': 'f-pinky', '2': 'f-ring', '3': 'f-middle', '4': 'f-index',
      '5': 'f-index', '6': 'f-middle', '7': 'f-ring', '8': 'f-pinky',
      '9': 'f-pinky', '0': 'f-thumb',
      'q': 'f-pinky', 'w': 'f-ring', 'e': 'f-middle', 'r': 'f-index', 't': 'f-index', 'y': 'f-middle', 'u': 'f-ring', 'i': 'f-pinky',
      'a': 'f-pinky', 's': 'f-ring', 'd': 'f-middle', 'f': 'f-index', 'g': 'f-index', 'h': 'f-middle', 'j': 'f-ring', 'k': 'f-pinky',
      'z': 'f-pinky', 'x': 'f-ring', 'c': 'f-middle', 'v': 'f-index', 'b': 'f-index', 'n': 'f-middle', 'm': 'f-ring', 'æ': 'f-pinky', 'ø': 'f-ring', 'å': 'f-middle'
    };
    return FINGER_MAP[key] || '';
  }

  const KB_LAYOUT = {
    top: ['1','2','3','4','5','6','7','8','9','0'],
    mid: ['q','w','e','r','t','y','u','i','o','p','å'],
    bot: ['a','s','d','f','g','h','j','k','l','æ','ø','z','x','c','v','b','n','m']
  } as const;

  function toggleKeyboard() {
    const kb = $("keyboard");
    kb.classList.toggle("hidden-kb");
    requestAnimationFrame(resizeCanvas);
  }

  function setKeyboardVisible(visible: boolean) {
    const kb = $("keyboard");
    if (visible) kb.classList.remove("hidden-kb");
    else kb.classList.add("hidden-kb");
    requestAnimationFrame(resizeCanvas);
  }

  function keyToChar(e: KeyboardEvent): string | null {
    const k = e.key;
    if (k.length === 1) return k;
    return null;
  }

  function handleKey(e: KeyboardEvent) {
    if (!STATE.running) return;
    if (e.key === "Escape") { togglePause(); e.preventDefault(); return; }
    if (e.key === "Tab") { if (!STATE.paused) STATE.paused = true; showStats(true); e.preventDefault(); return; }
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
      toggleKeyboard(); e.preventDefault(); return;
    }
    if (STATE.paused) return;
    const ch = keyToChar(e);
    if (!ch) return;
    if (!/^[0-9]$/.test(ch)) return;
    const active = STATE.blocks.find((b: {state:string;typed:number}) => b.state === "fall" && b.typed > 0);
    if (active) {
      const next = active.answer[active.typed];
      if (next === ch) { active.typed += 1; STATE.totalLevelDigits += 1; updateHud(); checkComplete(active); }
      else wrongKey(ch, active);
      e.preventDefault(); return;
    }
    const candidates = STATE.blocks.filter((b: {state:string;answer:string}) => b.state === "fall" && b.answer[0] === ch);
    if (candidates.length === 0) {
      if (STATE.blocks.some((b: {state:string}) => b.state === "fall")) wrongKey(ch, null);
      return;
    }
    candidates.sort((a: {y:number}, b: {y:number}) => b.y - a.y);
    const target = candidates[0];
    target.typed = 1; STATE.totalLevelDigits += 1; updateHud(); checkComplete(target);
    e.preventDefault();
  }

  function awardPoint() {
    STATE.score += 1; STATE.pointsToNextLife -= 1;
    if (STATE.pointsToNextLife <= 0 && STATE.lives < MAX_LIVES) {
      STATE.lives += 1; STATE.pointsToNextLife = POINTS_PER_LIFE; toast("+1 liv!");
    } else if (STATE.pointsToNextLife <= 0) {
      STATE.pointsToNextLife = POINTS_PER_LIFE;
    }
    updateHud();
  }

  function wrongKey(typedCh: string, activeBlock: {shake:number} | null) {
    if (STATE.score > 0) STATE.score -= 1;
    STATE.totalLevelMissed += 1; updateHud();
    const flash = $("wrong-flash");
    if (flash) { flash.classList.remove("flash"); void flash.offsetWidth; flash.classList.add("flash"); }
    const m1 = $("minus-one");
    if (m1) { m1.classList.remove("show"); void m1.offsetWidth; m1.classList.add("show"); }
    if (activeBlock) activeBlock.shake = 0.28;
    void typedCh; // unused in gange
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function checkComplete(b: any) {
    if (b.typed >= b.answer.length) {
      awardPoint(); explodeBlock(b); STATE.levelHits += 1;
      if (STATE.levelHits >= STATE.level.target) setTimeout(() => endRun("complete"), 600);
      updateHud();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function explodeBlock(b: any) {
    b.state = "explode"; b.explode = 0;
    const cx = b.x + b.width / 2; const cy = b.y + b.fontSize / 2;
    const colors = [getCss("--accent"), getCss("--accent2"), "#ffffff"];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2; const sp = 130 + Math.random() * 260;
      STATE.particles.push({
        x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 80,
        size: 2+Math.random()*3, life: 0.45+Math.random()*0.25, maxLife: 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function loseLife(b: any) {
    STATE.lives -= 1; STATE.totalLevelMissed += 1; toast("✗ Mistede liv");
    const cx = b.x + b.width / 2; const cy = cssH - 12;
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI/2 + (Math.random()-0.5)*Math.PI; const sp = 80 + Math.random()*180;
      STATE.particles.push({
        x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
        size: 2+Math.random()*2, life: 0.5, maxLife: 0.5, color: getCss("--danger")
      });
    }
    updateHud();
    if (STATE.lives <= 0) setTimeout(() => endRun("dead"), 700);
  }

  /* --- HUD --- */
  function updateHud() {
    $("hud-name").textContent  = STATE.player || "—";
    $("hud-score").textContent = String(STATE.score);
    $("hud-lives").textContent = "♥".repeat(Math.max(0, STATE.lives)) + "♡".repeat(Math.max(0, MAX_LIVES - STATE.lives));
    $("hud-level").textContent = STATE.level ? String(STATE.level.id) : "—";
    $("hud-level-name").textContent = STATE.level ? STATE.level.name : "";
    let progressTxt = "";
    if (STATE.level) {
      const left = Math.max(0, STATE.level.target - STATE.levelHits);
      progressTxt = `${left} stykker tilbage`;
    }
    const nl = STATE.lives < MAX_LIVES
      ? `Næste liv om ${STATE.pointsToNextLife} · ${progressTxt}`
      : `Liv fyldt · ${progressTxt}`;
    $("hud-nextlife").textContent = nl;
  }

  /* --- Skærme --- */
  const SCREENS = ["menu","stats","pause","levelup","gameover","mix"];
  function hideAll() { for (const s of SCREENS) $("screen-" + s)?.classList.add("hidden"); }
  function show(s: string) { hideAll(); $("screen-" + s)?.classList.remove("hidden"); }

  function showMenu() {
    show("menu");
    $("menu-greeting").textContent = `Hej ${STATE.player}!`;
    buildLevelGrid();
  }

  function buildLevelGrid() {
    const grid = $("level-grid");
    grid.innerHTML = "";
    const highest = STATE.stats.highestLevel || 1;
    for (const lvl of LEVELS) {
      const div = document.createElement("div");
      const locked = lvl.id > highest;
      div.className = "lvl" + (locked ? " locked" : "") + (lvl.table === "mix" ? " mix" : "");
      const label = lvl.table === "mix" ? "MIX" : `${lvl.table}×`;
      div.innerHTML = `<div class="num">${lvl.id}</div><div class="lbl">${label}</div>`;
      if (!locked) div.addEventListener("click", () => startLevel(lvl.id));
      grid.appendChild(div);
    }
    ($("btn-menu-play") as HTMLButtonElement).onclick = () => startLevel(highest);
  }

  function showStats(returnToGame: boolean) {
    show("stats");
    $("stats-name").textContent = STATE.player;
    const o = $("stats-overall");
    const s = STATE.stats;
    const acc = s.totalDigits + s.totalMissed > 0
      ? Math.round((s.totalDigits / (s.totalDigits + s.totalMissed)) * 100) + "%"
      : "—";
    o.innerHTML = `
      <div class="stat-row"><span class="k">Højeste niveau</span><span class="v">${s.highestLevel}</span></div>
      <div class="stat-row"><span class="k">Samlet point</span><span class="v">${s.totalScore}</span></div>
      <div class="stat-row"><span class="k">Cifre skrevet</span><span class="v">${s.totalDigits}</span></div>
      <div class="stat-row"><span class="k">Forkerte tryk</span><span class="v">${s.totalMissed}</span></div>
      <div class="stat-row"><span class="k">Præcision</span><span class="v">${acc}</span></div>
      <div class="stat-row"><span class="k">Spilletid</span><span class="v">${formatSeconds(s.totalSeconds)}</span></div>
    `;
    const pl = $("stats-perlevel");
    pl.innerHTML = "";
    for (const lvl of LEVELS) {
      const ls = s.perLevel[String(lvl.id)];
      if (!ls || ls.plays === 0) continue;
      const row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = `<span class="k">${lvl.id}. ${lvl.name}</span><span class="v">${ls.best} pt · ${ls.completed}/${ls.plays} klaret</span>`;
      pl.appendChild(row);
    }
    ($("btn-stats-back") as HTMLButtonElement).onclick = () => {
      if (returnToGame && STATE.running) { hideAll(); STATE.paused = false; STATE.lastFrame = performance.now(); }
      else showMenu();
    };
  }

  function formatSeconds(s: number): string {
    s = Math.floor(s);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h) return `${h}t ${m}m`; if (m) return `${m}m ${ss}s`; return `${ss}s`;
  }

  function showLevelup() {
    show("levelup");
    $("levelup-text").textContent = `Niveau ${STATE.level.id} klaret`;
    $("levelup-summary").textContent =
      `${STATE.score} point · ${STATE.totalLevelDigits} cifre · ${STATE.lives} liv tilbage`;
    const next = LEVELS.find(l => l.id === STATE.level.id + 1);
    ($("btn-levelup-next") as HTMLButtonElement).style.display = next ? "" : "none";
    ($("btn-levelup-next") as HTMLButtonElement).onclick = () => next && startLevel(next.id);
  }

  function showGameover() {
    show("gameover");
    $("gameover-summary").textContent =
      `${STATE.score} point · ${STATE.totalLevelDigits} cifre · niveau ${STATE.level.id}`;
    ($("btn-gameover-retry") as HTMLButtonElement).onclick = () => startLevel(STATE.level.id);
  }

  function togglePause() {
    if (!STATE.running) return;
    STATE.paused = !STATE.paused;
    if (STATE.paused) show("pause");
    else { hideAll(); STATE.lastFrame = performance.now(); }
  }

  let _toastTimer: ReturnType<typeof setTimeout> | null = null;
  function toast(msg: string) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove("show"), 1200);
  }

  /* --- MIX-opsætning --- */
  let _mixOnConfirm: (() => void) | null = null;

  function showMixSetup(onStart: () => void) {
    _mixOnConfirm = onStart;
    if (STATE.stats && Array.isArray(STATE.stats.mixTables)) {
      STATE.mixTables = new Set(STATE.stats.mixTables);
      if (STATE.mixTables.size === 0) STATE.mixTables = new Set([1,2,3,4,5,6,7,8,9,10,11,12]);
    }
    buildMixGrid(); updateMixSummary(); show("mix");
  }

  function buildMixGrid() {
    const grid = $("mix-grid"); grid.innerHTML = "";
    for (let n = 1; n <= 12; n++) {
      const cell = document.createElement("div");
      cell.className = "mix-cell" + (STATE.mixTables.has(n) ? " active" : "");
      cell.innerHTML = `${n}×<span class="check">${STATE.mixTables.has(n) ? "med" : "fra"}</span>`;
      cell.dataset.n = String(n);
      cell.addEventListener("click", () => {
        if (STATE.mixTables.has(n)) STATE.mixTables.delete(n);
        else STATE.mixTables.add(n);
        cell.classList.toggle("active");
        const chk = cell.querySelector(".check");
        if (chk) chk.textContent = STATE.mixTables.has(n) ? "med" : "fra";
        updateMixSummary();
      });
      grid.appendChild(cell);
    }
  }

  function updateMixSummary() {
    const sel = [...STATE.mixTables as Set<number>].sort((a: number, b: number) => a - b);
    const sum = $("mix-summary");
    if (sel.length === 0) {
      sum.textContent = "Vælg mindst én tabel for at starte."; sum.classList.add("warn");
    } else {
      sum.textContent = `${sel.length} tabel${sel.length === 1 ? "" : "ler"} valgt: ${sel.map((n: number) => n + "×").join(" · ")}`;
      sum.classList.remove("warn");
    }
    ($("btn-mix-start") as HTMLButtonElement).disabled = sel.length === 0;
  }

  /* --- Spilflow --- */
  function startLevel(levelId: number) {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    if (lvl.table === "mix") { showMixSetup(() => actuallyStartLevel(levelId)); return; }
    actuallyStartLevel(levelId);
  }

  function actuallyStartLevel(levelId: number) {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    STATE.level = lvl; STATE.levelHits = 0; STATE.totalLevelDigits = 0; STATE.totalLevelMissed = 0;
    STATE.score = 0; STATE.lives = MAX_LIVES; STATE.pointsToNextLife = POINTS_PER_LIFE;
    STATE.blocks = []; STATE.particles = []; STATE.lastSpawn = 0; STATE.runStart = performance.now();
    getLevelStats(lvl.id).plays += 1;
    STATE.running = true; STATE.paused = false;
    hideAll(); updateHud(); resizeCanvas();
    STATE.lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function endRun(reason: string) {
    STATE.running = false;
    const elapsed = (performance.now() - STATE.runStart) / 1000;
    STATE.stats.totalSeconds  += elapsed;
    STATE.stats.totalDigits   += STATE.totalLevelDigits;
    STATE.stats.totalMissed   += STATE.totalLevelMissed;
    STATE.stats.totalScore    += STATE.score;
    STATE.stats.totalProblems += STATE.levelHits;
    STATE.stats.lastPlayed = Date.now();
    const ls = getLevelStats(STATE.level.id);
    ls.problems += STATE.levelHits; ls.score += STATE.score;
    if (STATE.score > ls.best) ls.best = STATE.score;
    if (reason === "complete") {
      ls.completed += 1;
      onLevelComplete({
        gameType: "multiplication",
        levelId: STATE.level.id,
        score: STATE.score,
        lettersCorrect: STATE.totalLevelDigits,
        lettersWrong: STATE.totalLevelMissed,
        durationMs: Math.round(performance.now() - STATE.runStart),
        completed: true,
      });
      if (STATE.level.id >= STATE.stats.highestLevel)
        STATE.stats.highestLevel = Math.min(LEVELS.length, STATE.level.id + 1);
      saveStats();
      showLevelup();
    } else { saveStats(); showGameover(); }
  }

  /* --- Knapopsætning --- */
  ($("btn-menu-stats") as HTMLButtonElement).addEventListener("click", () => showStats(false));
  ($("btn-menu-name") as HTMLButtonElement).addEventListener("click", () => showMenu());
  ($("btn-stats-reset") as HTMLButtonElement).addEventListener("click", () => {
    if (!confirm("Nulstil alle stats for " + STATE.player + "?")) return;
    STATE.stats = newStatsFor(STATE.player); saveStats(); showMenu();
  });
  ($("btn-pause-resume") as HTMLButtonElement).addEventListener("click", () => togglePause());
  ($("btn-pause-quit") as HTMLButtonElement).addEventListener("click", () => { STATE.running = false; showMenu(); });
  ($("btn-levelup-menu") as HTMLButtonElement).addEventListener("click", () => showMenu());
  ($("btn-gameover-menu") as HTMLButtonElement).addEventListener("click", () => showMenu());
  ($("btn-mix-all-on") as HTMLButtonElement).addEventListener("click", () => {
    STATE.mixTables = new Set([1,2,3,4,5,6,7,8,9,10,11,12]); buildMixGrid(); updateMixSummary();
  });
  ($("btn-mix-all-off") as HTMLButtonElement).addEventListener("click", () => {
    STATE.mixTables = new Set(); buildMixGrid(); updateMixSummary();
  });
  ($("btn-mix-cancel") as HTMLButtonElement).addEventListener("click", () => { _mixOnConfirm = null; showMenu(); });
  ($("btn-mix-start") as HTMLButtonElement).addEventListener("click", () => {
  ($("kb-toggle") as HTMLButtonElement).addEventListener("click", toggleKeyboard);
    if (STATE.mixTables.size === 0) return;
    if (STATE.stats) STATE.stats.mixTables = [...STATE.mixTables as Set<number>].sort((a: number, b: number) => a - b);
    const cb = _mixOnConfirm; _mixOnConfirm = null;
    if (cb) cb();
  });

  /* --- Boot --- */
  buildKeyboard();
  // Set initial keyboard visibility
  if (opts?.showKeyboard === false) {
    setKeyboardVisible(false);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", handleKey);
  // Prioritet: server-stats (fra Neon) > localStorage > ny profil
  STATE.stats = opts?.initialStats ?? loadStats() ?? newStatsFor(playerName);
  showMenu();

  return () => {
    STATE.running = false;
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keydown", handleKey);
    if (_toastTimer) clearTimeout(_toastTimer);
  };
}
