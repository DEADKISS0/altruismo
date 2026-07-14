import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Altruismo — Herramientas web sin anuncios",
    template: "%s | Altruismo",
  },
  description:
    "La comunidad donde desarrolladores comparten páginas interactivas 100% funcionales. Gratis, sin publicidad, para automatizar tu día a día.",
  keywords: ["herramientas web", "desarrolladores", "sin anuncios", "retos", "comunidad"],
  authors: [{ name: "RR ALIADOS S.A.S." }],
  openGraph: {
    title: "Altruismo",
    description: "Herramientas web sin anuncios.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <!-- deploy --><html lang="es" className={`${inter.variable} ${ibmPlexMono.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen bg-pitch text-parchment font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

