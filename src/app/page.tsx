import Link from "next/link";

/**
 * Landingsside — TODO: udbygges i Fase 6
 * Foreløbig: simpel splash med CTA og mini-demo-knap
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-black text-brand-700">⌨️ Tastatur Helten</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Log ind
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Opret konto
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-6 text-balance">
          Lær at taste med alle ti fingre
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto text-balance">
          Tastatur Helten er et gratis tastespil til skoler. Elever konkurrerer
          på klasse-leaderboardet, og læreren kan følge fremgangen i sit dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/spil"
            className="px-8 py-4 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Prøv spillet gratis →
          </Link>
          <Link
            href="/register?role=teacher"
            className="px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-xl border-2 border-brand-200 hover:border-brand-400 transition-colors"
          >
            Jeg er lærer
          </Link>
        </div>
      </section>

      {/* Feature-kort — udbygges */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          { icon: "🏆", title: "Leaderboard", text: "Elever dyster om toppen i klassen og på det offentlige leaderboard." },
          { icon: "📊", title: "Lærer-dashboard", text: "Se alle elevers fremgang, bedste scorer og aktivitet på ét sted." },
          { icon: "🎮", title: "To spil", text: "Tastatur Helten (bogstaver) og Gange Helten (gangetabeller) — begge inkluderet." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Kontakt / whitelabel */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">Vil du have Tastatur Helten på din skoles domæne?</h2>
          <p className="text-brand-200 mb-8">
            Vi tilbyder whitelabel-udgaver til skoler og kommuner med eget logo, domæne og tema.
          </p>
          <Link
            href="/kontakt"
            className="px-8 py-4 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Kontakt os
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        © {new Date().getFullYear()} Tastatur Helten · Gratis og{" "}
        <a href="https://github.com" className="underline hover:text-gray-600">open source</a>
        {" "}·{" "}
        <Link href="/privatlivspolitik" className="underline hover:text-gray-600">Privatlivspolitik</Link>
      </footer>
    </main>
  );
}
