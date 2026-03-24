import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Phone,
    CalendarDays
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Regentage in Rio de Janeiro — Was tun bei Regen? | RioFürDeutsche",
    description: "Regen in Rio? Kein Problem! Museen, AquaRio, Capoeira-Kurse und Wellness — die besten Indoor-Aktivitäten in Rio de Janeiro für schlechtes Wetter. Tipps von einem echten Carioca.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/regentage",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/regentage",
    },
};

const estimatedTourDuration = "Flexibel";

export default function RegentagePage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&h=800&fit=crop&q=80"
                            alt="Regentage in Rio de Janeiro"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav className="flex items-center text-sm font-medium text-gray-400 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Regentage</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · Highlights nach Wahl</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(28px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Regentage in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Was tun bei Regen? Mehr als du denkst!
                                </p>

                                <div className="pt-6">
                                    <a
                                        href={`https://wa.me/573148704374?text=${encodeURIComponent("Hallo! Es regnet in Rio und ich suche nach Indoor-Aktivitäten. Kannst du mir helfen?")}`}
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
                                    Auch im tropischen Rio regnet es — manchmal kräftig. Aber ein Regentag in Rio muss kein verlorener Tag sein. Im Gegenteil: Die Stadt hat so viele großartige Indoor-Erlebnisse, dass du dir fast wünschen wirst, es würde öfter regnen.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Von weltberühmten Museen über das größte Meeresaquarium Südamerikas bis hin zu Capoeira-Kursen und historischen Cafés — Rio hat für jeden Geschmack etwas zu bieten, wenn das Wetter nicht mitspielt. Ich zeige dir die besten Indoor-Aktivitäten und sorge dafür, dass dein Tag genauso unvergesslich wird wie bei Sonnenschein.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Schreib mir einfach und ich stelle dir das perfekte Regentag-Programm zusammen — spontan und flexibel, genau wie das Wetter in Rio.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Grade de Atividades Indoor */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Regentage in Rio de Janeiro —{" "}
                                <span className="text-rio-green">8 Indoor-Erlebnisse</span>
                            </h2>
                            <p className="text-gray-500 mt-3 text-lg">Regen? Perfekt. Hier sind die besten Aktivitäten, wenn das Wetter nicht mitspielt.</p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Museu do Amanhã",
                                    image: "/images/mudeu-do-amanha.webp",
                                    desc: "Der perfekte Regentag-Kandidat: Das futuristische Museum von Santiago Calatrava auf der Praça Mauá ist komplett indoor, interaktiv und so beeindruckend, dass du den Regen draußen völlig vergisst. Die Ausstellung über Nachhaltigkeit und Zukunft ist faszinierend für alle Altersgruppen.",
                                    tip: "Dienstags ist der Eintritt frei — und bei Regen ist es oft leerer als sonst. Perfekter Zeitpunkt für einen entspannten Besuch ohne Warteschlangen.",
                                    badges: ["Praça Mauá", "~1,5 Stunden"]
                                },
                                {
                                    title: "AquaRio",
                                    image: "/images/aquario-rio-de-janeiro.webp",
                                    desc: "Das größte Meeresaquarium Südamerikas ist wie gemacht für Regentage. Über 350 Arten auf 26.000 Quadratmetern — von Haien über Schildkröten bis zu bunten Korallenfischen. Komplett überdacht, klimatisiert und direkt neben dem Museu do Amanhã. Zwei Stunden, die wie im Flug vergehen.",
                                    tip: "Kombiniere AquaRio mit dem Museu do Amanhã direkt nebenan — ein perfekter Regentag auf der Praça Mauá, ohne einen Schritt im Regen zu machen.",
                                    badges: ["Praça Mauá", "~2 Stunden"]
                                },
                                {
                                    title: "CCBB — Centro Cultural Banco do Brasil",
                                    image: "/images/centro-cultural-banco-do-brasil.webp",
                                    desc: "Eines der meistbesuchten Kulturzentren der Welt — und bei Regen dein bester Freund in Rio. Wechselnde Weltklasse-Ausstellungen, Kino, Theater und ein gemütliches Café, alles unter einem Dach in einem prächtigen Gebäude im Centro. Der Eintritt ist kostenlos oder minimal.",
                                    tip: "Schau vorher online, welche Ausstellung gerade läuft — das CCBB holt regelmäßig internationale Blockbuster-Shows. Tickets sind kostenlos aber begrenzt.",
                                    badges: ["Centro", "~1–2 Stunden"]
                                },
                                {
                                    title: "MAR — Museu de Arte do Rio",
                                    image: "/images/museu-de-arte-do-rio.webp",
                                    desc: "Kunst, Geschichte und eine fantastische Dachterrasse — das MAR erzählt die visuelle Geschichte Rios durch Fotografie, Installationen und wechselnde Ausstellungen. An Regentagen hast du das Museum oft fast für dich allein, und wenn der Regen nachlässt, wartet die Aussicht von oben.",
                                    tip: "Liegt direkt neben dem Museu do Amanhã und dem AquaRio — alle drei lassen sich an einem Regentag perfekt kombinieren.",
                                    badges: ["Praça Mauá", "~1 Stunde"]
                                },
                                {
                                    title: "MAM — Museu de Arte Moderne",
                                    image: "/images/museu-de-arte-moderna-rio-de-janeiro.webp",
                                    desc: "Das brutalistische Gebäude im Aterro do Flamengo ist schon von außen beeindruckend — und drinnen erwarten dich wechselnde Ausstellungen zeitgenössischer Kunst. Bei Regen eine willkommene Oase der Ruhe, und wenn die Wolken aufreißen, locken die Gärten von Burle Marx direkt vor der Tür.",
                                    tip: "Das MAM-Kino zeigt oft ausgezeichnete Arthouse-Filme — perfekte Ergänzung zum Museumsbesuch an einem verregneten Nachmittag.",
                                    badges: ["Aterro do Flamengo", "~1 Stunde"]
                                },
                                {
                                    title: "Museu Nacional de Belas Artes",
                                    image: "/images/museu-belas-artes-rio.webp",
                                    desc: "Die wichtigste Kunstsammlung Brasiliens in einem eleganten Gebäude neben dem Teatro Municipal. Von der Kolonialzeit bis zur Moderne — bei Regen hast du endlich die Muße, die brasilianische Kunstgeschichte in Ruhe zu entdecken. Eintritt oft kostenlos.",
                                    tip: "Kombiniere den Besuch mit dem Teatro Municipal und der Confeitaria Colombo — alle drei liegen im Centro fußläufig beieinander.",
                                    badges: ["Cinelândia", "~1 Stunde"]
                                },
                                {
                                    title: "Confeitaria Colombo",
                                    image: "/images/confeitaria-colombo.webp",
                                    desc: "Es gibt kaum einen besseren Ort, um einen Regentag in Rio zu genießen, als dieses legendäre Café aus der Belle Époque. Seit 1894 serviert die Confeitaria Colombo Kaffee und Gebäck unter riesigen belgischen Spiegeln und Jugendstil-Dekor. Draußen prasselt der Regen, drinnen fühlst du dich wie in einem Wiener Kaffeehaus — nur tropisch.",
                                    tip: "Bestelle den Café com Pastel de Nata und nimm dir Zeit, die Einrichtung zu bewundern. Der perfekte Ort, um eine Regenpause stilvoll zu überbrücken.",
                                    badges: ["Centro", "~45 Minuten"]
                                },
                                {
                                    title: "Capoeira- oder Samba-Kurs",
                                    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&q=80",
                                    desc: "Was gibt es Besseres an einem Regentag, als etwas typisch Brasilianisches zu lernen? Capoeira verbindet Kampfkunst, Tanz und Musik in einer einzigartigen Mischung — und ein Samba-Kurs bringt dir die Schritte bei, die du für den nächsten Karneval brauchst. Indoor, aktiv und garantiert unvergesslich.",
                                    tip: "Ich kenne die besten Schulen in Rio, die auch Kurse für absolute Anfänger auf Englisch oder mit Übersetzung anbieten. Schreib mir und ich organisiere alles.",
                                    badges: ["Verschiedene Standorte", "~1,5 Stunden"]
                                }
                            ].map((item, index) => (
                                <FadeIn
                                    key={index}
                                    delay={index * 0.1}
                                    direction="up"
                                    className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full ${index >= 6 ? 'lg:justify-self-center' : ''}`}
                                >
                                    <div className="h-56 w-full relative overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-500 text-sm mb-3">{item.desc}</p>
                                        <p className="text-gray-400 text-xs italic mb-6 flex-grow">💡 {item.tip}</p>

                                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50">
                                            {item.badges.map((badge, bIndex) => (
                                                <div key={bIndex} className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${bIndex === 0 ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'}`}>
                                                    {badge}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO F — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Regentag in Rio de Janeiro? <br className="hidden sm:block" />
                                <span className="text-rio-yellow">Ich mache das Beste daraus.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und ich stelle dir spontan das perfekte Indoor-Programm zusammen — flexibel, sicher und mit Insider-Wissen.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href={`https://wa.me/573148704374?text=${encodeURIComponent("Hallo! Es regnet in Rio und ich suche nach Indoor-Aktivitäten. Kannst du mir helfen?")}`}
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

                {/* SEÇÃO G — Interne Linkagem */}
                <AndereTouren currentSlug="regentage" />
            </main>

            <Footer />
        </div>
    );
}
