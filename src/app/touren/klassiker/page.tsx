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
    Gem,
    Mail
} from "lucide-react";

export const metadata = {
    title: "Klassiker Tour Rio de Janeiro — Sehenswürdigkeiten mit deutschsprachigem Guide | RioFürDeutsche",
    description: "Entdecken Sie Rios schönste Sehenswürdigkeiten auf einer privaten Tagestour auf Deutsch. Corcovado, Zuckerhut, Escadaria Selarón und mehr — 8 Stunden, 3–4 Highlights, ein unvergesslicher Tag."
};

const attractions = [
    { name: "Christus-Erlöser (Corcovado)", time: "~2 Std.", desc: "Das Wahrzeichen Rios thront auf 710 Metern über der Stadt. Von hier oben hast du einen 360°-Blick über die Strände, die Bucht und den Regenwald — ein Moment, den du nie vergisst.", tip: "Früh am Morgen oder kurz vor Schließung sind die besten Zeiten — weniger Touristen, besseres Licht für Fotos.", effort: "Leicht", gradient: "from-blue-100 to-blue-200" },
    { name: "Zuckerhut (Pão de Açúcar)", time: "~2,5 Std.", desc: "Zwei Seilbahnfahrten bringen dich auf den legendären Zuckerhut. Der Blick auf die Guanabara-Bucht, den Corcovado und die Skyline von Rio ist atemberaubend — besonders zum Sonnenuntergang.", tip: "Der Sonnenuntergang vom Zuckerhut ist eines der schönsten Erlebnisse in Rio. Ich plane die Tour so, dass wir genau zur richtigen Zeit oben sind.", effort: "Leicht", gradient: "from-orange-100 to-orange-200" },
    { name: "Escadaria Selarón", time: "~45 Min.", desc: "215 Stufen, bedeckt mit über 2.000 bunten Fliesen aus aller Welt — das Lebenswerk des chilenischen Künstlers Jorge Selarón. Eine der meistfotografierten Treppen der Welt, mitten im Herzen von Lapa.", tip: "Frühmorgens hast du die Treppe fast für dich allein — perfekt für Fotos ohne Menschenmassen.", effort: "Leicht", gradient: "from-red-100 to-red-200" },
    { name: "Santa Teresa", time: "~1,5 Std.", desc: "Das Künstlerviertel auf dem Hügel: kopfsteingepflasterte Gassen, bunte Häuser, Ateliers und ein Panoramablick über die Stadt. Santa Teresa zeigt dir das kreative, authentische Rio abseits der Touristenpfade.", tip: "Wir kombinieren Santa Teresa ideal mit der Escadaria Selarón und den Arcos da Lapa — alles fußläufig erreichbar.", effort: "Moderat", gradient: "from-yellow-100 to-yellow-200" },
    { name: "Mirante Dona Marta", time: "~1 Std.", desc: "Der vielleicht beste Aussichtspunkt Rios — und kaum ein Tourist kennt ihn. Von hier siehst du den Christus, den Zuckerhut, die Lagoa und die Strände in einem einzigen, spektakulären Panorama.", tip: "Dies ist mein persönlicher Lieblingsort in Rio. Der Blick von hier ist besser als vom Corcovado — und es gibt keine Warteschlangen.", effort: "Leicht", gradient: "from-green-100 to-green-200" },
    { name: "Pedra do Arpoador", time: "~1 Std.", desc: "Der Felsen zwischen Copacabana und Ipanema ist der Ort, an dem die Cariocas den Sonnenuntergang feiern — mit Applaus, wenn die Sonne im Meer versinkt. Ein magischer Moment und echtes Rio-Feeling.", tip: "Am Abend klatschen die Einheimischen, wenn die Sonne untergeht. Diesen Moment erlebst du nirgendwo sonst auf der Welt.", effort: "Leicht", gradient: "from-teal-100 to-teal-200" },
    { name: "Tijuca-Regenwald", time: "~3 Std.", desc: "Der größte urbane Regenwald der Welt — mitten in Rio. Wanderwege, Wasserfälle und eine unglaubliche Artenvielfalt erwarten dich, nur wenige Minuten vom Stadtzentrum entfernt.", tip: "Ich kenne Wege und Wasserfälle, die in keinem Reiseführer stehen. Für Naturliebhaber ist die Tijuca ein absolutes Muss.", effort: "Moderat", gradient: "from-emerald-100 to-emerald-200" },
    { name: "Botanischer Garten (Jardim Botânico)", time: "~1,5 Std.", desc: "140 Hektar tropische Pracht: die berühmte Palmenallee, riesige Seerosen, Orchideen und über 6.500 Pflanzenarten. Ein Ort der Ruhe und Schönheit mitten in der pulsierenden Stadt.", tip: "Die Palmenallee am Eingang ist eines der schönsten Fotomotive Rios. Perfekt zum Kombinieren mit Parque Lage nebenan.", effort: "Leicht", gradient: "from-lime-100 to-lime-200" },
    { name: "Parque Lage", time: "~1 Std.", desc: "Ein historisches Herrenhaus am Fuße des Corcovado, umgeben von üppigem Regenwald. Das Café im Innenhof mit Blick auf den Christus ist einer der instagrammbarsten Orte Rios.", tip: "Das Frühstück im Café des Palastes mit Blick auf den Christus ist der perfekte Start in deinen Rio-Tag.", effort: "Leicht", gradient: "from-stone-100 to-stone-200" },
    { name: "Lagoa Rodrigo de Freitas", time: "~1 Std.", desc: "Die Lagune im Herzen der Südzone, umgeben von Bergen und den Stadtvierteln Ipanema, Leblon und Jardim Botânico. Ideal zum Spazieren, Radfahren oder einfach die Aussicht genießen.", tip: "Am späten Nachmittag spiegeln sich die Berge im Wasser — ein großartiger Zwischenstopp auf dem Weg zum Sonnenuntergang am Arpoador.", effort: "Leicht", gradient: "from-cyan-100 to-cyan-200" },
    { name: "Urca", time: "~1,5 Std.", desc: "Das ruhigste Viertel Rios, direkt am Fuß des Zuckerhuts. Kleine Gassen, historische Häuser und die Mureta da Urca — eine Mauer am Meer, wo Einheimische bei Sonnenuntergang ein kühles Bier genießen.", tip: "Die Mureta da Urca bei Sonnenuntergang ist das authentischste Rio-Erlebnis: Bier, Meerblick, Einheimische — kein Tourist weit und breit.", effort: "Leicht", gradient: "from-sky-100 to-sky-200" },
    { name: "Arcos da Lapa", time: "~30 Min.", desc: "Das imposante Aquädukt aus dem 18. Jahrhundert ist das Tor zum Stadtviertel Lapa — Rios Zentrum für Nachtleben, Samba und Straßenkunst. Tagsüber ein fotogenes Wahrzeichen, nachts voller Energie.", tip: "Perfekt als Ausgangspunkt: Von hier geht es zu Fuß zur Escadaria Selarón oder mit der historischen Straßenbahn hoch nach Santa Teresa.", effort: "Leicht", gradient: "from-indigo-100 to-indigo-200" }
];

const programs = [
    { icon: Eye, title: "Aussicht & Natur", includes: ["Parque Lage", "Christus-Erlöser", "Mirante Dona Marta", "Arpoador"] },
    { icon: Palette, title: "Kunst & Kultur", includes: ["Escadaria Selarón", "Santa Teresa", "Arcos da Lapa", "Botanischer Garten"] },
    { icon: Camera, title: "Die Postkarten-Tour", includes: ["Christus-Erlöser", "Zuckerhut", "Copacabana", "Lagoa"] },
    { icon: Mountain, title: "Berg & Meer", includes: ["Tijuca-Regenwald", "Mirante Dona Marta", "Urca", "Zuckerhut"] },
    { icon: Leaf, title: "Natur pur", includes: ["Tijuca-Regenwald", "Botanischer Garten", "Parque Lage", "Lagoa"] },
    { icon: Gem, title: "Geheimtipps", includes: ["Urca", "Mirante Dona Marta", "Parque Lage", "Arpoador"] }
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
                            src="/images/rio-klassiker.webp"
                            alt="Klassiker Tour Rio de Janeiro"
                            fill
                            priority
                            quality={80}
                            className="object-cover object-center opacity-40 mix-blend-luminosity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
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
                                    <span>Privattouren auf Deutsch · 8 Stunden · 3–4 Highlights pro Tag</span>
                                </div>

                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Rio de Janeiro entdecken: <br />
                                    <span className="text-rio-yellow text-3xl lg:text-4xl xl:text-5xl font-bold">Die schönsten Sehenswürdigkeiten mit einem echten Carioca</span>
                                </h1>

                                <div className="pt-6">
                                    <a
                                        href="https://wa.me/5521999999999"
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
                    <div className="max-w-4xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <article className="prose prose-lg prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
                                <p className="text-xl lg:text-2xl font-light text-gray-900 leading-snug">
                                    Rio de Janeiro ist eine der visuell beeindruckendsten Städte der Welt — eine Stadt, die man nicht einfach &bdquo;besucht&ldquo;, sondern die man erlebt.
                                </p>
                                <p>
                                    Der Corcovado mit dem Christus-Erlöser, der Zuckerhut, der Strand von Ipanema: Das sind die Postkarten-Bilder, die jeder kennt. Aber Rio hat noch viel mehr zu bieten.
                                </p>
                                <p>
                                    Als geborener Carioca zeige ich dir nicht nur die klassischen Highlights, sondern auch die Orte, die du in keinem Reiseführer findest: den Aussichtspunkt Mirante Dona Marta mit dem besten Blick auf die Stadt, die farbenfrohe Escadaria Selarón im Herzen von Lapa, das romantische Künstlerviertel Santa Teresa — und noch einige mehr.
                                </p>
                                <p className="font-medium text-gray-900 pt-4 border-t border-gray-100">
                                    Unten findest du eine Auswahl der schönsten Sehenswürdigkeiten Rios — von weltbekannten Ikonen bis zu versteckten Geheimtipps, die nur Einheimische kennen.
                                </p>
                            </article>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Grade de Atrações */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {attractions.map((attr, index) => (
                                <FadeIn key={index} delay={index * 0.1} direction="up" className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col h-full">
                                    <div className={`h-48 w-full bg-gradient-to-br ${attr.gradient} relative overflow-hidden flex items-center justify-center p-6 text-center`}>
                                        {/* Imagem placeholder - Gradiente */}
                                        <span className="text-gray-900/10 font-black text-4xl group-hover:scale-110 transition-transform duration-500">{index + 1}</span>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {programs.map((program, index) => (
                                <FadeIn key={index} delay={index * 0.15} direction="up" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-rio-yellow group-hover:bg-rio-green transition-colors duration-300"></div>

                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <program.icon className="w-8 h-8 text-rio-yellow flex-shrink-0" />
                                            <h3 className="text-2xl font-bold font-heading text-gray-900">{program.title}</h3>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100/80 rounded-full text-xs font-bold text-gray-600 whitespace-nowrap">
                                            <Clock className="w-3.5 h-3.5" />
                                            ~8 Stunden
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {program.includes.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                                                <CheckCircle2 className="w-5 h-5 text-rio-green flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex gap-3 pt-5 border-t border-gray-100">
                                        <a
                                            href={`https://wa.me/573148704374?text=${encodeURIComponent(`Hallo! Ich interessiere mich für die Tour „${program.title}". Könnten Sie mir mehr Informationen zu Verfügbarkeit und Preisen geben?`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rio-green text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`mailto:kontakt@riofuerdeutsche.example?subject=${encodeURIComponent(`Buchungsanfrage: ${program.title}`)}&body=${encodeURIComponent(`Hallo,\n\nIch interessiere mich für die folgende Tour:\n„${program.title}"\n\nKönnten Sie mir bitte mehr Informationen zu Verfügbarkeit und Preisen geben?\n\nMit freundlichen Grüßen`)}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                            E-Mail
                                        </a>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO F — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Dein Wunschtag in Rio — <br className="hidden sm:block" />
                                <span className="text-rio-yellow">ich plane ihn für dich.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                                Schreib mir auf WhatsApp und wir stellen gemeinsam dein perfektes Programm zusammen.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href="https://wa.me/5521999999999"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp an uns
                                </a>
                                <Link
                                    href="/#kontakt"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Zum Kontaktformular
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
