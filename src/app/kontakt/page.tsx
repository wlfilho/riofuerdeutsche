import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { MessageCircle, Mail, Send, ChevronRight, CheckCircle2, Instagram, Youtube } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | Rio für Deutsche",
  description: "Schreib mir! Ich antworte auf Deutsch — meistens innerhalb von 24 Stunden. Kontaktiere mich per WhatsApp oder E-Mail für deine private Tour in Rio de Janeiro.",
};

export default function KontaktPage() {
  return (
    <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Breadcrumb */}
          <FadeIn direction="up">
            <nav className="flex items-center text-sm font-medium text-gray-500 mb-12" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-rio-green transition-colors">Startseite</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
              <span className="text-rio-green font-semibold">Kontakt</span>
            </nav>
          </FadeIn>

          <div className="max-w-7xl">
            <FadeIn direction="up">
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-gray-900 leading-tight mb-6 mt-2">
                Schreib mir!
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl leading-relaxed mb-16">
                Ich antworte auf Deutsch — meistens innerhalb von 24 Stunden.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* WhatsApp Block */}
              <FadeIn direction="up" delay={0.1}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-[#25D366]" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">WhatsApp</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    Schnellste Antwort — ideal für konkrete Fragen
                  </p>
                  <a
                    href="https://wa.me/573148704374"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold text-lg hover:bg-[#22c35e] transition-all shadow-lg shadow-[#25D366]/20"
                  >
                    WhatsApp öffnen
                  </a>
                </div>
              </FadeIn>

              {/* Telegram Block */}
              <FadeIn direction="up" delay={0.15}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-[#0088cc]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Send className="w-8 h-8 text-[#0088cc]" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">Telegram</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    Alternative für schnellen Chat & Sicherheit
                  </p>
                  <a
                    href="https://t.me/wlfilho"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0088cc] text-white rounded-full font-bold text-lg hover:bg-[#0077b5] transition-all shadow-lg shadow-[#0088cc]/20"
                  >
                    Telegram öffnen
                  </a>
                </div>
              </FadeIn>

              {/* Email Block */}
              <FadeIn direction="up" delay={0.2}>
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-rio-blue/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Mail className="w-8 h-8 text-rio-blue" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">E-Mail</h2>
                  <p className="text-gray-600 text-lg mb-8 flex-grow">
                    Für längere Anfragen oder Buchungen
                  </p>
                  <a
                    href="mailto:lantelmew@gmail.com"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-blue text-white rounded-full font-bold text-lg hover:bg-rio-blue/90 transition-all shadow-lg shadow-rio-blue/20"
                  >
                    E-Mail schreiben
                  </a>
                </div>
              </FadeIn>
            </div>

            <FadeIn direction="up" delay={0.3}>
              <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-8 pt-16 border-t border-gray-100">
                <div className="flex items-center gap-3 px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 w-fit">
                  <CheckCircle2 className="w-5 h-5 text-rio-green" />
                  <p className="text-gray-600 font-medium">
                    &quot;Ich spreche fließend Deutsch — du kannst mir auf Deutsch schreiben.&quot;
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Folge mir:</p>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://instagram.com/riofuerdeutsche"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:scale-110 transition-all duration-300"
                    >
                      <Instagram className="w-6 h-6" />
                      <span className="sr-only">Instagram</span>
                    </a>
                    <a
                      href="https://youtube.com/@riofuerdeutsche"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-white hover:bg-[#FF0000] hover:scale-110 transition-all duration-300"
                    >
                      <Youtube className="w-6 h-6" />
                      <span className="sr-only">YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
