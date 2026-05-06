"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useUserWithRole } from "@/hooks/useUserWithRole";

export default function Header() {
  const { user, loading } = useUserWithRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link href="/" className="text-2xl font-black text-brand-700">
        ⌨️ Tastatur Helten
      </Link>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      ) : user ? (
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Hej, {user.name || user.email?.split("@")[0]}!
            </span>
            {!user.emailVerified && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                ⚠️ Ikke verificeret
              </span>
            )}
          </div>

          {/* Teacher dashboard link */}
          {isTeacher && (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200 transition-colors"
            >
              Dashboard
            </Link>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {(user.name || user.email || "?")[0].toUpperCase()}
              </div>
              <span className="text-gray-400">▼</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Resend verification if not verified */}
                {!user.emailVerified && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/resend-verification", {
                          method: "POST",
                        });
                        if (res.ok) {
                          alert("Verifikationsmail sendt! Tjek din indbakke.");
                        } else {
                          alert("Fejl: Kunne ikke sende mail.");
                        }
                      } catch (error) {
                        alert("Fejl: Kunne ikke sende mail.");
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    📧 Send verifikationsmail
                  </button>
                )}

                <Link
                  href="/spil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎮 Spil
                </Link>

                <Link
                  href="/leaderboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏆 Leaderboard
                </Link>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Log ud
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}

      {/* Close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}
