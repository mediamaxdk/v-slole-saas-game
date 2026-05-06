"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { validateDisplayName } from "@/lib/profanity";

export default function RegisterPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isTeacher    = searchParams.get("role") === "teacher";

  const [name, setName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [role, setRole]               = useState<"public" | "teacher">(
    isTeacher ? "teacher" : "public"
  );
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Valider display-navn
    const nameError = validateDisplayName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (password.length < 8) {
      setError("Adgangskoden skal være mindst 8 tegn.");
      return;
    }

    setLoading(true);

    const result = await signUp.email({
      email,
      password,
      name: name,
    });

    if (result.error) {
      if (result.error.code === "USER_ALREADY_EXISTS") {
        setError("Der findes allerede en konto med den email.");
      } else {
        setError("Noget gik galt. Prøv igen.");
      }
      setLoading(false);
      return;
    }

    // Sæt rolle hvis ikke "public"
    if (role !== "public") {
      await fetch("/api/user/rolle", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rolle: role }),
      }).catch(() => null); // fejl her er ikke kritisk — kan rettes fra dashboard
    }

    router.push(role === "teacher" ? "/dashboard" : "/spil?welcome=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-bold mb-2">Opret konto</h1>
        <p className="text-sm text-gray-500 mb-6">Det er gratis 🎉</p>

        {/* Rolle-valg */}
        <div className="flex gap-2 mb-6">
          {(["public", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === r
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "public" ? "🎮 Elev / spiller" : "📋 Lærer"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Dit navn (vises på leaderboard)
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
              placeholder="Tastehelt99"
              maxLength={30}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
              placeholder="dig@skole.dk"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Adgangskode
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
              placeholder="Mindst 8 tegn"
              minLength={8}
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Opretter konto…" : "Opret konto"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Ved at oprette en konto accepterer du vores{" "}
          <Link href="/privatlivspolitik" className="underline">privatlivspolitik</Link>.
        </p>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Har du allerede en konto?{" "}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            Log ind
          </Link>
        </p>
      </div>
    </div>
  );
}
