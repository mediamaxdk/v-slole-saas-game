import Header from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import { Trophy, BarChart2, Gamepad2, School, FileText, Palette, Lock, TrendingUp, Users, CheckCircle } from "lucide-react";

/**
 * Landingsside — Marketing page med whitelabel kontaktformular
 * Professionel design med trust indicators og CTA'er
 */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <Header />

      {/* Hero */}
      <section className="bg-brand-700 text-white py-24 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Gratis for alle skoler og elever
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 text-balance">
          Lær at taste med alle ti fingre
        </h1>
        
        <p className="text-xl text-brand-100 mb-8 max-w-3xl mx-auto text-balance leading-relaxed">
          Tastatur Helten er et engagerende tastespil designet til danske skoler. 
          Elever motiveres af klasse-leaderboards, mens lærere får detaljeret indsigt 
          i fremgangen gennem et intuitivt dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/spil"
            className="px-8 py-4 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            <Gamepad2 className="w-5 h-5 inline mr-2" />
            Prøv spillet gratis →
          </Link>
          <Link
            href="/register?role=teacher"
            className="px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-xl border-2 border-brand-200 hover:border-brand-400 transition-colors"
          >
            <Users className="w-5 h-5 inline mr-2" />
            Opret lærerkonto
          </Link>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm text-brand-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Ingen installation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Dansk udviklet</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>GDPR-sikkert</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Mobilvenligt</span>
          </div>
        </div>

        {/* Product screenshot mockup */}
        <div className="mt-16 relative mx-auto max-w-4xl">
          {/* Browser chrome */}
          <div className="bg-gray-100 rounded-t-xl px-4 py-3 flex items-center gap-2 border border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 text-center">
              spil.v-skole.dk/spil
            </div>
          </div>
          {/* Screenshot */}
          <div className="border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-2xl shadow-brand-100">
            <Image
              src="/screenshots/gameplay.svg"
              alt="Tastatur Helten spilskærm"
              width={1200}
              height={700}
              className="w-full"
            />
          </div>
        </div>
        </div>
      </section>

      {/* Feature-kort — udbygges */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {[
          { icon: Trophy, title: "Leaderboard", text: "Elever dyster om toppen i klassen og på det offentlige leaderboard." },
          { icon: BarChart2, title: "Lærer-dashboard", text: "Se alle elevers fremgang, bedste scorer og aktivitet på ét sted." },
          { icon: Gamepad2, title: "To spil", text: "Tastatur Helten (bogstaver) og Gange Helten (gangetabeller) — begge inkluderet." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.text}</p>
          </div>
        ))}
        </div>
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
              <School className="w-5 h-5 inline mr-2" />
            Forespørg whitelabel
            </Link>
            <Link
              href="/privatlivspolitik"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-brand-900 transition-colors"
            >
              <FileText className="w-5 h-5 inline mr-2" />
            Læs om GDPR
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-brand-300">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Eget logo & design</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="w-4 h-4" />
              <span>Eget domæne</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              <span>Fuld data-adgang</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
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
