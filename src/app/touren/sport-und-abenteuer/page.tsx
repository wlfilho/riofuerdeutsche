import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, Phone, CalendarDays, MapPin, Clock } from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Sport & Abenteuer in Rio de Janeiro — Surfen, Paragliding & mehr | RioFürDeutsche",
    description: "Erlebe Rio de Janeiro von der sportlichen Seite — Surfen, Stand-up Paddle, Paragliding und Asa Delta. Adrenalin pur mit einem lokalen Guide, sicher und auf Deutsch.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/sport-und-abenteuer",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/sport-und-abenteuer",
    },
};

const estimatedTourDuration = "2–4 Stunden";

const activities = [
    {
        title: "Surfen in Rio de Janeiro",
        description: "Rio hat einige der besten Surfspots Brasiliens — direkt vor der Haustür. Von den kraftvollen Wellen in Prainha und Grumari über die anfängerfreundliche Praia do Arpoador bis zum konsistenten Break am Posto 7 in Recreio. Egal ob Anfänger oder erfahrener Surfer, ich finde den perfekten Spot und den richtigen Instructor für dich.",
        tip: "Prainha ist der beste Surfspot in Rio — aber nur Locals wissen, wann die Bedingungen perfekt sind. Ich checke den Swell-Forecast und bringe dich zur richtigen Zeit an den richtigen Strand.",
        image: "/images/surf-untericht.webp",
        badges: [
            { icon: MapPin, text: "Prainha / Arpoador" },
            { icon: Clock, text: "~3 Stunden" }
        ]
    },
    {
        title: "Stand-up Paddle",
        description: "Stand-up Paddle in Rio ist ein Erlebnis der besonderen Art. Paddle über das ruhige Wasser der Lagoa Rodrigo de Freitas mit dem Cristo Redentor im Hintergrund, erkunde die Küste von Urca mit Blick auf den Zuckerhut oder genieße den Sonnenaufgang auf dem Meer vor Copacabana. Perfekt für alle Fitness-Levels.",
        tip: "Die Lagoa ist perfekt für Anfänger — kein Wellengang und eine traumhafte Kulisse. Für Fortgeschrittene empfehle ich die Route entlang der Küste von Urca bei Sonnenaufgang.",
        image: "/images/sup-rio.webp",
        badges: [
            { icon: MapPin, text: "Lagoa / Urca / Copa" },
            { icon: Clock, text: "~2 Stunden" }
        ]
    },
    {
        title: "Paragliding über São Conrado",
        description: "Vom Startpunkt an der Pedra Bonita (520 Meter Höhe) springst du mit einem erfahrenen Tandem-Piloten in die Luft und gleitest über den Tijuca-Regenwald, die Favela Rocinha und den Strand von São Conrado — mit einem Panoramablick, den du nie vergessen wirst. Die Landung erfolgt direkt am Strand. Eines der ikonischsten Erlebnisse in Rio.",
        tip: "Morgens zwischen 8 und 10 Uhr sind die Bedingungen oft am besten — weniger Wind, klarere Sicht. Ich organisiere den Transfer zur Rampe und einen zertifizierten Piloten, der auch Englisch oder Deutsch spricht.",
        image: "/images/paraglider-rio.webp",
        badges: [
            { icon: MapPin, text: "Pedra Bonita / São Conrado" },
            { icon: Clock, text: "~2 Stunden (inkl. Transfer)" }
        ]
    },
    {
        title: "Asa Delta — Drachenfliegen",
        description: "Asa Delta ist das Original — Rio de Janeiro ist einer der wenigen Orte weltweit, wo man mitten over einer Millionenstadt Drachenfliegen kann. Der Start erfolgt von der gleichen Rampe wie beim Paragliding (Pedra Bonita), aber das Gefühl ist völlig anders: du liegst horizontal, spürst den Wind direkt und fliegst wie ein Vogel über die Stadt. Noch intensiver, noch freier, noch unvergesslicher.",
        tip: "Asa Delta ist nichts für schwache Nerven — aber mit einem erfahrenen Tandem-Piloten bist du in sicheren Händen. Der Flug dauert etwa 10-15 Minuten und endet mit einer sanften Landung am Strand von São Conrado.",
        image: "/images/drachen-fliegen-rio.webp",
        badges: [
            { icon: MapPin, text: "Pedra Bonita / São Conrado" },
            { icon: Clock, text: "~2 Stunden (inkl. Transfer)" }
        ]
    }
];

export default function SportUndAbenteuerPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/surf-untericht-bg.webp"
                            alt="Sport & Abenteuer in Rio de Janeiro"
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
                            {/* Breadcrumb */}
                            <nav className="flex items-center text-sm font-medium text-gray-400 mb-8" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-rio-yellow transition-colors">Startseite</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <Link href="/touren" className="hover:text-rio-yellow transition-colors">Touren & Ausflüge</Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Sport & Abenteuer</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · Adrenalin & Natur</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(28px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Sport & Abenteuer in Rio de Janeiro
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Adrenalin, Natur und unvergessliche Erlebnisse
                                </p>

                                <div className="pt-6">
                                    <a
                                        href={`https://wa.me/573148704374?text=${encodeURIComponent("Hallo! Ich interessiere mich für Sport & Abenteuer-Aktivitäten in Rio. Kannst du mir mehr erzählen?")}`}
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
                                {/* Lead Paragraph */}
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Rio de Janeiro ist nicht nur zum Anschauen da — die Stadt ist ein riesiger Outdoor-Spielplatz. Zwischen Atlantik und Regenwald, Stränden und Granitfelsen warten Erlebnisse, die deinen Puls garantiert in die Höhe treiben.
                                </p>

                                {/* Body Paragraph */}
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Ob du auf den Wellen von Prainha surfst, über die Strände von Ipanema paddelst, mit dem Gleitschirm über São Conrado schwebst oder mit einem Asa Delta über die Stadt fliegst — ich organisiere alles für dich. Von der Ausrüstung über den Instructor bis zum sicheren Transport. Du genießt das Adrenalin, ich kümmere mich um den Rest.
                                    </p>
                                </div>

                                {/* Separator */}
                                <div className="h-px bg-gray-200 w-full my-8"></div>

                                {/* CTA Paragraph */}
                                <p className="text-lg font-semibold text-gray-900 pt-0">
                                    Schreib mir einfach, welche Aktivität dich interessiert, und ich stelle dein persönliches Abenteuer in Rio zusammen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Grade de Atividades */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Sport & Abenteuer in Rio de Janeiro — <span className="text-rio-green">4 Erlebnisse für Adrenalin-Fans</span>
                            </h2>
                            <p className="text-gray-500 mt-3 text-lg">Vom Ozean bis in die Lüfte — hier sind die besten Outdoor-Aktivitäten, die ich für dich organisieren kann.</p>
                        </FadeIn>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {activities.map((item, index) => (
                                <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                    <div className="h-64 lg:h-72 w-full relative overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-bold font-heading text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 text-base mb-4 leading-relaxed">{item.description}</p>
                                        <p className="text-gray-400 text-sm italic mb-8 flex-grow">💡 {item.tip}</p>

                                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-50">
                                            {item.badges.map((badge, bIndex) => (
                                                <div key={bIndex} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${bIndex === 0 ? 'bg-rio-green/5 text-rio-green' : 'bg-gray-100 text-gray-600'}`}>
                                                    <badge.icon className="w-3.5 h-3.5" />
                                                    {badge.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Dein Abenteuer in Rio de Janeiro — sicher und unvergesslich.
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                                Schreib mir per WhatsApp oder E-Mail und ich organisiere dein perfektes Sport-Erlebnis — vom Surfkurs bis zum Paragliding-Flug, alles sicher und mit lokaler Expertise.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href={`https://wa.me/573148704374?text=${encodeURIComponent("Hallo! Ich interessiere mich für Sport & Abenteuer-Aktivitäten in Rio. Kannst du mir mehr erzählen?")}`}
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

                {/* Outras Touren */}
                <AndereTouren currentSlug="sport-und-abenteuer" />
            </main>

            <Footer />
        </div>
    );
}
