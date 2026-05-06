"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError("Forkert email eller adgangskode.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-bold mb-6">Log ind</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="••••••••"
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
            {loading ? "Logger ind…" : "Log ind"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500 text-center">
          <Link href="/glemt-adgangskode" className="hover:text-brand-600 underline">
            Glemt adgangskode?
          </Link>
          <span>
            Har du ikke en konto?{" "}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">
              Opret konto
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
