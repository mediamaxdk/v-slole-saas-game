import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Tastatur Helten",
    template: "%s — Tastatur Helten",
  },
  description:
    "Lær at taste med alle ti fingre. Gratis for skoler og elever — med klasse-leaderboards og lærerstatistik.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type:   "website",
    locale: "da_DK",
    title:  "Tastatur Helten",
    description: "Lær at taste med alle ti fingre.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
