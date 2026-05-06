"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function TilmeldClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session, isPending } = useSession();

  const [kode, setKode]           = useState(searchParams.get("kode")?.toUpperCase() ?? "");
  const [preview, setPreview]     = useState<string | null>(null);
  const [previewFejl, setPreviewFejl] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  // Auto-forhåndsvis hvis kode kom fra URL
  useEffect(() => {
    const urlKode = searchParams.get("kode")?.toUpperCase();
    if (urlKode && urlKode.length >= 4) {
      slaOpKode(urlKode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function slaOpKode(k: string) {
    setPreview(null); setPreviewFejl(false);
    const res = await fetch(`/api/tilmeld?kode=${encodeURIComponent(k)}`);
    if (res.ok) {
      const json = await res.json();
      setPreview(json.klasse.name);
    } else {
      setPreviewFejl(true);
    }
  }

  function handleKodeChange(v: string) {
    const upper = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setKode(upper);
    setPreview(null); setPreviewFejl(false); setError(null);
    if (upper.length >= 4) slaOpKode(upper);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/login?redirect=/tilmeld?kode=${kode}`);
      return;
    }
    setError(null); setLoading(true);

    const res = await fetch("/api/tilmeld", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ kode }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Noget gik galt.");
      return;
    }

    setSuccess(json.klasseName);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black mb-2">Du er tilmeldt!</h1>
          <p className="text-gray-500 mb-8">
            Du er nu en del af <strong>{success}</strong>.
          </p>
          <Link
            href="/spil"
            className="block w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-center"
          >
            Gå til spillet →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link href="/" className="block text-2xl font-black text-brand-700 mb-8">
          ⌨️ Tastatur Helten
        </Link>

        <h1 className="text-2xl font-black mb-1">Tilmeld dig en klasse</h1>
        <p className="text-gray-500 text-sm mb-6">
          Indtast den 6-cifrede kode fra din lærer.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Klassekode
            <input
              type="text"
              required
              value={kode}
              onChange={(e) => handleKodeChange(e.target.value)}
              className="px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 transition text-2xl font-mono text-center tracking-widest uppercase"
              placeholder="XXXXXX"
              maxLength={10}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          {/* Forhåndsvis */}
          {preview && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium flex items-center gap-2">
              <span>✓</span>
              <span>Klasse fundet: <strong>{preview}</strong></span>
            </div>
          )}
          {previewFejl && kode.length >= 4 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              Koden findes ikke eller er udløbet.
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          {!isPending && !session?.user && (
            <p className="text-xs text-gray-400 text-center">
              Du skal{" "}
              <Link href={`/login?redirect=/tilmeld?kode=${kode}`} className="text-brand-600 underline">
                logge ind
              </Link>{" "}
              for at tilmelde dig.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || kode.length < 4 || previewFejl}
            className="mt-2 w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Tilmelder…" : session?.user ? "Tilmeld mig" : "Log ind og tilmeld"}
          </button>
        </form>
      </div>
    </main>
  );
}
