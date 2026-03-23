import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import FramerMotionProvider from "@/components/FramerMotionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://riofuerdeutsche.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rio de Janeiro: Deutschsprachiger Tourguide, Stadtführungen & Ausflüge | RioFürDeutsche",
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
    url: siteUrl,
    siteName: "Rio für Deutsche",
    title: "Rio de Janeiro: Deutschsprachiger Tourguide, Stadtführungen & Ausflüge | RioFürDeutsche",
    description:
      "Deutschsprachige Reiseleitung in Rio de Janeiro ✓ Citytouren, Stadtrundfahrten & Ausflüge mit einem echten Carioca. Sicher, persönlich, auf Deutsch.",
    images: [
      {
        url: "/images/rio-background.webp",
        width: 1200,
        height: 630,
        alt: "Rio de Janeiro Panorama – Rio für Deutsche",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rio de Janeiro: Deutschsprachiger Tourguide, Stadtführungen & Ausflüge | RioFürDeutsche",
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
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} scroll-smooth`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4BKZYR81FF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4BKZYR81FF');
          `}
        </Script>
      </head>
      <body
        className="antialiased font-sans text-gray-900 bg-gray-50"
      >
        <FramerMotionProvider>
          {children}
        </FramerMotionProvider>
      </body>
    </html>
  );
}
