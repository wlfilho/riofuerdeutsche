import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Rio für Deutsche",
  description: "Datenschutzerklärung von Rio für Deutsche – Informationen zum Umgang mit deinen Daten.",
};

export default function DatenschutzPage() {
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
              <span className="text-rio-green font-semibold">Datenschutzerklärung</span>
            </nav>
          </FadeIn>

          <div className="max-w-3xl">
            <FadeIn direction="up">
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-gray-900 leading-tight mb-16">
                Datenschutzerklärung
              </h1>
              
              <div className="space-y-12 text-gray-700 leading-relaxed text-lg">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">1. Verantwortlicher</h2>
                  <p>
                    William Lantelme Filho<br />
                    Rua Toneleros, 60 — Apto 302 — Bloco 2<br />
                    CEP 22061-000 — Copacabana, Rio de Janeiro — Brasilien<br />
                    E-Mail: <a href="mailto:lantelmew@gmail.com" className="text-rio-blue hover:underline">lantelmew@gmail.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">2. Allgemeines</h2>
                  <p>
                    Diese Website richtet sich an deutschsprachige Reisende. Der Schutz deiner persönlichen Daten ist uns wichtig. Wir verarbeiten deine Daten ausschließlich im Rahmen der geltenden Datenschutzgesetze, insbesondere der DSGVO.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">3. Hosting</h2>
                  <p>
                    Diese Website wird über einen externen Hosting-Anbieter betrieben. Im Rahmen des Hostings können technische Daten (z. B. IP-Adresse, Zugriffszeiten) automatisch erfasst werden.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">4. Google Analytics</h2>
                  <p className="mb-4">
                    Diese Website verwendet Google Analytics, einen Webanalysedienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.<br />
                    Property-ID: <span className="font-mono bg-gray-100 px-1 rounded text-sm">G-4BKZYR81FF</span>
                  </p>
                  <p className="mb-4">
                    Google Analytics setzt Cookies ein, die eine Analyse der Nutzung der Website ermöglichen. Die dadurch erzeugten Informationen werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert.
                  </p>
                  <p>
                    Du kannst die Erfassung durch Google Analytics verhindern, indem du ein Browser-Plugin installierst: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-rio-blue hover:underline break-all">https://tools.google.com/dlpage/gaoptout</a>
                  </p>
                  <p className="mt-4 text-sm text-gray-500 italic">
                    Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">5. Kontaktaufnahme</h2>
                  <p>
                    Wenn du uns per E-Mail oder WhatsApp kontaktierst, werden deine Angaben zur Bearbeitung der Anfrage gespeichert. Eine Weitergabe an Dritte findet nicht statt.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">6. Deine Rechte</h2>
                  <p>
                    Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten sowie das Recht auf Datenübertragbarkeit. Anfragen richtest du bitte an: <a href="mailto:lantelmew@gmail.com" className="text-rio-blue hover:underline">lantelmew@gmail.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">7. Cookies</h2>
                  <p>
                    Diese Website verwendet technisch notwendige Cookies sowie Cookies von Google Analytics. Du kannst die Speicherung von Cookies in deinen Browsereinstellungen deaktivieren.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">8. Änderungen</h2>
                  <p>
                    Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren.<br />
                    <span className="font-semibold text-gray-900">Stand: März 2026.</span>
                  </p>
                </section>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
