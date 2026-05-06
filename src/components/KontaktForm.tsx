"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  school: string;
  studentCount: string;
  domain: string;
  message: string;
}

export default function KontaktForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    school: "",
    studentCount: "",
    domain: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          school: "",
          studentCount: "",
          domain: "",
          message: "",
        });
      } else {
        setError(data.error || "Kunne ikke sende besked");
      }
    } catch (error) {
      setError("Netværksfejl - prøv igen senere");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Tak for din henvendelse!</h3>
        <p className="text-green-700">
          Vi har modtaget din besked og kontakter dig inden for 24 timer.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Få Tastatur Helten på jeres skole
          </h2>
          <p className="text-gray-600">
            Vi tilbyder whitelabel-løsninger til skoler og kommuner med eget logo, domæne og tilpasset design.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Navn *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Dit fulde navn"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="din@email.dk"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                Skole/Organisation
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Efterskolen Solgården"
              />
            </div>

            <div>
              <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-2">
                Antal elever
              </label>
              <select
                id="studentCount"
                name="studentCount"
                value={formData.studentCount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="">Vælg antal</option>
                <option value="1-50">1-50 elever</option>
                <option value="51-200">51-200 elever</option>
                <option value="201-500">201-500 elever</option>
                <option value="501-1000">501-1000 elever</option>
                <option value="1000+">1000+ elever</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Ønsket domæne (valgfrit)
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="skole.dk eller tastatur.skole.dk"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Besked *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
              placeholder="Fortæl os om jeres behov, ønsket til features, tidsperspektiv, eller andet der er relevant..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sender..." : "Send forespørgsel"}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Vi svarer typisk inden for 24 timer. Alle henvendelser behandles fortroligt.
          </p>
        </form>
      </div>
    </div>
  );
}
