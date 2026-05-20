import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/layout/LenisProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sourcey.fr"),
  title: {
    default: "Sourcey — Trouve ton produit. On s'occupe du reste.",
    template: "%s · Sourcey",
  },
  description:
    "Sourcey te connecte à un réseau d'agents francophones en Chine qui sourcent, contrôlent et expédient les meilleurs produits pour ton e-commerce. Particuliers comme entreprises.",
  keywords: [
    "sourcing chine",
    "fournisseur chinois",
    "dropshipping",
    "agent sourcing",
    "import chine",
    "e-commerce",
    "alibaba",
    "alternative cj dropshipping",
  ],
  authors: [{ name: "Sourcey" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sourcey.fr",
    siteName: "Sourcey",
    title: "Sourcey — Trouve ton produit. On s'occupe du reste.",
    description:
      "Le sourcing depuis la Chine, géré par des agents francophones qui négocient, contrôlent et expédient pour toi.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sourcey — Sourcing depuis la Chine, simplifié.",
    description:
      "Agents francophones, QC vidéo, livraison 7-12j. Particuliers comme entreprises.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="bg-white text-neutral-900 antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
