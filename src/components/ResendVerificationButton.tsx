"use client";

export default function ResendVerificationButton() {
  const handleResend = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (res.ok) {
        alert("📧 Verifikationsmail sendt! Tjek din indbakke.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || "Ukendt fejl";
        alert(`❌ Fejl: ${errorMsg}`);
      }
    } catch (error) {
      alert(`❌ Fejl: ${error instanceof Error ? error.message : "Netværksfejl"}`);
    }
  };

  return (
    <button
      onClick={handleResend}
      className="text-sm bg-brand-600 text-white px-3 py-1 rounded-full hover:bg-brand-700 transition-colors"
    >
      📧 Gensend
    </button>
  );
}
