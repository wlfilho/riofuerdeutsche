import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Rechtliche Informationen und Impressum von Rio für Deutsche.",
  alternates: {
    canonical: "https://riofuerdeutsche.de/impressum",
  },
  openGraph: {
    url: "https://riofuerdeutsche.de/impressum",
  },
};

export default async function ImpressumPage() {
  const settings = await getSettings()
  const c = buildContactUrls(settings)

  return (
    <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
      <NavbarServer />

      <main className="flex-grow pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Breadcrumb */}
          <FadeIn direction="up">
            <nav className="flex items-center text-sm font-medium text-gray-500 mb-12" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-rio-green transition-colors">Startseite</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
              <span className="text-rio-green font-semibold">Impressum</span>
            </nav>
          </FadeIn>

          <div className="max-w-3xl">
            <FadeIn direction="up">
              <h1 className="text-5xl lg:text-7xl font-heading font-black text-gray-900 leading-tight mb-16">
                Impressum
              </h1>

              <div className="space-y-12 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Angaben gemäß § 5 TMG</h2>
                  <p className="text-lg">
                    William Lantelme Filho<br />
                    {settings.business_address || 'Rio de Janeiro, Brasilien'}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Kontakt</h2>
                  <p className="text-lg">
                    {c.emailHref && (
                      <>E-Mail: <a href={c.emailHref} className="text-rio-blue hover:underline">{c.email}</a><br /></>
                    )}
                    {c.whatsappHref && (
                      <>WhatsApp: <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-rio-green hover:underline">{c.phone}</a></>
                    )}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Hinweis</h2>
                  <p className="text-lg">
                    Dieses Angebot richtet sich ausschließlich an Reisende aus dem deutschsprachigen Raum. Der Anbieter ist eine Privatperson mit Wohnsitz in Brasilien. Es gelten die Gesetze der Bundesrepublik Brasilien.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">Haftungsausschluss</h2>
                  <p className="text-lg">
                    Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
                  </p>
                </section>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <FooterServer />
    </div>
  );
}
