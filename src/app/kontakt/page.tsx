import KontaktForm from "@/components/KontaktForm";
import Header from "@/components/Header";

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Whitelabel for skoler
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Få Tastatur Helten på jeres eget domæne med eget logo og tilpasset design.
          </p>
        </div>

        <KontaktForm />

        {/* Information section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🎨",
              title: "Eget design",
              description: "Jeres skoles logo, farver og branding integreret i spillet."
            },
            {
              icon: "🏫",
              title: "Eget domæne",
              description: "F.eks. tastatur.jeresskole.dk - professionelt og let at huske."
            },
            {
              icon: "📊",
              title: "Fuld kontrol",
              description: "Adgang til alle elevers statistikker og mulighed for at administrere klasser."
            },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* FAQ section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Ofte stillede spørgsmål</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                q: "Hvad koster en whitelabel-løsning?",
                a: "Prisen afhænger af skolens størrelse og behov. Kontakt os for et uforpligtende tilbud."
              },
              {
                q: "Hvor lang tid tager opsætning?",
                a: "Typisk 1-2 uger fra godkendelse til lancering, afhængigt af kompleksiteten."
              },
              {
                q: "Kan vi tilpasse spil-indhold?",
                a: "Ja! Vi kan tilpasse tekster, sværhedsgrader og tilføje skolespecifikke øvelser."
              },
              {
                q: "Hvad med data og GDPR?",
                a: "Alle data hostes i EU og vi sørger for fuld GDPR-overholdelse med databehandleraftale."
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Hvordan kontakter jeg jer?</h3>
              <p className="text-gray-600 text-center">
                Vi svarer typisk inden for 24 timer. Alle henvendelser behandles fortroligt.
                Kontakt os også på info@mediamax.dk for spørgsmål.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
