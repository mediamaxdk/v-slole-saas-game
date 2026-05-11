"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!token) {
      setError("Ugyldigt nulstillingslink.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Adgangskoder er ikke ens.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        setError("Der opstod en fejl. Prøv venligst igen.");
        setLoading(false);
        return;
      }

      setSuccess("Din adgangskode er blevet nulstillet. Du kan nu logge ind.");
      setLoading(false);
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err) {
      setError("Der opstod en fejl. Prøv venligst igen.");
      setLoading(false);
    }
  }

  const invalidTokenContent = (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-bold mb-6">Ugyldigt link</h1>
        <p className="text-gray-600">
          Nulstillingslinket er ugyldigt eller udløbet. Prøv at anmode en ny.
        </p>
          
        <div className="mt-6 text-center">
          <Link href="/glemt-adgangskode" className="text-sm text-brand-600 font-medium hover:underline">
            Anmod om ny nulstillingslink
          </Link>
        </div>
      </div>
    </div>
  );

  const resetFormContent = (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-bold mb-6">Nulstil adgangskode</h1>
        <p className="text-gray-600 mb-6">
          Indtast din nye adgangskode nedenfor.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Ny adgangskode *
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Bekræft ny adgangskode *
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="••••"
            />
          </div>

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
            {loading ? "Nulstiller..." : "Nulstil adgangskode"}
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

  const content = token ? resetFormContent : invalidTokenContent;

  return content;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
