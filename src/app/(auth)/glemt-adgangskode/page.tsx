"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError("Der opstod en fejl. Prøv venligst igen.");
        setLoading(false);
        return;
      }

      setSuccess("Vi har sendt en link til nulstilling af adgangskode til din email.");
      setLoading(false);
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-bold mb-6">Glemt adgangskode</h1>
        <p className="text-sm text-gray-600 mb-6">
          Indtast din email adresse, så sender vi dig et link til at nulstille din adgangskode.
        </p>

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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="mt-2 w-full py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Sender..." : "Send nulstillingslink"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-brand-600 font-medium hover:underline">
            ← Tilbage til login
          </Link>
        </div>
      </div>
    </div>
  );
}
