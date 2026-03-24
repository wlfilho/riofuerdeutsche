import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import {
    ChevronRight,
    Clock,
    Phone,
    Activity,
    CheckCircle2,
    CalendarDays,
    Eye,
    Palette,
    Camera,
    Mountain,
    Leaf,
    Gem
} from "lucide-react";
import AndereTouren from "@/components/AndereTouren";

export const metadata = {
    title: "Klassiker Tour Rio — Sehenswürdigkeiten mit deutschem Guide",
    description: "Entdecken Sie Rios schönste Sehenswürdigkeiten auf einer privaten Tagestour auf Deutsch. Corcovado, Zuckerhut, Escadaria Selarón und mehr — 8 Stunden, 3–4 Highlights, ein unvergesslicher Tag.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren/klassiker",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren/klassiker",
    },
};

const estimatedTourDuration = "8 Stunden";

const attractions = [
    {
        name: "Christus-Erlöser (Corcovado)",
        time: "~2 Std.",
        desc: "Das Wahrzeichen Rios thront auf 710 Metern über der Stadt. Von hier oben hast du einen 360°-Blick über die Strände, die Bucht und den Regenwald — ein Moment, den du nie vergisst.",
        tip: "Früh am Morgen oder kurz vor Schließung sind die besten Zeiten — weniger Touristen, besseres Licht für Fotos.",
        effort: "Leicht",
        gradient: "from-blue-100 to-blue-200",
        image: "/images/cristo.webp",
        style: { objectPosition: "50% 0%" }
    },
    {
        name: "Zuckerhut (Pão de Açúcar)",
        time: "~2,5 Std.",
        desc: "Zwei Seilbahnfahrten bringen dich auf den legendären Zuckerhut. Der Blick auf die Guanabara-Bucht, den Corcovado und die Skyline von Rio ist atemberaubend — besonders zum Sonnenuntergang.",
        tip: "Der Sonnenuntergang vom Zuckerhut ist eines der schönsten Erlebnisse in Rio. Ich plane die Tour so, dass wir genau zur richtigen Zeit oben sind.",
        effort: "Leicht",
        gradient: "from-orange-100 to-orange-200",
        image: "/images/zuckerhut.jpg"
    },
    {
        name: "Escadaria Selarón",
        time: "~45 Min.",
        desc: "215 Stufen, bedeckt mit over 2.000 bunten Fliesen aus aller Welt — das Lebenswerk des chilenischen Künstlers Jorge Selarón. Eine der meistfotografierten Treppen der Welt, mitten im Herzen von Lapa.",
        tip: "Frühmorgens hast du die Treppe fast für dich allein — perfekt für Fotos ohne Menschenmassen.",
        effort: "Leicht",
        gradient: "from-red-100 to-red-200",
        image: "/images/selaron.webp"
    },
    {
        name: "Santa Teresa",
        time: "~1,5 Std.",
        desc: "Das Künstlerviertel auf dem Hügel: kopfsteingepflasterte Gassen, bunte Häuser, Ateliers und ein Panoramablick über die Stadt. Santa Teresa zeigt dir das kreative, authentische Rio abseits der Touristenpfade.",
        tip: "Wir kombinieren Santa Teresa ideal mit der Escadaria Selarón und den Arcos da Lapa — alles fußläufig erreichbar.",
        effort: "Moderat",
        gradient: "from-yellow-100 to-yellow-200",
        image: "/images/santa-teresa.webp"
    },
    {
        name: "Mirante Dona Marta",
        time: "~1 Std.",
        desc: "Der vielleicht beste Aussichtspunkt Rios — und kaum ein Tourist kennt ihn. Von hier siehst du den Christus, den Zuckerhut, die Lagoa und die Strände in einem einzigen, spektakulären Panorama.",
        tip: "Dies ist mein persönlicher Lieblingsort in Rio. Der Blick von hier ist besser als vom Corcovado — und es gibt keine Warteschlangen.",
        effort: "Leicht",
        gradient: "from-green-100 to-green-200",
        image: "/images/dona-marta.webp"
    },
    {
        name: "Pedra do Arpoador",
        time: "~1 Std.",
        desc: "Der Felsen zwischen Copacabana und Ipanema ist der Ort, an dem die Cariocas den Sonnenuntergang feiern — mit Applaus, wenn die Sonne im Meer versinkt. Ein magischer Moment und echtes Rio-Feeling.",
        tip: "Am Abend klatschen die Einheimischen, wenn die Sonne untergeht. Diesen Moment erlebst du nirgendwo sonst auf der Welt.",
        effort: "Leicht",
        gradient: "from-teal-100 to-teal-200",
        image: "/images/arpoador-v2.webp",
        style: { objectPosition: "50% 20%" }
    },
    {
        name: "Tijuca-Regenwald",
        time: "~3 Std.",
        desc: "Der größte urbane Regenwald der Welt — mitten in Rio. Wanderwege, Wasserfälle und eine unglaubliche Artenvielfalt erwarten dich, nur wenige Minuten vom Stadtzentrum entfernt.",
        tip: "Ich kenne Wege und Wasserfälle, die in keinem Reiseführer stehen. Für Naturliebhaber ist die Tijuca ein absolutes Muss.",
        effort: "Moderat",
        gradient: "from-emerald-100 to-emerald-200",
        image: "/images/rio-natur.webp"
    },
    {
        name: "Botanischer Garten (Jardim Botânico)",
        time: "~1,5 Std.",
        desc: "140 Hektar tropische Pracht: die berühmte Palmenallee, riesige Seerosen, Orchideen und over 6.500 Pflanzenarten. Ein Ort der Ruhe und Schönheit mitten in der pulsierenden Stadt.",
        tip: "Die Palmenallee am Eingang ist eines der schönsten Fotomotive Rios. Perfekt zum Kombinieren mit Parque Lage nebenan.",
        effort: "Leicht",
        gradient: "from-lime-100 to-lime-200",
        image: "/images/jardim-botanico.webp"
    },
    {
        name: "Parque Lage",
        time: "~1 Std.",
        desc: "Ein historisches Herrenhaus am Fuße des Corcovado, umgeben von üppigem Regenwald. Das Café im Innenhof mit Blick auf den Christus ist einer der instagrammbarsten Orte Rios.",
        tip: "Das Frühstück im Café des Palastes mit Blick auf den Christus ist der perfekte Start in deinen Rio-Tag.",
        effort: "Leicht",
        gradient: "from-stone-100 to-stone-200",
        image: "/images/parque-lage.webp"
    },
    {
        name: "Lagoa Rodrigo de Freitas",
        time: "~1 Std.",
        desc: "Die Lagune im Herzen der Südzone, umgeben von Bergen und den Stadtvierteln Ipanema, Leblon und Jardim Botânico. Ideal zum Spazieren, Radfahren oder einfach die Aussicht genießen.",
        tip: "Am späten Nachmittag spiegeln sich die Berge im Wasser — ein großartiger Zwischenstopp auf dem Weg zum Sonnenuntergang am Arpoador.",
        effort: "Leicht",
        gradient: "from-cyan-100 to-cyan-200",
        image: "/images/lagoa.webp"
    },
    {
        name: "Urca",
        time: "~1,5 Std.",
        desc: "Das ruhigste Viertel Rios, direkt am Fuß des Zuckerhuts. Kleine Gassen, historische Häuser und die Mureta da Urca — eine Mauer am Meer, wo Einheimische bei Sonnenuntergang ein kühles Bier genießen.",
        tip: "Die Mureta da Urca bei Sonnenuntergang ist das authentischste Rio-Erlebnis: Bier, Meerblick, Einheimische — kein Tourist weit und breit.",
        effort: "Leicht",
        gradient: "from-sky-100 to-sky-200",
        image: "/images/urca.webp"
    },
    {
        name: "Arcos da Lapa",
        time: "~30 Min.",
        desc: "Das imposante Aquädukt aus dem 18. Jahrhundert ist das Tor zum Stadtviertel Lapa — Rios Zentrum für Nachtleben, Samba und Straßenkunst. Tagsüber ein fotogenes Wahrzeichen, nachts voller Energie.",
        tip: "Perfekt als Ausgangspunkt: Von hier geht es zu Fuß zur Escadaria Selarón oder mit der historischen Straßenbahn hoch nach Santa Teresa.",
        effort: "Leicht",
        gradient: "from-indigo-100 to-indigo-200",
        image: "/images/lapa.webp"
    }
];

const programs = [
    {
        icon: Eye,
        title: "Aussicht & Natur",
        description: "Ein Tag für alle, die Rio von oben erleben wollen. Wir starten entspannt im Grünen und arbeiten uns zu den spektakulärsten Aussichtspunkten der Stadt vor — bis zum perfekten Sonnenuntergang am Meer.",
        schedule: [
            { time: "09:00", activity: "Parque Lage (Frühstück mit Blick auf den Christus)" },
            { time: "10:30", activity: "Christus-Erlöser (Corcovado)" },
            { time: "13:00", activity: "Mirante Dona Marta (Panoramablick über die ganze Stadt)" },
            { time: "15:30", activity: "Pedra do Arpoador (Sonnenuntergang zwischen Copacabana und Ipanema)" }
        ]
    },
    {
        icon: Palette,
        title: "Kunst & Kultur",
        description: "Das kreative, bunte Rio: Street Art, historische Viertel und tropische Gärten. Dieser Tag zeigt dir die Seele der Stadt — abseits der üblichen Touristenpfade.",
        schedule: [
            { time: "09:00", activity: "Escadaria Selarón (die berühmte Fliesentreppe, morgens fast leer)" },
            { time: "10:00", activity: "Arcos da Lapa (historisches Aquädukt und Straßenkunst)" },
            { time: "11:30", activity: "Santa Teresa (Künstlerviertel mit Panoramablick)" },
            { time: "14:00", activity: "Botanischer Garten (tropische Ruhe und Palmenallee)" }
        ]
    },
    {
        icon: Camera,
        title: "Die Postkarten-Tour",
        description: "Die Ikonen, die jeder kennen muss — aber mit einem Carioca, der dir die besten Zeiten, Blickwinkel und Geschichten hinter den Postkarten-Motiven zeigt.",
        schedule: [
            { time: "08:30", activity: "Christus-Erlöser (Corcovado, früh = weniger Touristen)" },
            { time: "11:00", activity: "Zuckerhut (Seilbahn with Blick auf die Bucht)" },
            { time: "14:00", activity: "Copacabana (Strandpromenade und Mittagspause)" },
            { time: "16:00", activity: "Lagoa Rodrigo de Freitas (Spaziergang am See mit Bergpanorama)" }
        ]
    },
    {
        icon: Mountain,
        title: "Berg & Meer",
        description: "Vom dichten Regenwald over atemberaubende Aussichtspunkte bis zum Meer — dieser Tag vereint die dramatische Geografie Rios in einem einzigen, unvergesslichen Erlebnis.",
        schedule: [
            { time: "08:30", activity: "Tijuca-Regenwald (Wanderung, Wasserfälle, Natur pur)" },
            { time: "11:30", activity: "Mirante Dona Marta (Panorama als Belohnung)" },
            { time: "13:30", activity: "Urca (Mittagspause im ruhigsten Viertel Rios)" },
            { time: "15:00", activity: "Zuckerhut (Seilbahn und Sonnenuntergang)" }
        ]
    },
    {
        icon: Leaf,
        title: "Natur pur",
        description: "Für Naturliebhaber, die das grüne Rio entdecken wollen: Regenwald, tropische Gärten, eine historische Parkanlage und die Lagune im Herzen der Stadt.",
        schedule: [
            { time: "08:30", activity: "Tijuca-Regenwald (Wanderung zu versteckten Wasserfällen)" },
            { time: "11:30", activity: "Botanischer Garten (6.500 Pflanzenarten, Palmenallee)" },
            { time: "14:00", activity: "Parque Lage (Kaffee im historischen Palast)" },
            { time: "15:30", activity: "Lagoa Rodrigo de Freitas (Spaziergang und Sonnenuntergang)" }
        ]
    },
    {
        icon: Gem,
        title: "Geheimtipps",
        description: "Die Orte, die nur Einheimische kennen — kein Reiseführer, keine Warteschlangen, keine Touristenmassen. Nur du, ein Carioca und das echte Rio de Janeiro.",
        schedule: [
            { time: "09:00", activity: "Urca (ruhige Gassen, Meerblick, lokales Frühstück)" },
            { time: "11:00", activity: "Mirante Dona Marta (der beste Aussichtspunkt, den Touristen nicht kennen)" },
            { time: "13:30", activity: "Parque Lage (verstecktes Juwel am Fuß des Corcovado)" },
            { time: "15:30", activity: "Pedra do Arpoador (Sonnenuntergang with Applaus der Einheimischen)" }
        ]
    }
];

export default function KlassikerTourPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/touren-und-ausfluege-in-rio-v2.webp"
                            alt="Klassiker Tour Rio de Janeiro"
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
                                <span className="text-gray-400">Touren & Ausflüge</span>
                                <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
                                <span className="text-rio-yellow">Klassiker Tour</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · {estimatedTourDuration} · {attractions.length} Highlights</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(28px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Rio de Janeiro entdecken
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Die schönsten Sehenswürdigkeiten mit einem echten Carioca
                                </p>

                                <div className="pt-6">
                                    <a
                                        href="https://wa.me/573148704374"
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

                {/* SEÇÃO B — Texto Introdutório (Atrações) */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-8 text-left">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
                                    Rio de Janeiro ist eine der visuell beeindruckendsten Städte der Welt — eine Stadt, die man nicht einfach &bdquo;besucht&ldquo;, sondern die man erlebt.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Der Corcovado mit dem Christus-Erlöser, der Zuckerhut, der Strand von Ipanema: Das sind die Postkarten-Bilder, die jeder kennt. Aber Rio hat noch viel mehr zu bieten.
                                    </p>
                                    <p>
                                        Als geborener Carioca zeige ich dir nicht nur die klassischen Highlights, sondern auch die Orte, die du in keinem Reiseführer findest: den Aussichtspunkt Mirante Dona Marta mit dem besten Blick auf die Stadt, die farbenfrohe Escadaria Selarón im Herzen von Lapa, das romantische Künstlerviertel Santa Teresa — und noch einige mehr.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Unten findest du eine Auswahl der schönsten Sehenswürdigkeiten Rios — von weltbekannten Ikonen bis zu versteckten Geheimtipps, die nur Einheimische kennen.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Grade de Atrações */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die schönsten Sehenswürdigkeiten Rios —{" "}
                                <span className="text-rio-green">auf einen Blick</span>
                            </h2>
                            <p className="text-gray-500 mt-3 text-lg">12 Highlights, von weltbekannten Ikonen bis zu versteckten Geheimtipps.</p>
                        </FadeIn>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {attractions.map((attr, index) => (
                                <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                    <div className="h-56 w-full relative overflow-hidden">
                                        <Image
                                            src={attr.image}
                                            alt={attr.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            style={attr.style as React.CSSProperties}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{attr.name}</h3>
                                        <p className="text-gray-500 text-sm mb-3">{attr.desc}</p>
                                        <p className="text-gray-400 text-xs italic mb-6 flex-grow">💡 {attr.tip}</p>

                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                {attr.time}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                                                <Activity className="w-3.5 h-3.5 text-blue-400" />
                                                {attr.effort}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — Texto Introdutório Programas */}
                <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
                    <div className="max-w-4xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-8 leading-tight">
                                Dein perfekter Rio-Tag: <br className="hidden sm:block" />
                                <span className="text-rio-green">Tagestouren mit 3–4 Highlights in 8 Stunden</span>
                            </h2>
                            <div className="prose prose-lg prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
                                <p>
                                    Ein guter Tag in Rio braucht kein vollgepacktes Programm — er braucht die richtigen Orte zur richtigen Zeit. In 8 Stunden zeige ich dir 3 bis 4 der schönsten Sehenswürdigkeiten der Stadt, abgestimmt auf deine Interessen, dein Tempo und den besten Tagesrhythmus Rios.
                                </p>
                                <p>
                                    Unten findest du einige fertige Tagesvorschläge, die ich aus Erfahrung zusammengestellt habe — jeder davon ist auf etwa 8 Stunden ausgelegt und zeigt dir einen anderen Charakter der Stadt.
                                </p>
                                <div className="bg-rio-sand/50 p-6 rounded-2xl border border-rio-yellow/30 mt-8 text-gray-800">
                                    <p className="font-semibold text-gray-900 mb-2">Du willst deinen eigenen Tag zusammenstellen?</p>
                                    <p>
                                        Kein Problem. Wähle einfach aus der Liste unten die Orte, die dich am meisten interessieren, und ich plane einen maßgeschneiderten Tour nur für dich. Schreib mir — gemeinsam finden wir das perfekte Programm für deinen Rio-Tag.
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Programas Sugeridos */}
                <section className="py-20 bg-rio-sand/30 border-t border-gray-100 pb-28">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Tagesprogramme in Rio de Janeiro —{" "}
                                <span className="text-rio-green">direkt buchbar mit lokalem Guide</span>
                            </h2>
                            <p className="text-gray-500 mt-3 text-lg">6 kuratierte Vorschläge für jeden Reisestil — oder ich stelle dir ein individuelles Programm zusammen, perfekt abgestimmt auf deine Wünsche.</p>
                        </FadeIn>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {programs.map((program, index) => (
                                <FadeIn key={index} delay={index * 0.15} direction="up" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden flex flex-col h-full">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-rio-yellow group-hover:bg-rio-green transition-colors duration-300"></div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <program.icon className="w-8 h-8 text-rio-yellow flex-shrink-0" />
                                            <h3 className="text-2xl font-bold font-heading text-gray-900">{program.title}</h3>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100/80 rounded-full text-xs font-bold text-gray-600 whitespace-nowrap">
                                            <Clock className="w-3.5 h-3.5" />
                                            ~8 Stunden
                                        </div>
                                    </div>

                                    <p className="text-gray-500 italic text-sm mb-6 leading-relaxed">
                                        {program.description}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {program.schedule.map((slot, i) => (
                                            <li key={i} className="flex gap-4 items-start text-gray-600">
                                                <span className="font-bold text-rio-green whitespace-nowrap pt-0.5 min-w-[50px]">{slot.time}</span>
                                                <span className="font-medium text-[15px] leading-snug">{slot.activity}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6 border-t border-gray-100">
                                        <a
                                            href={`https://wa.me/573148704374?text=${encodeURIComponent(`Hallo! Ich interessiere mich für die Tour „${program.title}". Könnten Sie mir mehr Informationen zu Verfügbarkeit und Preisen geben?`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rio-green text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-[1.01]"
                                        >
                                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            Tour anfragen
                                        </a>
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
                                Dein Wunschtag in Rio — <br className="hidden sm:block" />
                                <span className="text-rio-yellow">ich plane ihn für dich.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                                Schreib mir per WhatsApp oder E-Mail und wir stellen gemeinsam dein perfektes Programm zusammen.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href="https://wa.me/573148704374"
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

                {/* SEÇÃO E.2 — Interne Linkagem */}
                <AndereTouren currentSlug="klassiker" />
            </main>

            <Footer />
        </div>
    );
}
