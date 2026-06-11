import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    CalendarDays,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Fußball Tour in Rio — Maracanã, Flamengo & Live-Spiele",
    description: "Erlebe die Fußball-Leidenschaft von Rio de Janeiro hautnah — Maracanã-Tour, Museu do Flamengo und Live-Spiele im Stadion. Mit einem echten Carioca als Guide, komplett auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/fussball",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/fussball",
    },
};

const estimatedTourDuration = "3–4 Stunden";

const fussballHighlights = [
    "Maracanã (Stadion & Museum)",
    "Museu do Flamengo",
    "Live-Spiel im Stadion",
];

const fussballPlaces = [
    {
        name: "Maracanã — Stadion & Museum",
        image: "/images/maracana-rio-de-janeiro.webp",
        desc: "Das Maracanã ist mehr als ein Stadion — es ist ein Tempel des Fußballs. Hier schoss Pelé sein tausendstes Tor, hier fand das WM-Finale 2014 statt, und hier schlägt das Herz des brasilianischen Fußballs. Bei der offiziellen Tour siehst du die Umkleidekabinen, den Spielertunnel, den Rasen aus nächster Nähe und das interaktive Museum mit der Geschichte des brasilianischen Fußballs.",
        tip: "Buche die Tour vormittags — dann ist es leerer und du hast mehr Zeit für Fotos auf dem Rasen. Ich erkläre dir die Geschichten hinter den Trophäen und Fotos, die kein Audioguide kennt.",
        badges: ["Maracanã", "~2 Stunden"],
    },
    {
        name: "Museu do Flamengo",
        image: "/images/museu-do-flamengo.webp",
        desc: "Flamengo ist nicht einfach ein Club — mit über 40 Millionen Fans ist er der größte Verein Brasiliens und eine echte Institution. Das Museu do Flamengo erzählt die Geschichte dieses Phänomens: von den Anfängen über die großen Titel bis zu den Legenden wie Zico und Gabigol. Selbst wenn du kein Flamengo-Fan bist, wirst du die Leidenschaft spüren.",
        tip: "Frag mich nach den Rivalitäten zwischen Flamengo, Fluminense, Vasco und Botafogo — die Geschichten sind fantastisch und erklären viel über die Kultur von Rio.",
        badges: ["Gávea", "~1,5 Stunden"],
    },
    {
        name: "Live-Spiel im Stadion",
        image: "/images/spiel-am-maracana.webp",
        desc: "Ein Fußballspiel in Rio live zu erleben ist pures Adrenalin. Die Fans singen 90 Minuten lang ohne Pause, Trommeln und Fahnen füllen die Tribünen, und die Atmosphäre ist elektrisierend. Ob im Maracanã, im Nilton Santos oder im São Januário — ich organisiere die Tickets, begleite dich sicher ins Stadion und erkläre dir alles, was um dich herum passiert.",
        tip: "Ein Clássico (Derby) wie Flamengo vs. Fluminense oder Vasco vs. Botafogo ist das ultimative Erlebnis. Ich checke den Spielplan und finde das beste Spiel während deines Aufenthalts — inklusive sicherer Plätze und Tipps zum Mitfeiern.",
        badges: ["Nach Spielplan", "~4 Stunden"],
    },
];

export default function FussballTourPage() {
    const whatsappLink = "https://wa.me/5521990564944";
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Fußball Tour in Rio. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/maracana-rio-de-janeiro-background.webp"
                            alt="Fußball Tour in Rio de Janeiro — Maracanã und Fußball-Leidenschaft der Cariocas"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav className="flex items-center text-sm font-medium text-white/60 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Fußball Tour</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {fussballHighlights.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Fußball Tour in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Die Leidenschaft der Cariocas hautnah erleben
                                </p>

                                <div className="pt-6">
                                    <a
                                        href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Tour anfragen
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO B — Texto Intro SEO */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Fußball ist in Rio de Janeiro nicht nur ein Sport — er ist eine Religion. Die Stadt hat einige der legendärsten Clubs der Welt hervorgebracht, das ikonischste Stadion des Planeten gebaut und eine Fußballkultur geschaffen, die man nur verstehen kann, wenn man sie live erlebt.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Bei meiner Fußball Tour nehme ich dich mit hinter die Kulissen: vom Maracanã, wo Pelé sein tausendstes Tor schoss, über das Museum des größten Clubs Brasiliens bis hin zu einem echten Spiel im Stadion — mit Tausenden leidenschaftlichen Fans um dich herum. Als Carioca und Fußballfan erkläre ich dir alles auf Deutsch: die Rivalitäten, die Gesänge, die Tradition.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Ob du das Maracanã besichtigen, die Geschichte von Flamengo entdecken oder ein Live-Spiel erleben möchtest — schreib mir und ich organisiere dein Fußball-Erlebnis in Rio.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Cards */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Fußball in Rio de Janeiro — <span className="text-rio-green">3 unvergessliche Erlebnisse</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Vom legendären Maracanã bis zum Live-Spiel — hier ist Fußball mehr als nur ein Sport.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {fussballPlaces.map((place, index) => {
                                const hasLink = "link" in place && !!(place as any).link;
                                const cardContent = (
                                    <>
                                        <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={place.image}
                                                alt={place.name}
                                                fill
                                                loading="lazy"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                                                {place.badges.map((badge) => (
                                                    <span key={badge} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm uppercase tracking-wider">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2">{place.name}</h3>
                                            <p className="text-gray-500 text-sm mb-3">{place.desc}</p>
                                            <p className="text-gray-400 text-xs italic flex-grow">💡 {place.tip}</p>
                                            {hasLink && (
                                                <div className="mt-6 pt-6 border-t border-gray-50">
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rio-green group-hover:gap-2.5 transition-all duration-200">
                                                        Mehr erfahren
                                                        <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                                return hasLink ? (
                                    <FadeIn key={index} delay={index * 0.1} direction="up">
                                        <Link href={(place as any).link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] border border-gray-100 transition-all duration-300 group flex flex-col h-full cursor-pointer block">
                                            {cardContent}
                                        </Link>
                                    </FadeIn>
                                ) : (
                                    <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                        {cardContent}
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO E — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Fußball in Rio de Janeiro — <span className="text-rio-yellow text-2xl lg:text-4xl">erlebe die Leidenschaft live.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und ich organisiere dein perfektes Fußball-Erlebnis — vom Maracanã-Besuch bis zum Live-Spiel im Stadion.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp an uns
                                </a>
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Kontakt per E-Mail
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO F — Interne Linkagem */}
                <AndereTouren currentSlug="fussball" />
            </main>

            <Footer />
        </div>
    );
}
