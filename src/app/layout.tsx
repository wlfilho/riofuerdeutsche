import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rio für Deutsche - Autorisierte deutschsprachige Touren in Rio",
  description: "Erlebe Rio de Janeiro mit zertifizierten deutschsprachigen Guides. Sicher, authentisch und unvergesslich.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans text-gray-900 bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
