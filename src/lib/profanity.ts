/**
 * Profanitetsfilter til display-navne.
 *
 * Strategi:
 * 1. Normalisér input (lowercase, fjern mellemrum/special-tegn, l33t-substitution)
 * 2. Exact match mod ordliste
 * 3. Levenshtein-distance ≤ 1 mod ordliste (fanger simple stavevarianter)
 */

// Startliste — udvid løbende efter moderationsrapporter
const BANNED_WORDS: string[] = [
  // Dårlige ord (eksempler — tilføj rigtig liste)
  "fuck", "fisse", "pik", "røv", "lort", "kælling", "idiot", "stupid",
  "retard", "homo", "bøsse", "luder", "hore", "neger", "perker",
  // Varianter tilføjes automatisk via Levenshtein
];

/** l33t-speak substitutioner */
const L33T_MAP: Record<string, string> = {
  "4": "a", "@": "a",
  "3": "e",
  "1": "i", "!": "i",
  "0": "o",
  "5": "s", "$": "s",
  "7": "t",
  "+": "t",
};

function normalise(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => L33T_MAP[c] ?? c)
    .join("")
    .replace(/[^a-zæøå]/g, "") // fjern ikke-bogstaver
    .replace(/(.)\1{2,}/g, "$1$1"); // kollaps gentagelser (fuuuck → fuuck)
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99; // tidlig afvisning
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Returnerer true hvis display-navnet er uacceptabelt.
 * Soft-block: vis aldrig årsagen til brugeren.
 */
export function isProfane(displayName: string): boolean {
  const normalised = normalise(displayName);

  for (const word of BANNED_WORDS) {
    const normWord = normalise(word);

    // Exact match
    if (normalised.includes(normWord)) return true;

    // Levenshtein ≤ 1 (kun mod ord af lignende længde)
    if (Math.abs(normalised.length - normWord.length) <= 1) {
      if (levenshtein(normalised, normWord) <= 1) return true;
    }
  }

  return false;
}

/**
 * Valider et display-navn.
 * Returnerer fejlbesked hvis ugyldig, ellers null.
 */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length < 2)  return "Navnet skal være mindst 2 tegn.";
  if (trimmed.length > 30) return "Navnet må ikke være længere end 30 tegn.";
  if (!/^[\w\sæøåÆØÅ\-'.]+$/u.test(trimmed))
    return "Navnet indeholder ugyldige tegn.";
  if (isProfane(trimmed))
    return "Vælg venligst et andet navn.";

  return null;
}
