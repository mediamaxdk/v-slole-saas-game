"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NyKlassePage() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/klasse", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: name.trim() }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Noget gik galt. Prøv igen.");
      return;
    }

    router.push(`/dashboard/klasse/${json.klasse.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link href="/dashboard/klasse" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
          ← Mine klasser
        </Link>

        <h1 className="text-2xl font-black mb-1">Opret ny klasse</h1>
        <p className="text-gray-500 text-sm mb-8">
          Der genereres automatisk en tilmeldingskode.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Klassenavn
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 transition text-base"
              placeholder="5.A — Matematik 2025/26"
              maxLength={60}
              autoFocus
            />
            <span className="text-xs text-gray-400">Fx: "5.A", "Hold 2 Dansk", "Matematik 6.B"</span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || name.trim().length < 2}
            className="mt-2 w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Opretter…" : "Opret klasse"}
          </button>
        </form>
      </div>
    </main>
  );
}
