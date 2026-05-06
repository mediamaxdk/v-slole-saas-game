import Header from "@/components/Header";
import Link from "next/link";

/**
 * Landingsside — TODO: udbygges i Fase 6
 * Foreløbig: simpel splash med CTA og mini-demo-knap
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Navbar */}
      <Header />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></span>
            Gratis for alle skoler og elever
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 text-balance">
          Lær at taste med alle ti fingre
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance leading-relaxed">
          Tastatur Helten er et engagerende tastespil designet til danske skoler. 
          Elever motiveres af klasse-leaderboards, mens lærere får detaljeret indsigt 
          i fremgangen gennem et intuitivt dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/spil"
            className="px-8 py-4 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            🎮 Prøv spillet gratis →
          </Link>
          <Link
            href="/register?role=teacher"
            className="px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-xl border-2 border-brand-200 hover:border-brand-400 transition-colors"
          >
            👨‍🏫 Opret lærerkonto
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Ingen installation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Dansk udviklet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>GDPR-sikkert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Mobilvenligt</span>
          </div>
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
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">Få Tastatur Helten på jeres skole</h2>
          <p className="text-brand-200 mb-8 text-lg">
            Whitelabel-løsninger til skoler og kommuner med eget logo, domæne og tilpasset design. 
            Fuld kontrol over data og GDPR-sikkerhed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kontakt"
              className="px-8 py-4 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition-colors"
            >
              🏫 Forespørg whitelabel
            </Link>
            <Link
              href="/privatlivspolitik"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-brand-900 transition-colors"
            >
              📋 Læs om GDPR
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-brand-300">
            <div className="flex items-center gap-2">
              <span>🎨</span>
              <span>Eget logo & design</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏫</span>
              <span>Eget domæne</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Fuld data-adgang</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>GDPR-kompatibelt</span>
            </div>
          </div>
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
