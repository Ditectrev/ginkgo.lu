import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { ContactSection } from "@/components/ContactSection";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header, LangAttr, SkipLink } from "@/components/Header";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pharmacie Val Sainte-Croix Luxembourg - Ginkgo",
  description:
    "La pharmacie Ginkgo vous accueille en 6 langues du lundi au samedi. Pharmacie conseil maman-bébé, Test Covid, Sudoscan, point conseil asthme, parapharmacie, blistérisation de traitement, location de tire-lait, compression médicale…",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${roboto.variable} ${poppins.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <LangAttr />
        <SkipLink />
        <Header />
        <main id="contenu">{children}</main>
        <ContactSection />
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
