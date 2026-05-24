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
    default: "AutoSAV — Le SAV e-commerce qui répond pour toi",
    template: "%s · AutoSAV",
  },
  description:
    "L'IA qui rédige tes réponses SAV en français, avec ton contexte produit et le suivi colis Colissimo en live. Setup en 8 minutes. 14 jours gratuits.",
  keywords: [
    "sav e-commerce",
    "support client ia",
    "automatiser sav",
    "shopify support",
    "woocommerce support",
    "gorgias alternative",
    "support email automatique",
    "ia répondre clients",
  ],
  authors: [{ name: "AutoSAV" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sourcey.fr",
    siteName: "AutoSAV",
    title: "AutoSAV — Le SAV e-commerce qui répond pour toi",
    description:
      "L'IA qui rédige tes réponses SAV. Setup 8 min, 14 jours gratuits, moitié prix de Gorgias.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoSAV — Le SAV e-commerce qui répond pour toi.",
    description:
      "L'IA rédige tes réponses SAV en français. Setup 8 min, 14 jours gratuits.",
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
    <html lang="fr" className={`${jakarta.variable} ${mono.variable} overflow-x-hidden`}>
      <body className="overflow-x-hidden bg-white text-neutral-900 antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
