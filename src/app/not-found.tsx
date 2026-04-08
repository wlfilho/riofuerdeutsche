import Link from "next/link";
import { MapPin, Compass, Phone, Map, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F7F3EB] flex flex-col items-center justify-center px-4 py-24">
        {/* 404 number */}
        <div className="relative mb-6 select-none">
          <span className="text-[10rem] md:text-[14rem] font-black text-[#0A5C36] leading-none tracking-tighter opacity-10">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-20 h-20 md:w-28 md:h-28 text-[#0A5C36]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A5C36] text-center mb-3 max-w-xl">
          Diese Seite ist wohl im Nebel des Zuckerhuts verschwunden.
        </h1>

        <p className="text-gray-600 text-center max-w-md mb-10 text-base md:text-lg">
          Die gesuchte Seite existiert nicht (mehr) oder wurde verschoben.
          Aber keine Sorge — Rio wartet auf dich!
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            Jetzt Tour anfragen
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#0A5C36] text-[#0A5C36] hover:bg-[#0A5C36] hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Zur Startseite
          </Link>
        </div>

        {/* Quick links */}
        <div className="w-full max-w-2xl">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Beliebte Seiten
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/touren"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-600 hover:shadow-md transition group"
            >
              <MapPin className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm">Touren</p>
                <p className="text-xs text-gray-500">Alle Touren entdecken</p>
              </div>
            </Link>

            <Link
              href="/rio-guide/sehenswuerdigkeiten"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-600 hover:shadow-md transition group"
            >
              <Map className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm">Rio Guide</p>
                <p className="text-xs text-gray-500">Sehenswürdigkeiten</p>
              </div>
            </Link>

            <Link
              href="/kontakt"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-600 hover:shadow-md transition group"
            >
              <Phone className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm">Kontakt</p>
                <p className="text-xs text-gray-500">Fragen & Buchung</p>
              </div>
            </Link>

            <Link
              href="/ist-rio-gefaehrlich"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-600 hover:shadow-md transition group"
            >
              <ShieldCheck className="w-5 h-5 text-green-700 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-green-700 transition text-sm">Sicherheit</p>
                <p className="text-xs text-gray-500">Ist Rio gefährlich?</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
