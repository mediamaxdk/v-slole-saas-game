/* =========================================================================
   TASTATUR HELTEN — Canvas-spil motor (React-kompatibel)
   Porteret fra public/games/tastatur.html til et TypeScript-modul.

   Brug: initKeyboardEngine(container, playerName, onLevelComplete)
   ========================================================================= */

/* -------------------- Typer -------------------- */

export interface LevelCompleteData {
  gameType: "keyboard";
  levelId: number;
  score: number;
  lettersCorrect: number;
  lettersWrong: number;
  durationMs: number;
  completed: true;
}

/* -------------------- Bogstavdata (modulniveau) -------------------- */

const LETTER_WAVES = [
  ['f','j'],
  ['f','j','d','k'],
  ['f','j','d','k','s','l'],
  ['f','j','d','k','s','l','a'],
  ['f','j','d','k','s','l','a','e','i','r','u'],
  ['f','j','d','k','s','l','a','e','i','r','u','t','n','g','h'],
  ['f','j','d','k','s','l','a','e','i','r','u','t','n','g','h','o','m','v','b','c','p','y'],
  ['f','j','d','k','s','l','a','e','i','r','u','t','n','g','h','o','m','v','b','c','p','y','æ','ø','å'],
  ['f','j','d','k','s','l','a','e','i','r','u','t','n','g','h','o','m','v','b','c','p','y','æ','ø','å','q','w','x','z']
];

const SYLLABLES_L2 = [
  "og","er","at","en","et","så","du","vi","om","op","ud","ja","de","da","nu","mr","ny","ny",
  "to","tre","fra","tit","mig","dig","sig","han","hun","det","den","jeg","har","var","kan","vil",
  "ba","be","bi","bo","bu","by","bæ","bø","bå","da","de","di","do","du","dy","dæ","dø","då",
  "fa","fe","fi","fo","fu","fy","fæ","fø","få","ga","ge","gi","go","gu","gy","gæ","gø","gå",
  "ha","he","hi","ho","hu","hy","hæ","hø","hå","ka","ke","ki","ko","ku","ky","kæ","kø","kå",
  "la","le","li","lo","lu","ly","læ","lø","lå","ma","me","mi","mo","mu","my","mæ","mø","må",
  "na","ne","ni","no","nu","ny","næ","nø","nå","pa","pe","pi","po","pu","py","pæ","pø","på",
  "ra","re","ri","ro","ru","ry","ræ","rø","rå","sa","se","si","so","su","sy","sæ","sø","så",
  "ta","te","ti","to","tu","ty","tæ","tø","tå","va","ve","vi","vo","vu","vy","væ","vø","vå"
];

const WORDS_L3 = [
  "og","er","at","en","et","til","på","af","så","du","vi","om","op","ud","ja","nej",
  "de","da","nu","ham","han","hun","det","den","jeg","har","var","kan","vil","jo","mig","dig","sig",
  "se","gå","få","gø","ny","ti","to","fra","mor","far","kat","hat","hus","leg","ord","sov","sol",
  "bil","fly","vej","mad","tak","vej","sin","sit","kun","men","hen","tæt","sød","kær","ren","ond",
  "ko","ko","tre","æg","is","ø","å","te","by","gør","gid","fik","tit","kom","fod","mod","mit","din",
  "lys","lyd","ler","los","mus","ler","lup","mor","mus","far","fed","var","ven","ved","syd","nor"
];

const WORDS_L4 = [
  "hund","kage","mund","måne","sten","brød","hjem","leve","time","bord","bænk","glas","papa","mama",
  "barn","piger","blød","glad","løbe","ride","kysse","sove","leve","læse","skri","mand","kvik","alle","aldrig",
  "snue","stol","fest","lege","ven","ven","læge","rar","sus","stof","skib","kort","vand","blå","grøn",
  "rød","gul","sort","hvid","mark","gade","port","løb","hop","kage","kuge","ulve","ulig","åben","ærlig",
  "hund","fugl","sang","bog","gus","arme","ben","fod","hånd","næse","mund","øje","øre","dør","tag","stue",
  "stor","lille","høj","lav","ung","ny","gå","løb","kom","tag","få","sig","spis","drik","hør","se",
  "alt","ind","ned","ude","ind","over","inde","sammen","tit","ofte","altid","kun","godt","slet","helt"
];

const WORDS_L5 = [
  "huset","bilen","bogen","barnet","manden","kvinde","piger","drenge","skole","lærer","klasse","lektie",
  "venlig","glade","store","lille","smuk","fede","nemme","svære","bøger","stole","spise","drikke","sove",
  "vågne","løbe","danse","synge","grine","græde","tegne","skrive","læse","tænke","huske","glemme",
  "blive","komme","gå","tage","give","bringe","finde","miste","åbne","lukke","starte","slutte","møde",
  "vente","ringe","kalde","sende","fange","kaste","bære","sælge","købe","betale","bruge","gemme",
  "vinde","tabe","prøve","øve","lære","forstå","tale","sige","spørge","svare","nikke","vinke",
  "vinter","sommer","forår","efterår","måned","uger","dage","timer","minut","aften","morgen","nat",
  "sø","skov","mark","strand","have","park","gade","torv","by","land","verden","jord","luft","ild"
];

const WORDS_TOP100 = [
  "og","i","jeg","det","at","en","den","til","er","som","på","de","med","han","af","for","ikke","der","var","mig",
  "sig","men","et","har","om","vi","min","havde","ham","hun","nu","over","da","fra","du","ud","sin","dem","os","op",
  "man","hans","hvor","eller","hvad","skal","selv","her","alle","vil","blev","kunne","ind","når","være","dog","noget","ville","jo","deres",
  "efter","ned","skulle","denne","end","dette","mit","også","under","have","dig","anden","hende","mine","alt","meget","sit","sine","vor","mod",
  "disse","hvis","din","nogle","hos","blive","mange","ad","bliver","hendes","været","thi","jer","sådan","jeres","være","så","kan","kun","kom"
];

const WORDS_TOP500_EXTRA = [
  "barn","mand","kvinde","tid","år","dag","aften","morgen","nat","time","minut","uge","måned","sommer","vinter","forår","efterår","verden","jord","sol",
  "måne","stjerne","himmel","hav","skov","mark","sø","flod","bjerg","dal","by","land","gade","vej","hus","hjem","dør","vindue","værelse","stue",
  "køkken","seng","bord","stol","bog","pen","papir","skole","klasse","lærer","elev","ven","veninde","familie","bror","søster","onkel","tante","baby","barnebarn",
  "krop","hoved","hår","ansigt","øje","næse","mund","øre","tand","tunge","arm","hånd","finger","ben","fod","ryg","mave","hjerte","fugl","fisk",
  "hund","kat","ko","hest","gris","får","mus","ulv","løve","abe","blomst","træ","blad","græs","frugt","æble","banan","appelsin","brød","ost",
  "mælk","vand","kaffe","te","saft","sukker","salt","peber","æg","kød","fisk","ris","pasta","kage","is","chokolade","slik","måltid","frokost","middag",
  "rød","blå","grøn","gul","sort","hvid","grå","brun","lyserød","orange","stor","lille","høj","lav","lang","kort","tyk","tynd","bred","smal",
  "varm","kold","hed","kølig","tør","våd","ny","gammel","ung","ældre","glad","ked","sur","vred","sjov","kedelig","nem","svær","let","tung",
  "hurtig","langsom","stærk","svag","rig","fattig","klog","dum","smuk","grim","ren","beskidt","åben","lukket","fuld","tom","tæt","løs","blød","hård",
  "spise","drikke","sove","vågne","stå","sidde","ligge","gå","løbe","hoppe","danse","synge","tale","råbe","hviske","læse","skrive","tegne","male","tænke"
];

const WORDS_TOP1000_EXTRA = [
  "regering","politiker","minister","statsminister","valg","parti","stemme","demokrati","folketing","kommune",
  "virksomhed","firma","selskab","forretning","butik","supermarked","bager","slagter","læge","sygeplejerske",
  "sygehus","klinik","medicin","sygdom","feber","forkølelse","motion","træning","sport","fodbold",
  "håndbold","badminton","tennis","svømning","cykling","vinder","taber","kamp","spil","legetøj",
  "bus","tog","fly","skib","færge","metro","taxa","lastbil","traktor","museum","bibliotek",
  "teater","biograf","musik","sang","melodi","instrument","klaver","guitar","violin","trompet",
  "kunstner","maler","forfatter","digter","skuespiller","journalist","redaktør","reporter","fotograf","designer",
  "arkitekt","ingeniør","forsker","videnskab","laboratorium","computer","tablet","mobiltelefon","internet","hjemmeside",
  "energi","strøm","batteri","ledning","lampe","pære","tv","radio","højttaler","kamera",
  "avis","blad","artikel","overskrift","forfatter","sætning","afsnit","kapitel","bogstav","tegn",
  "alfabet","sprog","dansk","engelsk","tysk","fransk","spansk","italiensk","svensk","norsk",
  "navn","fornavn","efternavn","alder","fødselsdag","fødested","adresse","telefon","pas","kørekort",
  "jul","påske","pinse","fastelavn","halloween","nytår","helligdag","ferie","weekend","fridag",
  "mandag","tirsdag","onsdag","torsdag","fredag","lørdag","søndag","januar","februar","marts",
  "april","maj","juni","juli","august","september","oktober","november","december","vejr","klima"
];

const SENTENCES_3 = [
  "Jeg er glad","Du er sød","Han er hjemme","Hun har en kat","Vi løber hurtigt","De spiser frokost",
  "Bilen er rød","Hunden gør højt","Solen skinner varmt","Drengen leger ude","Pigen læser bog","Manden drikker kaffe",
  "Mor laver mad","Far ser tv","Læreren forklarer noget","Eleven skriver i hæftet","Bogen er tyk","Klokken er otte",
  "Nu er det","Det er sjovt","Han kan svømme","Hun kan synge","Vi går hjem","De tager bussen",
  "Jeg elsker dig","Du har ret","Det går fint","Kaffe er varm","Vand er koldt","Brød er godt",
  "Æblet er rødt","Banan er gul","Jeg har travlt","Vi har fri","Skolen er god","Dagen er lang"
];

const SENTENCES_4 = [
  "Jeg er meget glad","Hun har en stor hund","Han spiser et æble","Vi går i skole","De leger på legepladsen",
  "Bilen kører meget hurtigt","Solen skinner i dag","Det regner i Aalborg","Han kan godt lide musik","Hun synger en smuk sang",
  "Læreren læser højt op","Eleverne lytter til hende","Bogen ligger på bordet","Pennen er lige der","Klokken er fem nu",
  "Min mor bager kage","Min far går tur","Min søster er lille","Min bror er stor","Familien spiser sammen sammen",
  "Hunden løber i haven","Katten sover på stolen","Fuglene synger om morgenen","Træerne er meget høje","Blomsterne er blevet røde"
];

const SENTENCES_5 = [
  "Jeg er meget glad i dag.","Hun har en lille, hvid hund.","Han spiser et stort, rødt æble.","Vi går altid i skole sammen.","De leger ude på den nye legeplads.",
  "Bilen kører alt for hurtigt forbi.","Solen skinner smukt fra en blå himmel.","Det regner, og det blæser kraftigt.","Han kan godt lide klassisk musik.","Hun synger en meget smuk, lille sang.",
  "Læreren læser en spændende bog højt.","Eleverne lytter meget opmærksomt til hende.","Bogen ligger åben på det store bord.","Den blå pen ligger lige derovre.","Klokken er fem minutter i tre.",
  "Min mor bager en stor, lækker kage.","Min far går en lang tur søndag.","Min lille søster er kun fire år.","Min store bror går i femte klasse.","Familien spiser middag sammen hver aften.",
  "Hunden løber rundt i den store have.","Katten sover sødt på den bløde stol.","Fuglene synger smukt udenfor mit vindue."
];

const NUMBERS_SYMBOLS = [
  "1","2","3","4","5","6","7","8","9","0",
  "12","17","23","42","56","78","99","100",
  "år 2024","år 2026","2024","31-12","12-08","01-01",
  "kl. 8","kl. 12","kl. 15","07:30","12:45","16:00",
  "2 + 3","5 - 1","4 + 4","10 - 7","6 + 6","9 - 3",
  "2 + 3 = 5","8 - 4 = 4","10 + 5 = 15","6 + 7 = 13",
  "100 %","50 %","25 %","20 kr.","50 kr.","100 kr.","250 kr.",
  "Hej!","Ja!","Nej!","Ok?","Hvad?","Hvorfor?","Hvor?","Hej, du!",
  "Jeg er 10 år.","Hun er 12 år.","Vi er 4 børn.","Klokken er 8.","Det koster 25 kr.",
  "(godt)","(ja)","\"hej\"","\"tak\"","rød-hvid","mor: ja","far: nej"
];

const uniq = <T>(arr: T[]): T[] => [...new Set(arr)];

/* -------------------- Tastaturlayout -------------------- */

const KB_LAYOUT = {
  top: [['q','pinky','L'],['w','ring','L'],['e','middle','L'],['r','index','L'],['t','index','L'],
        ['y','index','R'],['u','index','R'],['i','middle','R'],['o','ring','R'],['p','pinky','R'],['å','pinky','R']],
  mid: [['a','pinky','L'],['s','ring','L'],['d','middle','L'],['f','index','L'],['g','index','L'],
        ['h','index','R'],['j','index','R'],['k','middle','R'],['l','ring','R'],['æ','pinky','R'],['ø','pinky','R']],
  bot: [['z','pinky','L'],['x','ring','L'],['c','middle','L'],['v','index','L'],['b','index','L'],
        ['n','index','R'],['m','index','R'],[',','middle','R'],['.','ring','R'],['-','pinky','R']]
};

const KEY_INFO: Record<string, { finger: string; side: string | null }> = (() => {
  const m: Record<string, { finger: string; side: string | null }> = {};
  for (const row of Object.values(KB_LAYOUT)) {
    for (const [ch, finger, side] of row as string[][]) m[ch] = { finger, side };
  }
  m[" "] = { finger: "thumb", side: null };
  return m;
})();

const FINGER_NAME_DA: Record<string, string> = {
  pinky: "lillefinger", ring: "ringfinger", middle: "langemand",
  index: "pegefinger", thumb: "tommelfinger"
};
const SIDE_NAME_DA: Record<string, string> = { L: "venstre", R: "højre" };

const LEVEL1_TARGET_LETTERS = ['f','j','d','k','s','l','a','e','i','r','u','t','n','g','h','o','m','v','b','c','p','y','æ','ø','å','q','w','x','z'];
const LEVEL1_REQUIRED_HITS = 5;
const MAX_LIVES = 5;
const POINTS_PER_LIFE = 500;

/* ==================== Motorfabrik ==================== */

export interface KeyboardEngineOpts {
  initialStats?: Record<string, unknown>;
  onSaveStats?: (stats: Record<string, unknown>) => void;
  speedMultiplier?: number;
  showKeyboard?: boolean;
}

export function initKeyboardEngine(
  container: HTMLElement,
  playerName: string,
  onLevelComplete: (data: LevelCompleteData) => void,
  opts?: KeyboardEngineOpts
): () => void {
  /* --- DOM-hjælper --- */
  const $ = (id: string) => container.querySelector('#' + id) as HTMLElement;

  /* --- Niveauer --- */
  const LEVELS = [
    { id: 1,  name: "Bogstaver",            target: 29, baseSpeed: 44, speedInc: 2.0, mode: "letter", maxBlocks: 3, spawnGap: 950  },
    { id: 2,  name: "Stavelser & korte ord",target: 30, baseSpeed: 42, speedInc: 1.8, mode: "word",   src: uniq(SYLLABLES_L2),  maxBlocks: 2, spawnGap: 1300 },
    { id: 3,  name: "2-3 bogstavs ord",     target: 30, baseSpeed: 40, speedInc: 1.7, mode: "word",   src: uniq(WORDS_L3),       maxBlocks: 2, spawnGap: 1400 },
    { id: 4,  name: "3-4 bogstavs ord",     target: 30, baseSpeed: 38, speedInc: 1.6, mode: "word",   src: uniq(WORDS_L4),       maxBlocks: 2, spawnGap: 1600 },
    { id: 5,  name: "4-5 bogstavs ord",     target: 25, baseSpeed: 36, speedInc: 1.5, mode: "word",   src: uniq(WORDS_L5),       maxBlocks: 2, spawnGap: 1800 },
    { id: 6,  name: "Top 100 ord",          target: 25, baseSpeed: 34, speedInc: 1.4, mode: "word",   src: uniq(WORDS_TOP100),   maxBlocks: 2, spawnGap: 1900 },
    { id: 7,  name: "Top 500 ord",          target: 25, baseSpeed: 32, speedInc: 1.3, mode: "word",   src: uniq([...WORDS_TOP100, ...WORDS_TOP500_EXTRA]),                          maxBlocks: 2, spawnGap: 2000 },
    { id: 8,  name: "Top 1000 ord",         target: 25, baseSpeed: 32, speedInc: 1.3, mode: "word",   src: uniq([...WORDS_TOP100, ...WORDS_TOP500_EXTRA, ...WORDS_TOP1000_EXTRA]),  maxBlocks: 2, spawnGap: 2100 },
    { id: 9,  name: "3-ords sætninger",     target: 12, baseSpeed: 26, speedInc: 0.9, mode: "sent",   src: uniq(SENTENCES_3),    maxBlocks: 1, spawnGap: 2700 },
    { id: 10, name: "4-ords sætninger",     target: 12, baseSpeed: 24, speedInc: 0.8, mode: "sent",   src: uniq(SENTENCES_4),    maxBlocks: 1, spawnGap: 3100 },
    { id: 11, name: "5-ords sætninger",     target: 10, baseSpeed: 22, speedInc: 0.7, mode: "sent",   src: uniq(SENTENCES_5),    maxBlocks: 1, spawnGap: 3500 },
    { id: 12, name: "Tal og symboler",      target: 18, baseSpeed: 30, speedInc: 1.1, mode: "sent",   src: uniq(NUMBERS_SYMBOLS), maxBlocks: 2, spawnGap: 2000 }
  ] as const;

  /* --- State --- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const STATE: any = {
    player: playerName,
    stats: null,
    level: null,
    levelHits: 0,
    totalLevelLetters: 0,
    totalLevelMissed: 0,
    score: 0,
    lives: 5,
    pointsToNextLife: POINTS_PER_LIFE,
    blocks: [],
    particles: [],
    letterCounts: {},
    paused: false,
    running: false,
    lastSpawn: 0,
    lastFrame: 0,
    runStart: 0,
  };

  /* --- Stats (persisteret via localStorage) --- */
  const STORAGE_KEY = 'th_kb_' + encodeURIComponent(playerName);

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
      name,
      created: Date.now(),
      lastPlayed: Date.now(),
      totalScore: 0,
      totalLetters: 0,
      totalMissed: 0,
      totalBlocks: 0,
      totalSeconds: 0,
      highestLevel: 1,
      tutorialSeen: false,
      perLevel: {} as Record<string, { hits: number; score: number; plays: number; best: number; completed: number }>,
    };
  }

  function getLevelStats(levelId: number) {
    const k = String(levelId);
    if (!STATE.stats.perLevel[k]) {
      STATE.stats.perLevel[k] = { hits: 0, score: 0, plays: 0, best: 0, completed: 0 };
    }
    return STATE.stats.perLevel[k];
  }

  /* --- Canvas --- */
  const canvas = container.querySelector('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  let cssW = 0, cssH = 0;

  function resizeCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* --- CSS-variabel-cache --- */
  const cssVarCache: Record<string, string> = {};
  function getCss(varName: string): string {
    if (cssVarCache[varName]) return cssVarCache[varName];
    // Read from the game container first (where vars are defined), then fallback to :root
    const v = getComputedStyle(container).getPropertyValue(varName).trim()
           || getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    cssVarCache[varName] = v;
    return v;
  }

  /* --- Tastaturguide --- */
  const KEY_NODES: Record<string, HTMLElement> = {};

  function buildKeyboard() {
    const rows: [keyof typeof KB_LAYOUT, string][] = [["top","kb-row-top"],["mid","kb-row-mid"],["bot","kb-row-bot"]];
    for (const [rk, rid] of rows) {
      const el = $(rid);
      el.innerHTML = "";
      for (const [ch, finger] of KB_LAYOUT[rk] as string[][]) {
        const k = document.createElement("div");
        k.className = `key f-${finger}`;
        k.dataset.k = ch;
        k.textContent = ch;
        el.appendChild(k);
        KEY_NODES[ch] = k;
      }
    }
    const sp = container.querySelector('.key.space') as HTMLElement;
    if (sp) KEY_NODES[" "] = sp;
  }

  let _lastActiveKey: string | null = null;

  function nextTargetChar(): string | null {
    if (!STATE.running || STATE.paused) return null;
    const active = STATE.blocks.find((b: { state: string; typed: number }) => b.state === "fall" && b.typed > 0);
    if (active && active.typed < active.text.length) return active.text[active.typed].toLowerCase();
    const falling = STATE.blocks.filter((b: { state: string }) => b.state === "fall");
    if (falling.length === 0) return null;
    falling.sort((a: { y: number }, b: { y: number }) => b.y - a.y);
    return falling[0].text[0].toLowerCase();
  }

  function updateKeyboardHighlight() {
    const ch = nextTargetChar();
    if (ch === _lastActiveKey) return;
    if (_lastActiveKey != null && KEY_NODES[_lastActiveKey]) {
      KEY_NODES[_lastActiveKey].classList.remove("active");
    }
    _lastActiveKey = ch;
    const hint   = $("finger-hint");
    const fhDot  = $("fh-dot");
    const fhText = $("fh-text");
    if (ch && KEY_NODES[ch]) {
      KEY_NODES[ch].classList.add("active");
      const info = KEY_INFO[ch] || {};
      hint.classList.add("has-target");
      fhDot.style.background  = `var(--finger-${info.finger || "thumb"})`;
      fhDot.style.boxShadow   = `0 0 8px var(--finger-${info.finger || "thumb"})`;
      if (ch === " ") {
        fhText.textContent = "Brug tommelfingeren — mellemrum";
      } else {
        const sideTxt   = info.side ? SIDE_NAME_DA[info.side] + " " : "";
        const fingerTxt = FINGER_NAME_DA[info.finger] || "finger";
        fhText.textContent = `Brug ${sideTxt}${fingerTxt} — ${ch.toUpperCase()}`;
      }
    } else {
      hint.classList.remove("has-target");
      fhDot.style.background = "var(--dim)";
      fhDot.style.boxShadow  = "none";
      fhText.textContent = "Brug fingrene fra hjemmerækken (asdf jkl)";
    }
  }

  function toggleKeyboard() {
    const kb = $("keyboard");
    if (kb) {
      kb.classList.toggle("hidden-kb");
      requestAnimationFrame(resizeCanvas);
    }
  }

  function setKeyboardVisible(visible: boolean) {
    const kb = $("keyboard");
    if (visible) kb.classList.remove("hidden-kb");
    else kb.classList.add("hidden-kb");
    requestAnimationFrame(resizeCanvas);
  }

  /* --- Blok-rendering --- */
  function fontSizeForBlock(text: string): number {
    const len = text.length;
    let size: number;
    if (len <= 2) size = Math.min(110, Math.max(56, cssW * 0.10));
    else if (len <= 6) size = Math.min(70, Math.max(38, cssW * 0.06));
    else if (len <= 14) size = Math.min(48, Math.max(28, cssW * 0.045));
    else size = Math.min(36, Math.max(20, cssW * 0.032));
    const maxW = cssW * 0.88;
    ctx.font = `600 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    while (size > 14 && ctx.measureText(text).width > maxW) {
      size -= 2;
      ctx.font = `600 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    }
    return size;
  }

  function makeBlock(text: string) {
    const fontSize = fontSizeForBlock(text);
    ctx.font = `600 ${fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    const width = ctx.measureText(text).width;
    const margin = 30;
    const x = margin + Math.random() * Math.max(10, cssW - 2 * margin - width);
    const y = -fontSize;
    const baseSpeed = STATE.level.baseSpeed + STATE.levelHits * STATE.level.speedInc;
    const speedMultiplier = opts?.speedMultiplier || 1.0;
    const speed = baseSpeed * speedMultiplier;
    return { text, typed: 0, x, y, fontSize, width, speed, state: "fall", explode: 0, shake: 0 };
  }

  function drawBlock(b: {text:string;typed:number;x:number;y:number;fontSize:number;shake:number}) {
    ctx.font = `600 ${b.fontSize}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    const shakeX = b.shake > 0 ? Math.sin(b.shake * 80) * 6 : 0;
    const active = b.typed > 0;
    if (active) {
      ctx.save();
      ctx.fillStyle = b.shake > 0 ? "rgba(255,92,122,0.18)" : "rgba(97,240,200,0.06)";
      const pad = 12; const r = 8;
      roundRect(ctx, b.x + shakeX - pad, b.y - pad/2, (b as unknown as {width:number}).width + 2*pad, b.fontSize + pad, r);
      ctx.fill();
      ctx.restore();
    }
    const text = b.text;
    let dx = b.x + shakeX;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (i < b.typed) {
        ctx.fillStyle = getCss("--typed");
        ctx.shadowColor = getCss("--typed");
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = getCss("--untyped");
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 4;
      }
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
    const size = Math.min(64, Math.max(28, b.fontSize * 0.9));
    ctx.font = `700 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = getCss("--accent2");
    ctx.shadowColor = getCss("--accent2");
    ctx.shadowBlur = 14;
    const w = ctx.measureText(txt).width;
    const cx = b.x + b.width / 2;
    ctx.fillText(txt, cx - w / 2, b.y);
    ctx.shadowBlur = 0;
  }

  function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    c.moveTo(x+r,y); c.lineTo(x+w-r,y);
    c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+h-r);
    c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    c.lineTo(x+r,y+h);
    c.quadraticCurveTo(x,y+h,x,y+h-r);
    c.lineTo(x,y+r);
    c.quadraticCurveTo(x,y,x+r,y);
    c.closePath();
  }

  /* --- Game loop --- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function update(dt: number, now: number) {
    const lvl = STATE.level;
    const fallingCount = STATE.blocks.filter((b: {state:string}) => b.state === "fall").length;
    if (fallingCount < lvl.maxBlocks && (now - STATE.lastSpawn) > lvl.spawnGap) {
      const lowest = STATE.blocks.filter((b: {state:string}) => b.state === "fall")
        .reduce((m: number, b: {y:number}) => Math.max(m, b.y), -Infinity);
      if (fallingCount === 0 || lowest > cssH * 0.20) {
        STATE.blocks.push(makeBlock(spawnNextItem()));
        STATE.lastSpawn = now;
      }
    }
    for (const b of STATE.blocks) {
      if (b.shake > 0) b.shake = Math.max(0, b.shake - dt);
      if (b.state === "fall") {
        b.y += b.speed * dt;
        if (b.y > cssH - 6) { b.state = "miss"; loseLife(b); }
      } else if (b.state === "explode") {
        b.explode += dt;
      }
    }
    STATE.blocks = STATE.blocks.filter((b: {state:string;explode:number}) => {
      if (b.state === "explode" && b.explode > 0.55) return false;
      if (b.state === "miss") return false;
      return true;
    });
    for (const p of STATE.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 380 * dt; p.life -= dt;
    }
    STATE.particles = STATE.particles.filter((p: {life:number}) => p.life > 0);
  }

  function render() {
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 92, 122, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(0, cssH - 3); ctx.lineTo(cssW, cssH - 3); ctx.stroke();
    ctx.restore();
    for (const b of STATE.blocks) {
      if (b.state === "fall") drawBlock(b);
      else if (b.state === "explode") drawExplosion(b);
    }
    for (const p of STATE.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    if (!STATE.running) return;
    const dt = Math.min(0.05, (now - STATE.lastFrame) / 1000);
    STATE.lastFrame = now;
    if (!STATE.paused) update(dt, now);
    render();
    updateKeyboardHighlight();
    requestAnimationFrame(frame);
  }

  /* --- Ord-picking --- */
  function currentLetterPool(): string[] {
    let wave = 0;
    for (let i = 0; i < LETTER_WAVES.length - 1; i++) {
      const prev = LETTER_WAVES[i];
      const minPrev = Math.min(...prev.map(l => STATE.letterCounts[l] || 0));
      if (minPrev >= 3) wave = i + 1; else break;
    }
    return LETTER_WAVES[wave];
  }

  function level1RemainingLetters(): string[] {
    return LEVEL1_TARGET_LETTERS.filter(l => (STATE.letterCounts[l] || 0) < LEVEL1_REQUIRED_HITS);
  }

  function isLevel1Complete(): boolean { return level1RemainingLetters().length === 0; }

  function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

  function spawnNextItem(): string {
    const lvl = STATE.level;
    if (lvl.mode === "letter") {
      const pool = currentLetterPool();
      if (Math.random() < 0.7) {
        let minC = Infinity;
        for (const l of pool) {
          const c = STATE.letterCounts[l] || 0;
          if (c < LEVEL1_REQUIRED_HITS && c < minC) minC = c;
        }
        if (minC === Infinity) return pickRandom(pool);
        const cands = pool.filter(l => (STATE.letterCounts[l] || 0) === minC);
        return cands[Math.floor(Math.random() * cands.length)];
      }
      return pickRandom(pool);
    }
    const src = lvl.src as string[];
    for (let tries = 0; tries < 5; tries++) {
      const cand = pickRandom(src);
      if (!STATE.blocks.some((b: {text:string}) => b.text === cand)) return cand;
    }
    return pickRandom(src);
  }

  /* --- Input --- */
  function keyToChar(e: KeyboardEvent): string | null {
    const k = e.key;
    if (k === " ") return " ";
    if (k.length === 1) return k;
    return null;
  }

  function handleKey(e: KeyboardEvent) {
    if (!STATE.running) return;
    if (e.key === "Escape") { togglePause(); e.preventDefault(); return; }
    if (e.key === "Tab") {
      if (!STATE.paused) STATE.paused = true;
      showStats(true); e.preventDefault(); return;
    }
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
      toggleKeyboard(); e.preventDefault(); return;
    }
    if (STATE.paused) return;
    const ch = keyToChar(e);
    if (!ch) return;
    const active = STATE.blocks.find((b: {state:string;typed:number}) => b.state === "fall" && b.typed > 0);
    if (active) {
      const next = active.text[active.typed];
      if (next === ch) {
        active.typed += 1;
        if (ch !== " ") { awardPoint(); recordLetter(ch); }
        checkComplete(active);
      } else { wrongKey(ch, active); }
      e.preventDefault(); return;
    }
    const candidates = STATE.blocks.filter((b: {state:string;text:string}) => b.state === "fall" && b.text[0] === ch);
    if (candidates.length === 0) {
      if (STATE.blocks.some((b: {state:string}) => b.state === "fall")) wrongKey(ch, null);
      return;
    }
    candidates.sort((a: {y:number}, b: {y:number}) => b.y - a.y);
    const target = candidates[0];
    target.typed = 1;
    if (ch !== " ") { awardPoint(); recordLetter(ch); }
    checkComplete(target);
    e.preventDefault();
  }

  function recordLetter(ch: string) {
    const k = ch.toLowerCase();
    STATE.letterCounts[k] = (STATE.letterCounts[k] || 0) + 1;
  }

  function wrongKey(typedCh: string, activeBlock: {shake:number} | null) {
    if (STATE.score > 0) STATE.score -= 1;
    STATE.totalLevelMissed += 1;
    updateHud();
    const flash = $("wrong-flash");
    if (flash) { flash.classList.remove("flash"); void flash.offsetWidth; flash.classList.add("flash"); }
    const m1 = $("minus-one");
    if (m1) { m1.classList.remove("show"); void m1.offsetWidth; m1.classList.add("show"); }
    if (typedCh && typedCh !== " ") {
      const node = KEY_NODES[typedCh.toLowerCase()];
      if (node) { node.classList.add("wrong-key"); setTimeout(() => node.classList.remove("wrong-key"), 220); }
    }
    if (activeBlock) activeBlock.shake = 0.28;
  }

  function awardPoint() {
    STATE.score += 1;
    STATE.totalLevelLetters += 1;
    STATE.pointsToNextLife -= 1;
    if (STATE.pointsToNextLife <= 0 && STATE.lives < MAX_LIVES) {
      STATE.lives += 1; STATE.pointsToNextLife = POINTS_PER_LIFE; toast("+1 liv!");
    } else if (STATE.pointsToNextLife <= 0) {
      STATE.pointsToNextLife = POINTS_PER_LIFE;
    }
    updateHud();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function checkComplete(b: any) {
    if (b.typed >= b.text.length) {
      explodeBlock(b);
      STATE.levelHits += 1;
      let done = false;
      if (STATE.level.id === 1) done = isLevel1Complete();
      else done = STATE.levelHits >= STATE.level.target;
      if (done) setTimeout(() => endRun("complete"), 600);
      updateHud();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function explodeBlock(b: any) {
    b.state = "explode"; b.explode = 0;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.fontSize / 2;
    const colors = [getCss("--accent"), getCss("--accent2"), "#ffffff"];
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 240;
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
      const a = -Math.PI/2 + (Math.random()-0.5)*Math.PI;
      const sp = 80 + Math.random()*180;
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
    let progressTxt: string;
    if (STATE.level && STATE.level.id === 1) {
      const mastered = LEVEL1_TARGET_LETTERS.length - level1RemainingLetters().length;
      progressTxt = `${mastered}/${LEVEL1_TARGET_LETTERS.length} bogstaver klar`;
    } else if (STATE.level) {
      const left = Math.max(0, STATE.level.target - STATE.levelHits);
      progressTxt = `${left} tilbage`;
    } else progressTxt = "";
    const nl = STATE.lives < MAX_LIVES
      ? `Næste liv om ${STATE.pointsToNextLife} · ${progressTxt}`
      : `Liv fyldt · ${progressTxt}`;
    $("hud-nextlife").textContent = nl;
  }

  /* --- Skærme --- */
  const SCREENS = ["menu","stats","pause","levelup","gameover","tutorial"];
  function hideAll() {
    for (const s of SCREENS) $("screen-" + s)?.classList.add("hidden");
  }
  function show(s: string) {
    hideAll();
    $("screen-" + s)?.classList.remove("hidden");
  }

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
      div.className = "lvl" + (locked ? " locked" : "");
      div.innerHTML = `<div class="num">${lvl.id}</div><div class="lbl">${lvl.name}</div>`;
      if (!locked) div.addEventListener("click", () => startLevel(lvl.id));
      grid.appendChild(div);
    }
    ($("btn-menu-play") as HTMLButtonElement).onclick = () => startLevel(highest);
  }

  function buildTutorialContent() {
    const legend = $("tutorial-legend");
    legend.innerHTML = "";
    const items = [["pinky","Lillefinger"],["ring","Ringfinger"],["middle","Langemand"],["index","Pegefinger"],["thumb","Tommelfinger (mellemrum)"]];
    for (const [f, name] of items) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:10px; font-size:13px;";
      row.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--finger-${f});box-shadow:0 0 8px var(--finger-${f});"></span><span>${name}</span>`;
      legend.appendChild(row);
    }
    const kbWrap = $("tutorial-kb");
    kbWrap.innerHTML = "";
    const rowDefs: [keyof typeof KB_LAYOUT, string][] = [["top","r-top"],["mid","r-mid"],["bot","r-bot"]];
    for (const [rk, cls] of rowDefs) {
      const row = document.createElement("div");
      row.className = "kb-row " + cls;
      for (const [ch, finger] of KB_LAYOUT[rk] as string[][]) {
        const k = document.createElement("div");
        k.className = `key f-${finger}`; k.textContent = ch; row.appendChild(k);
      }
      kbWrap.appendChild(row);
    }
    const spcRow = document.createElement("div");
    spcRow.className = "kb-row r-spc";
    spcRow.innerHTML = `<div class="key f-thumb space">mellemrum</div>`;
    kbWrap.appendChild(spcRow);
  }

  function showTutorial(onClose: () => void) {
    buildTutorialContent();
    show("tutorial");
    ($("btn-tutorial-go") as HTMLButtonElement).onclick = () => {
      if (STATE.stats) STATE.stats.tutorialSeen = true;
      onClose && onClose();
    };
    ($("btn-tutorial-skip") as HTMLButtonElement).onclick = () => {
      if (STATE.stats) STATE.stats.tutorialSeen = true;
      onClose && onClose();
    };
  }

  function showStats(returnToGame: boolean) {
    show("stats");
    $("stats-name").textContent = STATE.player;
    const o = $("stats-overall");
    const s = STATE.stats;
    const acc = s.totalLetters + s.totalMissed > 0
      ? Math.round((s.totalLetters / (s.totalLetters + s.totalMissed)) * 100) + "%"
      : "—";
    o.innerHTML = `
      <div class="stat-row"><span class="k">Højeste niveau</span><span class="v">${s.highestLevel}</span></div>
      <div class="stat-row"><span class="k">Samlet point</span><span class="v">${s.totalScore}</span></div>
      <div class="stat-row"><span class="k">Bogstaver skrevet</span><span class="v">${s.totalLetters}</span></div>
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
    if (h) return `${h}t ${m}m`;
    if (m) return `${m}m ${ss}s`;
    return `${ss}s`;
  }

  function showLevelup() {
    show("levelup");
    $("levelup-text").textContent = `Niveau ${STATE.level.id} klaret`;
    $("levelup-summary").textContent =
      `${STATE.score} point · ${STATE.totalLevelLetters} bogstaver · ${STATE.lives} liv tilbage`;
    const next = LEVELS.find(l => l.id === STATE.level.id + 1);
    ($("btn-levelup-next") as HTMLButtonElement).style.display = next ? "" : "none";
    ($("btn-levelup-next") as HTMLButtonElement).onclick = () => next && startLevel(next.id);
  }

  function showGameover() {
    show("gameover");
    $("gameover-summary").textContent =
      `${STATE.score} point · ${STATE.totalLevelLetters} bogstaver · niveau ${STATE.level.id}`;
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
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove("show"), 1200);
  }

  /* --- Spilflow --- */
  function startLevel(levelId: number) {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    if (lvl.id === 1 && STATE.stats && !STATE.stats.tutorialSeen) {
      showTutorial(() => actuallyStartLevel(levelId));
      return;
    }
    actuallyStartLevel(levelId);
  }

  function actuallyStartLevel(levelId: number) {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    STATE.level = lvl;
    STATE.levelHits = 0;
    STATE.totalLevelLetters = 0;
    STATE.totalLevelMissed = 0;
    STATE.score = 0;
    STATE.lives = MAX_LIVES;
    STATE.pointsToNextLife = POINTS_PER_LIFE;
    STATE.blocks = [];
    STATE.particles = [];
    STATE.letterCounts = {};
    STATE.lastSpawn = 0;
    STATE.runStart = performance.now();
    getLevelStats(lvl.id).plays += 1;
    STATE.running = true;
    STATE.paused = false;
    setKeyboardVisible(lvl.id <= 4);
    hideAll();
    updateHud();
    resizeCanvas();
    STATE.lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function endRun(reason: string) {
    STATE.running = false;
    const elapsed = (performance.now() - STATE.runStart) / 1000;
    STATE.stats.totalSeconds += elapsed;
    STATE.stats.totalLetters += STATE.totalLevelLetters;
    STATE.stats.totalMissed  += STATE.totalLevelMissed;
    STATE.stats.totalScore   += STATE.score;
    STATE.stats.totalBlocks  += STATE.levelHits;
    STATE.stats.lastPlayed = Date.now();
    const ls = getLevelStats(STATE.level.id);
    ls.hits += STATE.levelHits; ls.score += STATE.score;
    if (STATE.score > ls.best) ls.best = STATE.score;
    if (reason === "complete") {
      ls.completed += 1;
      onLevelComplete({
        gameType: "keyboard",
        levelId: STATE.level.id,
        score: STATE.score,
        lettersCorrect: STATE.totalLevelLetters,
        lettersWrong: STATE.totalLevelMissed,
        durationMs: Math.round(performance.now() - STATE.runStart),
        completed: true,
      });
      if (STATE.level.id >= STATE.stats.highestLevel) {
        STATE.stats.highestLevel = Math.min(LEVELS.length, STATE.level.id + 1);
      }
      saveStats();
      showLevelup();
    } else {
      saveStats();
      showGameover();
    }
  }

  /* --- Knapopsætning --- */
  ($("btn-menu-stats") as HTMLButtonElement).addEventListener("click", () => showStats(false));
  ($("btn-menu-name") as HTMLButtonElement).addEventListener("click", () => showMenu());  // "skift navn" ikke relevant her — bare gå til menu
  ($("btn-menu-tutorial") as HTMLButtonElement).addEventListener("click", () => showTutorial(showMenu));
  ($("btn-stats-reset") as HTMLButtonElement).addEventListener("click", () => {
    if (!confirm("Nulstil alle stats for " + STATE.player + "?")) return;
    STATE.stats = newStatsFor(STATE.player);
    saveStats();
    showMenu();
  });
  ($("btn-pause-resume") as HTMLButtonElement).addEventListener("click", () => togglePause());
  ($("btn-pause-quit") as HTMLButtonElement).addEventListener("click", () => { STATE.running = false; showMenu(); });
  ($("btn-levelup-menu") as HTMLButtonElement).addEventListener("click", () => showMenu());
  ($("btn-gameover-menu") as HTMLButtonElement).addEventListener("click", () => showMenu());
  ($("kb-toggle") as HTMLButtonElement).addEventListener("click", toggleKeyboard);

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

  /* --- Cleanup --- */
  return () => {
    STATE.running = false;
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keydown", handleKey);
    if (_toastTimer) clearTimeout(_toastTimer);
  };
}
