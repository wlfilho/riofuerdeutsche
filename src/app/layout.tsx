import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FramerMotionProvider from "@/components/FramerMotionProvider";
import CookieBanner from "@/components/CookieBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://riofuerdeutsche.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rio de Janeiro: Deutschsprachiger Tourguide & Guide | Rio für Deutsche",
    template: "%s | Rio für Deutsche",
  },
  description:
    "Deutschsprachige Reiseleitung in Rio de Janeiro ✓ Citytouren, Stadtrundfahrten & Ausflüge mit einem echten Carioca. Sicher, persönlich, auf Deutsch.",
  keywords: [
    "Rio de Janeiro",
    "deutschsprachiger Guide",
    "Stadtführungen Rio",
    "Tourguide Rio de Janeiro",
    "Reiseleitung Rio",
    "Corcovado Tour",
    "Zuckerhut Tour",
    "Rio Reiseführer Deutsch",
    "Brasilien Urlaub",
    "Rio für Deutsche",
    "Favela Tour Rio",
    "Tijuca Nationalpark",
  ],
  authors: [{ name: "Rio für Deutsche" }],
  creator: "Rio für Deutsche",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Rio für Deutsche",
    title: "Rio de Janeiro: Deutschsprachiger Tourguide & Guide | Rio für Deutsche",
    description:
      "Deutschsprachige Reiseleitung in Rio de Janeiro ✓ Citytouren, Stadtrundfahrten & Ausflüge mit einem echten Carioca. Sicher, persönlich, auf Deutsch.",
    images: [
      {
        url: "/images/rio-background.webp",
        width: 1200,
        height: 630,
        alt: "Rio de Janeiro Panorama, Rio für Deutsche",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rio de Janeiro: Deutschsprachiger Tourguide & Guide | Rio für Deutsche",
    description:
      "Deutschsprachige Reiseleitung in Rio de Janeiro ✓ Citytouren, Stadtrundfahrten & Ausflüge mit einem echten Carioca. Sicher, persönlich, auf Deutsch.",
    images: ["/images/rio-background.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `lang` stays static: the public site is German-only and reading the
  // resolved locale here would opt every page into dynamic rendering.
  return (
    <html lang="de" className={`${inter.variable} scroll-smooth`}>
      <body
        className="antialiased font-sans text-gray-900 bg-gray-50"
      >
        <NextIntlClientProvider>
          <FramerMotionProvider>
            {children}
            <CookieBanner />
          </FramerMotionProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
