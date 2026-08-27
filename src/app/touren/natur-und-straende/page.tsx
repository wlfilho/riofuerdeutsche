import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Clock,
    Phone,
    Activity,
    CalendarDays,
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata = {
    title: "Natur & Strände in Rio — Wanderungen & Regenwald",
    description: "Entdecken Sie Rios wilde Seite: Tijuca-Regenwald, Pedra da Gávea, Prainha und versteckte Strände mit einem deutschsprachigen Guide. Natur-Touren für Abenteurer und Naturliebhaber.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/natur-und-straende",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/natur-und-straende",
    },
};

const estimatedTourDuration = "3–8 Stunden";

const naturalAttractions = [
    {
        name: "Tijuca-Regenwald",
        time: "~3–4 Std.",
        effort: "Moderat",
        image: "/images/floresta-da-tijuca.webp",
        desc: "Der größte urbane Regenwald der Welt liegt mitten in Rio. Auf versteckten Wanderwegen erwarten dich Wasserfälle, exotische Vögel und eine Stille, die du mitten in einer Millionenstadt nie erwartet hättest.",
        tip: "Ich kenne Wasserfälle, die in keinem Reiseführer stehen — Cascatinha Taunay und der versteckte Poço do Rinoceronte gehören zu meinen Favoriten.",
        style: { objectPosition: "50% 0%" }
    },
    {
        name: "Pico da Tijuca",
        time: "~4–5 Std.",
        effort: "Anspruchsvoll",
        image: "/images/pico-da-tijuca.webp",
        desc: "Mit 1.022 Metern ist der Pico da Tijuca der höchste Punkt des Nationalparks. Die Wanderung durch dichten Atlantischen Regenwald wird mit einem 360°-Panorama über ganz Rio belohnt — ein unvergessliches Erlebnis für aktive Naturliebhaber.",
        tip: "Die letzten Meter zum Gipfel führen über Metalltreppen am Felsen — abenteuerlich, aber absolut sicher und die Aussicht ist die Belohnung."
    },
    {
        name: "Pedra Bonita",
        time: "~2–3 Std.",
        effort: "Moderat",
        image: "/images/pedra-bonita.webp",
        desc: "Die Pedra Bonita bietet einen der spektakulärsten Aussichtspunkte Rios — und ist gleichzeitig die Startrampe für Gleitschirmflieger. Die moderate Wanderung führt durch den Regenwald und endet mit einem Panoramablick, der dir den Atem raubt.",
        tip: "Von hier siehst du gleichzeitig die Pedra da Gávea, die Strände der Südzone und die Lagunen — perfekt bei klarem Wetter am Vormittag."
    },
    {
        name: "Pedra da Gávea",
        time: "~5–6 Std.",
        effort: "Anspruchsvoll",
        image: "/images/pedra-da-gavea.webp",
        desc: "Einer der höchsten Küstenfelsen der Welt — 844 Meter über dem Meer. Die Wanderung ist anspruchsvoll, mit einer berühmten Kletterpassage namens „Carrasqueira\", aber der Blick vom Gipfel ist absolut episch.",
        tip: "Diese Tour ist nur für sportliche Wanderer geeignet. Dafür erlebst du Rio aus einer Perspektive, die kaum ein Tourist je sieht."
    },
    {
        name: "Morro Dois Irmãos",
        time: "~3 Std.",
        effort: "Moderat",
        image: "/images/morro-dois-irmaos.webp",
        desc: "Die „Zwei Brüder\" sind die ikonischen Zwillingsgipfel über Ipanema und Leblon. Die Wanderung startet im Vidigal und belohnt dich mit einem der legendärsten Blicke über Rio — Strände, Lagune und Meer, alles auf einmal.",
        tip: "Der Aufstieg durch die Favela Vidigal ist Teil des Erlebnisses — bunt, lebendig und mit lokalen Bars unterwegs."
    },
    {
        name: "Praia Vermelha",
        time: "~1–2 Std.",
        effort: "Leicht",
        image: "/images/praia-vermelha.webp",
        desc: "Ein kleiner, geschützter Strand direkt am Fuß des Zuckerhuts. Kristallklares Wasser, umgeben von Regenwald und Felsen — ein Geheimtipp, der sich wie eine Karibik-Oase mitten in Rio anfühlt.",
        tip: "Perfekt zum Kombinieren mit dem Zuckerhut oder einem Spaziergang auf der Pista Claudio Coutinho, einem flachen Uferweg mit Affen und Meerblick."
    },
    {
        name: "Prainha",
        time: "~3–4 Std.",
        effort: "Leicht",
        image: "/images/prainha.webp",
        desc: "Der schönste Naturstrand Rios, versteckt hinter grünen Hügeln im Westen der Stadt. Surfer lieben die Wellen, Naturfreunde den unberührten Atlantischen Regenwald rundherum. Kein Hochhaus, keine Hotelketten — nur Natur.",
        tip: "Prainha ist unter der Woche fast menschenleer. Am Wochenende wird es voller — ich plane die Tour immer für einen Wochentag."
    },
    {
        name: "Praia de Grumari",
        time: "~3–4 Std.",
        effort: "Leicht",
        image: "/images/grumari.webp",
        desc: "Noch wilder und unberührter als Prainha: Grumari ist ein Naturschutzgebiet mit goldenem Sand, türkisfarbenem Wasser und grünen Hügeln. Einer der letzten Strände Rios, der sich anfühlt wie vor 100 Jahren.",
        tip: "Grumari und Prainha liegen nebeneinander — wir kombinieren beide an einem Tag für das ultimative Strand-und-Natur-Erlebnis."
    },
    {
        name: "Botanischer Garten",
        time: "~1,5–2 Std.",
        effort: "Leicht",
        image: "/images/jardim-botanico.webp",
        desc: "140 Hektar tropische Pracht mit der berühmten Palmenallee, riesigen Seerosen und über 6.500 Pflanzenarten. Ein Ort der Ruhe und Schönheit, perfekt als entspannter Start oder Ausklang eines Naturtages.",
        tip: "Kombiniere den Botanischen Garten mit dem benachbarten Parque Lage für einen entspannten Vormittag zwischen Natur und Kultur."
    }
];

export default async function NaturTourPage() {
    const settings = await getSettings()

    const { whatsappHref: whatsappLink } = buildContactUrls(settings)
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für eine Natur & Strände Tour in Rio...");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-green">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/natur-und-straende.webp"
                            alt="Rios wilde Seite: Regenwald und Berge"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav className="flex items-center text-sm font-medium text-white/60 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-white/60">Touren & Ausflüge</span>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Natur & Strände</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {naturalAttractions.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,4vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Rios wilde Seite
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Regenwald, Berge und versteckte Strände
                                </p>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    {/* Primário passa a ser a Anfrage, com o slug da própria rota:
                                        assim dá pra saber qual página de tour converte. O WhatsApp
                                        continua visível ao lado, nunca escondido. */}
                                    <Link
                                        href="/anfrage?von=site&tour=natur-und-straende"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Tour anfragen
                                    </Link>
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Auf WhatsApp schreiben
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO B — Texto Introdutório */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Rio de Janeiro ist mehr als Copacabana und Christus-Statue. Hinter den berühmten Stränden verbirgt sich eine wilde, unberührte Natur, die selbst viele Besucher nie zu sehen bekommen: der größte urbane Regenwald der Welt, dramatische Granitgipfel mit atemberaubenden Aussichten, versteckte Wasserfälle und einsame Strände, die nur Einheimische kennen.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Als gebürtiger Carioca kenne ich die Wanderwege, Geheimpfade und Naturjuwelen Rios wie meine Westentasche. Ob eine leichte Wanderung durch den Tijuca-Regenwald, eine anspruchsvolle Gipfeltour auf die Pedra da Gávea oder ein entspannter Tag an den wilden Stränden von Prainha und Grumari — ich zeige dir das grüne, abenteuerliche Rio abseits der Touristenpfade.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Die Touren variieren je nach Ziel zwischen 3 und 8 Stunden. Schreib mir einfach, was dich am meisten interessiert, und ich stelle die perfekte Natur-Tour für dich zusammen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Grid Placeholder */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Entdecke Rios Natur — <span className="text-rio-green">9 Highlights</span>
                            </h2>
                        </FadeIn>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {naturalAttractions.map((attr, index) => {
                                const hasLink = "link" in attr && !!(attr as any).link;
                                const cardContent = (
                                    <>
                                        <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                                            <Image
                                                src={attr.image}
                                                alt={attr.name}
                                                fill
                                                loading="lazy"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                style={(attr as any).style}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                                <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm uppercase tracking-wider">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    {attr.time}
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-white/90 backdrop-blur-sm shadow-sm ${attr.effort === "Leicht" ? "text-green-700" : attr.effort === "Moderat" ? "text-blue-700" : "text-orange-700"}`}>
                                                    <Activity className="w-4 h-4" />
                                                    {attr.effort}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-2">{attr.name}</h3>
                                            <p className="text-gray-500 text-sm mb-3">{attr.desc}</p>
                                            <p className="text-gray-400 text-xs italic flex-grow">💡 {attr.tip}</p>
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
                                        <Link href={(attr as any).link} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] border border-gray-100 transition-all duration-300 group flex flex-col h-full cursor-pointer block">
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

                {/* SEÇÃO D — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1920&h=800&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Dein Abenteuer in Rios Natur — <br className="hidden sm:block" />
                                <span className="text-rio-yellow">ich plane es für dich.</span>
                            </h2>
                             <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                                Ob Regenwald-Wanderung, Gipfeltour oder versteckter Strand — schreib mir per WhatsApp oder E-Mail und ich stelle deine perfekte Natur-Tour zusammen.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&tour=natur-und-straende"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Tour anfragen
                                </Link>
                                <a
                                    href={`${whatsappLink}?text=${customWhatsappMsg}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp an uns
                                </a>
                                <Link
                                    href="/kontakt"
                                    className="inline-flex items-center justify-center px-2 py-4 text-sm text-white/70 underline underline-offset-4 hover:text-white transition-colors"
                                >
                                    Lieber per E-Mail?
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C.2 — Interne Linkagem */}
                <AndereTouren currentSlug="natur-und-straende" />
            </main>

            <FooterServer />
        </div>
    );
}
