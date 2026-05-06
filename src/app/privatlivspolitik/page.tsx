import Header from "@/components/Header";

export default function PrivatlivspolitikPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8">
            Privatlivspolitik
          </h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Gældende fra:</strong> 6. maj 2026<br/>
            <strong>Version:</strong> 1.0
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Hvem vi er</h2>
              <p className="text-gray-600 leading-relaxed">
                Tastatur Helten er en gratis læringsplatform udviklet af v-skole.dk. 
                Vi tilbyder tastatræning til elever i danske skoler gennem spilbaseret læring.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Hvilke data vi indsamler</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Nødvendige data for konto:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Navn (valgfrit)</li>
                    <li>Email-adresse</li>
                    <li>Rolle (elev, lærer, offentlig bruger)</li>
                    <li>Registreringstidspunkt</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Spil-data:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Point og scores pr. niveau</li>
                    <li>Antal korrekte/fejl-trykninger</li>
                    <li>Tid brugt pr. spil</li>
                    <li>Niveauer fuldført</li>
                    <li>Tidspunkt for spil</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Tekniske data:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Login-sessions (for at holde dig logget ind)</li>
                    <li>Browser-type og version (for teknisk support)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Hvorfor vi indsamler data</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">For at drive platformen:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Brugerkonto og login</li>
                    <li>Gemme spil-progress</li>
                    <li>Vise leaderboards og statistikker</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">For at forbedre produktet:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Analysere spil-mønstre for at optimere sværhedsgrad</li>
                    <li>Identificere tekniske problemer</li>
                    <li>Udvikle nye features baseret på brugeradfærd</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Databehandling og opbevaring</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Hosting:</strong> Alle data hostes i EU hos Neon (PostgreSQL database).
                </p>
                <p>
                  <strong>Opbevaringstid:</strong> Brugerkonto og spil-data opbevares så længe kontoen er aktiv.
                  Inaktive konti slettes automatisk efter 2 år.
                </p>
                <p>
                  <strong>Sikkerhed:</strong> Data krypteres under transmission (HTTPS) og i databasen.
                  Adgang til data er begrænset til nødvendigt personale.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Dine rettigheder (GDPR)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ret til indsigt:</h3>
                  <p className="text-gray-600">
                    Du kan til enhver tid anmode om at se, hvilke data vi har om dig.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ret til berigtigelse:</h3>
                  <p className="text-gray-600">
                    Du kan få rettet forkerte data ved at kontakte os.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ret til sletning:</h3>
                  <p className="text-gray-600">
                    Du kan bede om at få din konto og tilhørende data slettet.
                    Leaderboard-data anonymiseres i stedet for at slettes for at bevare integriteten.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ret til dataportabilitet:</h3>
                  <p className="text-gray-600">
                    Du kan få udleveret dine data i et maskinlæsbart format (CSV).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Deling af data</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Vi deler IKKE dine personlige data med tredjeparter,</strong> undtagen:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email-service (Resend) til udsendelse af verifikationslinks</li>
                  <li>Hosting-udbyder (Neon) for database-opbevaring</li>
                  <li>Analytics-udbyder (kun anonymiseret brugsstatistik)</li>
                </ul>
                <p>
                  Leaderboard-data er offentligt tilgængelige for alle brugere af platformen,
                  men viser kun brugernavn og point - ingen personlige oplysninger.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Vi bruger kun nødvendige cookies for at:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Holde dig logget ind (session cookie)</li>
                  <li>Huske dine præferencer</li>
                  <li>Sikre teknisk funktionalitet</li>
                </ul>
                <p>
                  Vi bruger IKKE tracking-cookies, marketing-cookies eller tredjeparts-cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Børn under 13 år</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  For elever under 13 år gælder særlige regler:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Lærere skal bekræfte at have forældresamtykke</li>
                  <li>Kun minimal data indsamles (navn, klasse, spil-resultater)</li>
                  <li>Ingen personlige kontaktoplysninger gemmes for elever</li>
                  <li>Forældre kan til enhver tid anmode om at se eller slette deres barns data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Kontakt os</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Har du spørgsmål til denne privatlivspolitik eller ønsker du at gøre brug af dine rettigheder?
                </p>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Email:</strong> info@mediamax.dk
                  </p>
                  <p>
                    <strong>Hjemmeside:</strong> https://spil.v-skole.dk
                  </p>
                  <p>
                    <strong>Svar tid:</strong> Typisk inden for 24 timer
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Opdateringer</h2>
              <p className="text-gray-600">
                Vi opdaterer denne privatlivspolitik ved væsentlige ændringer. 
                Alle ændringer vil blive annonceret på platformen og datoen for "Gældende fra" vil blive opdateret.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Denne privatlivspolitik er udarbejdet i overensstemmelse med GDPR og dansk databeskyttelseslov.
              Gælder for Tastatur Helten på https://spil.v-skole.dk.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
