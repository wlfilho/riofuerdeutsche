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
    title: "Tagesausflüge ab Rio — Búzios, Ilha Grande & Paraty",
    description: "Die schönsten Tagesausflüge ab Rio de Janeiro — Búzios, Ilha Grande, Paraty, Petrópolis und Arraial do Cabo. Mit einem lokalen Guide, sicher und auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/tagesausfluege",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/tagesausfluege",
    },
};

const estimatedTourDuration = "Ganztägig";

const tagesausfluegHighlights = [
    "Búzios",
    "Ilha Grande",
    "Paraty",
    "Petrópolis",
    "Arraial do Cabo",
];

const tagesausfluegDestinos = [
    {
        name: "Arraial do Cabo",
        image: "/images/arraial-do-cabo.webp",
        desc: `Arraial do Cabo wird nicht umsonst die „brasilianische Karibik" genannt. Das kristallklare, türkisblaue Wasser und die weißen Sandstrände gehören zu den schönsten des Landes. Eine Bootstour durch die Buchten ist ein absolutes Highlight — mit Schnorcheln, Schildkröten und Postkartenpanoramen.`,
        tip: "Die Praia do Forno ist der schönste Strand — erreichbar nur zu Fuß über einen kurzen Trail. Ich kenne die Route und die beste Tageszeit, um den Strand fast für dich allein zu haben.",
        badges: ["~2,5h von Rio", "Ganztägig"],
    },
    {
        name: "Búzios",
        image: "/images/buzios.webp",
        desc: "Das ehemalige Fischerdorf wurde in den 1960ern durch Brigitte Bardot weltberühmt — und hat seinen Charme bis heute bewahrt. Búzios bietet über 20 Strände, charmante Gassen voller Boutiquen und Restaurants, und eine entspannte Atmosphäre, die an die französische Riviera erinnert.",
        tip: "Die Rua das Pedras ist das Herz von Búzios — perfekt für ein Mittagessen mit Meerblick. Für den Strand empfehle ich die Praia da Tartaruga: ruhig, geschützt und ideal zum Schnorcheln.",
        badges: ["~2,5h von Rio", "Ganztägig"],
    },
    {
        name: "Ilha Grande",
        image: "/images/ilha-grande.webp",
        desc: "Ilha Grande ist eine autofreie Tropeninsel mit üppigem Regenwald, einsamen Stränden und glasklarem Wasser. Die Insel ist nur per Boot erreichbar und fühlt sich an wie eine andere Welt. Die Lopes Mendes gilt als einer der schönsten Strände Brasiliens — weißer Sand, türkises Wasser und kaum Menschen.",
        tip: "Für einen Tagesausflug empfehle ich die Bootstour rund um die Insel mit Stopps zum Schnorcheln und Schwimmen. Wer mehr Zeit hat, sollte mindestens eine Übernachtung einplanen.",
        badges: ["~3h von Rio", "Ganztägig"],
    },
    {
        name: "Paraty",
        image: "/images/paraty.webp",
        desc: "Paraty ist eine perfekt erhaltene Kolonialstadt aus dem 18. Jahrhundert — UNESCO-Weltkulturerbe, eingebettet zwischen Regenwald und Meer. Die kopfsteingepflasterten Gassen, die weißen Fassaden mit bunten Türen und Fenstern und die tropischen Inseln in der Bucht machen Paraty zu einem der charmantesten Orte Brasiliens.",
        tip: "Kombiniere den Besuch der Altstadt mit einer Bootstour durch die Bucht — mit Stopps an einsamen Stränden und Schnorchelpunkten. Die Cachaçarias (Schnapsbrennereien) auf dem Weg sind ebenfalls einen Stopp wert.",
        badges: ["~4h von Rio", "Ganztägig"],
    },
    {
        name: "Petrópolis",
        image: "/images/palacio-quitandinha-petropolis.webp",
        desc: `Die „Kaiserstadt" in den Bergen war einst die Sommerresidenz des brasilianischen Kaisers Pedro II. Auf 800 Metern Höhe ist es angenehm kühl, und die Stadt bietet das Museu Imperial (der meistbesuchte Palast Brasiliens), die Kathedrale São Pedro de Alcântara und eine charmante Innenstadt mit deutschem und österreichischem Einfluss.`,
        tip: "Petrópolis ist perfekt für einen Regentag — auf 800 Metern ist das Wetter oft anders als in Rio, und die Museen und Cafés sind hervorragend. Die Cervejaria Bohemia bietet eine tolle Brauereitour.",
        badges: ["~1,5h von Rio", "Ganztägig"],
    },
];

export default function TagesausfluegePage() {
    const whatsappLink = "https://wa.me/573148704374";
    const customWhatsappMsg = encodeURIComponent("Hallo! Ich interessiere mich für einen Tagesausflug ab Rio. Kannst du mir mehr erzählen?");

    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/ilha-grande-bg.webp"
                            alt="Tagesausflüge ab Rio de Janeiro — Arraial do Cabo, Búzios und Ilha Grande"
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
                                <span className="text-rio-yellow">Tagesausflüge</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {tagesausfluegHighlights.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Tagesausflüge ab Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Traumhafte Ziele rund um Rio mit deinem lokalen Guide
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
                                    <Link href="/touren/klassiker" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Rio de Janeiro</Link> ist spektakulär — aber die Region rund um die Stadt hat noch viel mehr zu bieten. Paradiesische Strände, koloniale Bergstädte, tropische Inseln und kristallklares Wasser warten nur wenige Stunden entfernt auf dich.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Mit meinen Tagesausflügen erlebst du die schönsten Ziele rund um Rio — bequem, sicher und ohne den Stress, alles selbst organisieren zu müssen. Ich hole dich ab, fahre dich hin, zeige dir die besten Spots und bringe dich abends entspannt zurück. Alles auf Deutsch, alles mit Insider-Wissen.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Von den Traumstränden in Arraial do Cabo über die charmante Kolonialstadt Paraty bis zur tropischen Ilha Grande — schreib mir und ich plane deinen perfekten Ausflug.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Cards Destinos */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12 text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Tagesausflüge ab Rio de Janeiro — <span className="text-rio-green">5 traumhafte Ziele</span>
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg">
                                Jedes Ziel hat seinen eigenen Charme. Hier sind die besten Ausflüge, die ich für dich organisieren kann.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tagesausfluegDestinos.map((place, index) => {
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
                                Tagesausflüge ab Rio — <span className="text-rio-yellow text-2xl lg:text-4xl">ich plane deinen perfekten Tag.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Schreib mir per WhatsApp oder E-Mail und wir planen gemeinsam deinen Tagesausflug — von Búzios bis Ilha Grande, alles auf Deutsch und ohne Stress.
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
                <AndereTouren currentSlug="tagesausfluege" />
            </main>

            <Footer />
        </div>
    );
}
