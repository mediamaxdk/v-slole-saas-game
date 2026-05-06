import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility til at kombinere Tailwind-klasser uden konflikter */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generér en tilfældig 6-cifret klassekode (undgår 0 og O for læsbarhed) */
export function generateGroupCode(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Formater point til dansk talformat */
export function formatScore(score: number): string {
  return score.toLocaleString("da-DK");
}

/** Formater varighed i ms til læsbar streng */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return `${seconds} sek`;
  return `${minutes}:${String(seconds % 60).padStart(2, "0")} min`;
}

/** Anti-cheat: max bogstaver per sekund (6 = ~360 ord/min — urealistisk for barn) */
export const MAX_LETTERS_PER_SECOND = 6;

/** Valider at en score er fysisk mulig */
export function isScorePlausible(opts: {
  lettersCorrect: number;
  lettersWrong: number;
  durationMs: number;
  score: number;
}): boolean {
  const { lettersCorrect, lettersWrong, durationMs, score } = opts;
  const durationSec = durationMs / 1000;

  // Score kan aldrig være højere end korrekte tegn
  if (score > lettersCorrect) return false;

  // Samlet antal tastetryk kan ikke overstige fysisk maximum
  const totalKeys = lettersCorrect + lettersWrong;
  if (totalKeys > durationSec * MAX_LETTERS_PER_SECOND) return false;

  // Score kan ikke være negativ
  if (score < 0) return false;

  // Varighed skal være positiv
  if (durationMs <= 0) return false;

  return true;
}
