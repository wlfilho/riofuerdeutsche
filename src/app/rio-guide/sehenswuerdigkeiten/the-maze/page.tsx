import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import AndereTouren from "@/components/AndereTouren";
import Faq from "@/components/Faq";
import { ChevronRight, Home, ArrowRight, Phone } from "lucide-react";

const faqs = [
    {
        q: "Was ist The Maze in Rio de Janeiro?",
        a: "Ein labyrinthisches Kulturzentrum auf dem Morro Tavares Bastos im Catete, über vier Jahrzehnte vom britischen Ex-BBC-Korrespondenten Bob Nadkarni mit eigenen Händen erbaut. Kunstgalerie, Bar und Hostel in einem, mit einer der spektakulärsten Aussichten der Stadt.",
    },
    {
        q: "Ist Tavares Bastos sicher?",
        a: "Ja, Tavares Bastos gilt als einer der ruhigsten Morros Rios. Mit Will als Begleitung kommst du entspannt hin und zurück, inklusive der kleinen VW-Vans, die den Hügel hinauffahren.",
    },
    {
        q: "Wie kommt man zu The Maze?",
        a: "Mit kleinen VW-Vans ab der Rua Bento Lisboa im Catete. Will begleitet dich den ganzen Weg und erzählt dir die Geschichte des Ortes, statt dich allein suchen zu lassen.",
    },
    {
        q: "Wann lohnt sich der Besuch am meisten?",
        a: "Am späten Nachmittag, wenn die Sonne über der Guanabara-Bucht untergeht und der Blick auf den Zuckerhut am schönsten ist. An manchen Abenden gibt es Live-Musik auf der Dachterrasse.",
    },
    {
        q: "Kann man The Maze ohne Guide besuchen?",
        a: "Theoretisch ja, aber der Ort ist versteckt und die Anfahrt nicht selbsterklärend. Mit Will verpasst du weder den Weg noch die Geschichten, die diesen Ort besonders machen.",
    },
];

export const metadata = {
    title: {
        absolute: "The Maze Rio de Janeiro, Tavares Bastos besuchen auf Deutsch | Rio für Deutsche",
    },
    description:
        "The Maze in Tavares Bastos: Bob Nadkarnis labyrinthisches Kulturzentrum im Catete. Aussicht auf die Guanabara-Bucht und den Zuckerhut. Auf Deutsch mit Will.",
    keywords: [
        "The Maze Rio",
        "Tavares Bastos",
        "Bob Nadkarni",
        "The Maze Favela",
        "Catete Rio",
        "versteckte Orte Rio",
    ],
    alternates: {
        canonical: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/the-maze",
    },
    openGraph: {
        title: "The Maze Rio de Janeiro, Tavares Bastos besuchen auf Deutsch",
        description:
            "Versteckt im Catete, mit Blick auf die ganze Bucht. Bob Nadkarnis Kulturzentrum in Tavares Bastos. Auf Deutsch erklärt, mit Will.",
        url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/the-maze",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "The Maze (Tavares Bastos)",
    description:
        "The Maze ist ein labyrinthisches Kulturzentrum auf dem Morro Tavares Bastos im Stadtteil Catete in Rio de Janeiro. Errichtet vom ehemaligen BBC-Korrespondenten Bob Nadkarni, mit Kunstgalerie, Bar, Hostel und einem Panoramablick über die Guanabara-Bucht.",
    url: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/the-maze",
    touristType: "Cultural tourism",
    isAccessibleForFree: false,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Tavares Bastos, Catete",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
    },
    geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9305,
        longitude: -43.1785,
    },
    inLanguage: "de",
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: "https://riofuerdeutsche.de" },
        { "@type": "ListItem", position: 2, name: "Rio-Guide", item: "https://riofuerdeutsche.de/rio-guide" },
        { "@type": "ListItem", position: 3, name: "Sehenswürdigkeiten", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten" },
        { "@type": "ListItem", position: 4, name: "The Maze", item: "https://riofuerdeutsche.de/rio-guide/sehenswuerdigkeiten/the-maze" },
    ],
};

export default function TheMazePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
                <NavbarServer />

                <main className="flex-grow">
                    {/* ── HERO ─────────────────────────────────────────── */}
                    <section className="relative pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
                        <Image
                            src="/images/the-maze.webp"
                            alt="The Maze in Tavares Bastos, Rio de Janeiro"
                            fill
                            className="object-cover object-center z-0"
                            priority
                        />
                        <div className="absolute inset-0 z-0 bg-[#071a0e]/75" />
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#22a262]/10 blur-3xl z-0 -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#22a262]/8 blur-3xl z-0 translate-y-1/2 -translate-x-1/4" />

                        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <nav
                                    className="flex items-center flex-wrap gap-y-1 text-sm font-medium text-white/50 mb-10"
                                    aria-label="Breadcrumb"
                                >
                                    <Link href="/" className="hover:text-white transition-colors" aria-label="Startseite">
                                        <Home className="w-4 h-4" />
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <Link href="/rio-guide" className="hover:text-white transition-colors">
                                        Rio-Guide
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <Link href="/rio-guide/sehenswuerdigkeiten" className="hover:text-white transition-colors">
                                        Sehenswürdigkeiten
                                    </Link>
                                    <ChevronRight className="w-4 h-4 mx-2 text-white/25 shrink-0" />
                                    <span className="text-[#22a262] font-semibold">The Maze</span>
                                </nav>

                                <div className="max-w-4xl">
                                    <h1 className="text-5xl lg:text-[clamp(40px,5vw,72px)] font-heading font-black text-white leading-[1.08] tracking-tight mb-6">
                                        The Maze in Tavares Bastos, Rios versteckteste Aussicht
                                    </h1>

                                    <p className="text-xl lg:text-2xl text-white/70 font-medium leading-snug max-w-2xl mb-10">
                                        Ein Labyrinth aus Mosaiken, Galerie und Bar, hoch über dem Catete. Wenige Touristen, atemberaubender Blick.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/touren/favela-tour"
                                            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#22a262] text-white rounded-full font-bold text-base hover:bg-[#1a8a52] hover:scale-[1.02] transition-all shadow-xl shadow-[#22a262]/25"
                                        >
                                            The Maze mit Will entdecken
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href="/rio-guide/sehenswuerdigkeiten"
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 backdrop-blur-md border border-white/20 text-white/80 rounded-full font-medium text-base hover:bg-white/15 hover:text-white transition-all"
                                        >
                                            Alle Sehenswürdigkeiten
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Info Cards ─────────────────────────────────── */}
                    <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <h2 className="text-xs font-bold tracking-widest uppercase text-rio-green mb-8">
                                    Praktische Infos auf einen Blick
                                </h2>
                            </FadeIn>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">

                                <FadeIn delay={0} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Uhr">⏱</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Dauer</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">ca. 2 Stunden <span className="text-gray-400 font-normal">(mit Will)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.05} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Sonnenuntergang">🌇</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Beste Zeit</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Spätnachmittag <span className="text-gray-400 font-normal">(Sonnenuntergang)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.1} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Standort">📍</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lage</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Morro Tavares Bastos <span className="text-gray-400 font-normal">(Catete)</span></p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.15} direction="up" className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Geld">💰</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Eintritt</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Variiert je nach Veranstaltung</p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.2} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Auto">🚗</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Mit Will</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Privattransfer inklusive, VW-Van ab Bento Lisboa</p>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.25} direction="up" className="bg-white border border-rio-green/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-rio-green/50 hover:shadow-sm transition-all duration-300">
                                    <span className="text-2xl" role="img" aria-label="Sprechen">🗣️</span>
                                    <div>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-rio-green mb-1">Sprache</p>
                                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">Auf Deutsch erklärt, mit Lokalkenntnissen</p>
                                    </div>
                                </FadeIn>

                            </div>

                            {/* ── Wetter & Sicht ───────────────────────── */}
                            <FadeIn direction="up" className="mt-6">
                                <div className="relative bg-[#0d1f15] rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/10">
                                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
                                    <div className="relative p-7 lg:p-8">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-3xl" role="img" aria-label="Wetter">⛅</span>
                                            <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                                                Wetter &amp; Sicht
                                            </span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mb-4 leading-tight">
                                            Warum The Maze im Spätnachmittag am besten ist
                                        </h3>
                                        <p className="text-white/75 text-base leading-relaxed mb-4">
                                            Vom Dach von The Maze schaust du direkt auf die Guanabara-Bucht, mit dem Zuckerhut links
                                            und der Innenstadt im Rücken. Wenn die Sonne hinter Santa Teresa untergeht, leuchtet die
                                            ganze Bucht für ein paar Minuten orange, und du verstehst, warum Bob Nadkarni sich genau
                                            diesen Hügel ausgesucht hat.
                                        </p>
                                        <p className="text-white/60 text-sm leading-relaxed">
                                            <span className="text-amber-400 font-semibold">Klare Sicht ist am wahrscheinlichsten:</span>{" "}
                                            Mai bis September, mit der trockensten Luft des Jahres. In der Regenzeit (Dezember bis März)
                                            klart es oft erst am späten Nachmittag auf, also genau zur richtigen Zeit für die Aussicht.
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Intro Text ─────────────────────────────────── */}
                    <section className="pt-20 lg:pt-28 pb-8 bg-white">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto space-y-7 text-left">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Ein Kulturzentrum, das in 40 Jahren von Hand gewachsen ist
                                    </h2>

                                    <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                        The Maze ist einer dieser Orte, von denen die wenigsten Touristen je gehört haben, und genau
                                        deshalb empfehle ich ihn. Hoch oben auf dem Morro Tavares Bastos im Catete, in einem Haus,
                                        das eher Skulptur als Gebäude ist, hat ein ehemaliger BBC-Korrespondent namens Bob Nadkarni
                                        über vier Jahrzehnte sein Lebenswerk gebaut: Galerie, Bar und Hostel in einem labyrinthischen
                                        Gebilde aus Beton, Mosaik und Aussicht.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Das Beste an The Maze: niemand schickt dich hier zu einem Standardrundgang. Du kommst rein,
                                        bestellst dir etwas zu trinken, läufst die Treppen hoch, setzt dich auf die Laje, und schaust
                                        auf die Bucht. Manchmal spielt jemand Klavier in einer der Galerien. Bei den berühmten Jazz-Abenden
                                        verwandelt sich der ganze Komplex in einen Konzertsaal mit Aussicht auf den Zuckerhut.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                                        Ich nehme meine Gäste gern am späten Nachmittag mit, kurz vor Sonnenuntergang. Die Anfahrt
                                        ist Teil der Erfahrung: kleine VW-Vans, die ab der Rua Bento Lisboa den Berg hochfahren,
                                        durch enge Kurven, mit Cariocas neben dir, die abends nach Hause wollen. Mit der{" "}
                                        <Link href="/touren/favela-tour" className="text-[#2D6A4F] underline underline-offset-2 hover:text-[#1a4a35] transition-colors">Favela Tour auf Deutsch</Link>{" "}
                                        machen wir genau das, in deinem Tempo und ohne, dass du dich um die Logistik kümmern musst.
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Geschichte ─────────────────────────────────── */}
                    <section className="pt-20 lg:pt-28 pb-12 lg:pb-16 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <div className="max-w-[800px] mx-auto">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Bob Nadkarni und{" "}
                                        <span className="text-rio-green">die Geschichte des Hauses</span>
                                    </h2>
                                </div>
                            </FadeIn>

                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto space-y-7 text-left">

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Bob Nadkarni kam in den 1980er Jahren als BBC-Korrespondent nach Rio. Er hatte aus Vietnam,
                                        dem Nahen Osten und aus Lateinamerika berichtet, und irgendwann beschloss er, in Rio zu bleiben.
                                        Auf dem Morro Tavares Bastos kaufte er ein kleines Haus mit Blick auf die Bucht und begann,
                                        es mit eigenen Händen umzubauen. Aus einem Anbau wurde ein Stockwerk, aus dem Stockwerk eine
                                        Galerie, aus der Galerie ein Hostel, und irgendwann das ganze Labyrinth, das heute The Maze heißt.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Den Namen Maze (englisch für Labyrinth) bekam der Ort, weil niemand zweimal denselben Weg
                                        durchs Haus findet. Es gibt verschachtelte Treppen, runde Türen, Räume, die sich zum Himmel
                                        öffnen, und über allem die handgemachten Mosaike, die Bob über Jahrzehnte zusammen mit Künstlern
                                        aus aller Welt verlegt hat. Bob ist 2024 verstorben, das Haus wird heute von seiner Familie
                                        weitergeführt, in genau dem Geist, in dem er es gebaut hat.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Tavares Bastos hat in der Geschichte Rios eine ungewöhnliche Rolle. Direkt am Fuß des Morros
                                        lag jahrzehntelang das alte Hauptquartier des BOPE, der Spezialeinheit der Militärpolizei,
                                        bekannt aus Filmen wie <em>Tropa de Elite</em>. Genau deshalb war Tavares Bastos schon
                                        Anfang der 2000er befriedet, lange bevor das Wort UPP überhaupt existierte. Im Alltag merkst
                                        du davon nichts, der Morro ist heute eine ruhige Wohngegend, in der Familien wohnen, die
                                        seit Generationen hier oben sind.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Berühmt geworden ist The Maze über die Musik. Seit Anfang der 2000er finden hier regelmäßig
                                        Jazz-Sessions statt, mit brasilianischen und internationalen Musikern, oft bis spät in die
                                        Nacht. Wer in Rio nach echtem Jazz sucht, landet früher oder später hier. Die Stimmung ist
                                        legendär: Du sitzt zwischen Mosaiken auf einer Terrasse, hinter dem Schlagzeug die ganze
                                        Bucht, und der Bassist trägt T-Shirt und Flip-Flops.
                                    </p>

                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Und dann, fast nebenbei, ist da die Aussicht. Vom obersten Punkt von The Maze schaust du
                                        über die Glória, die Marina, die ganze Guanabara-Bucht, den Zuckerhut, die Niterói-Brücke
                                        und an klaren Tagen die Berge auf der anderen Seite der Bucht. Es gibt in Rio ein paar
                                        offizielle Aussichtspunkte, die spektakulärer klingen. Wenige fühlen sich so persönlich
                                        an wie The Maze.
                                    </p>

                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Wills Insider-Tipp ─────────────────────────── */}
                    <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto">
                                    <div className="relative bg-[#0d1f15] rounded-3xl overflow-hidden border-l-4 border-[#22a262] shadow-xl shadow-black/10">
                                        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#22a262]/8 blur-3xl pointer-events-none" />
                                        <div className="relative p-8 lg:p-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-3xl" role="img" aria-label="Glühbirne">💡</span>
                                                <span className="text-xs font-bold tracking-widest uppercase text-[#22a262]">
                                                    Wills Insider-Tipp
                                                </span>
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-5 leading-tight">
                                                Geh zu einer Jazz-Session, nicht zu einem Tagesbesuch
                                            </h3>
                                            <p className="text-white/75 text-lg leading-relaxed">
                                                Tagsüber ist The Maze schön, aber halb leer. Der Ort lebt erst, wenn am späten
                                                Nachmittag das Licht auf der Bucht goldorange wird, und richtig, wenn abends die
                                                Musiker kommen. Schau, wann die nächste Friday Jazz Session stattfindet, oft am
                                                ersten oder dritten Freitag im Monat. Wir treffen uns am späten Nachmittag, fahren
                                                gemeinsam mit dem VW-Van ab der Rua Bento Lisboa hoch, schauen erst den Sonnenuntergang
                                                an, essen etwas, und bleiben für das erste Set. Du gehst danach mit einem Bild von
                                                Rio runter, das in keinem Reiseführer steht.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── FAQ ─────────────────────────────────────────── */}
                    <section className="py-20 lg:py-24 bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <div className="max-w-[800px] mx-auto">
                                    <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                        Häufige Fragen zu The Maze
                                    </h2>
                                </div>
                            </FadeIn>
                            <FadeIn direction="up">
                                <div className="max-w-[800px] mx-auto">
                                    <Faq items={faqs} />
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    {/* ── Passt gut dazu ─────────────────────────────── */}
                    <section className="py-20 lg:py-24 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-5 lg:px-8">
                            <FadeIn direction="up" className="mb-10">
                                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Passt gut dazu…
                                </h2>
                                <p className="text-gray-500 mt-2 text-lg">
                                    Drei Orte, die mit The Maze dieselbe Lust am Selbstgemachten teilen.
                                </p>
                            </FadeIn>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <FadeIn delay={0} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/santa-marta"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/rio-favela.webp"
                                                alt="Favela Santa Marta in Botafogo"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Botafogo
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Favela Santa Marta</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Ein anderer Morro, eine andere Geschichte. Klein, lebendig, mit der besseren Aussicht auf den Cristo.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                                <FadeIn delay={0.08} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/rocinha"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/rocinha.webp"
                                                alt="Favela Rocinha, die größte Favela Brasiliens"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Größte Favela
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Rocinha</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Die andere Extremerfahrung. 100.000 Einwohner, eine ganze Stadt im Berg.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                                <FadeIn delay={0.16} direction="up" className="flex">
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/escadaria-selaron"
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden w-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src="/images/selaron-bg.webp"
                                                alt="Escadaria Selarón im Stadtteil Lapa"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold text-rio-green uppercase tracking-wider">
                                                Kunst
                                            </span>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold font-heading text-gray-900 mb-2">Escadaria Selarón</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                                                Dieselbe Seele wie The Maze. Ein Einwanderer, der von Hand etwas baut, das ein ganzes Leben dauert.
                                            </p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-rio-green group-hover:text-rio-yellow transition-colors mt-4">
                                                Mehr erfahren <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>

                            </div>
                        </div>
                    </section>

                    {/* ── CTA Final ──────────────────────────────────── */}
                    <section className="py-24 relative overflow-hidden bg-[#0d1f15] border-t-4 border-rio-yellow">
                        <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#22a262]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                        <div className="relative max-w-4xl mx-auto px-5 text-center">
                            <FadeIn direction="up">
                                <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6 leading-tight">
                                    The Maze{" "}
                                    <br className="hidden sm:block" />
                                    <span className="text-rio-yellow">mit deutschsprachigem Guide in Rio entdecken</span>
                                </h2>
                                <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Ich plane den Abend so, dass du den Sonnenuntergang oben mitnimmst und ohne Stress zur
                                    Jazz-Session bleibst. Privattransfer, Begleitung und Erklärungen auf Deutsch inklusive.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        href="/touren/favela-tour"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        <Phone className="w-5 h-5" />
                                        The Maze mit Will entdecken
                                    </Link>
                                    <Link
                                        href="/kontakt"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Kontakt aufnehmen
                                    </Link>
                                </div>
                            </FadeIn>
                        </div>
                    </section>

                    <AndereTouren currentSlug="__the-maze__" prioritySlugs={["favela-tour", "kultur-geschichte", "klassiker"]} />

                </main>

                <FooterServer />
            </div>
        </>
    );
}
