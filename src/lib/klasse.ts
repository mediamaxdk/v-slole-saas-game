import { db, groups } from "@/db";
import { eq } from "drizzle-orm";

// Kode-alfabet: ingen 0, O, I eller l for at undgå forveksling
const KODE_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const KODE_LAENGDE = 6;

export function genererKode(): string {
  let kode = "";
  for (let i = 0; i < KODE_LAENGDE; i++) {
    kode += KODE_CHARS[Math.floor(Math.random() * KODE_CHARS.length)];
  }
  return kode;
}

// Genererer en kode der ikke allerede er i brug (max 10 forsøg)
export async function genererUnikKode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const kode = genererKode();
    const existing = await db
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.code, kode))
      .limit(1);
    if (existing.length === 0) return kode;
  }
  // Statistisk set umuligt at nå hertil ved normal brug
  throw new Error("Kunne ikke generere unik klassekode");
}
