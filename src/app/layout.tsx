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
    default: "Rio für Deutsche – Deutschsprachige Privattouren in Rio de Janeiro",
    template: "%s | Rio für Deutsche",
  },
  description:
    "Erlebe Rio de Janeiro mit deinem deutschsprachigen Guide. Privattouren zum Corcovado, Zuckerhut, Favelas & mehr – sicher, authentisch und unvergesslich.",
  keywords: [
    "Rio de Janeiro",
    "deutschsprachiger Guide",
    "Privattouren Rio",
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
    title: "Rio für Deutsche – Deutschsprachige Privattouren in Rio de Janeiro",
    description:
      "Erlebe Rio de Janeiro mit deinem deutschsprachigen Guide. Privattouren zum Corcovado, Zuckerhut, Favelas & mehr – sicher, authentisch und unvergesslich.",
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
    title: "Rio für Deutsche – Deutschsprachige Privattouren in Rio de Janeiro",
    description:
      "Erlebe Rio de Janeiro mit deinem deutschsprachigen Guide. Sicher, authentisch und unvergesslich.",
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
