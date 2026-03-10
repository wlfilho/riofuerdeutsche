import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, Phone, CalendarDays } from "lucide-react";

export const metadata = {
    title: "Geführte Touren in Rio de Janeiro — sicher & auf Deutsch | RioFürDeutsche",
    description: "Entdecke Rio de Janeiro mit einem echten Carioca als Guide. Stadttouren, Natur, Fußball, Karneval und Tagesausflüge — sicher, authentisch und komplett auf Deutsch."
};

export default function TourenPage() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <Navbar />

            <main className="flex-grow">
                {/* SEÇÃO A — Hero */}
                <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    {/* Overlay & Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920&h=800&fit=crop&q=80"
                            alt="Geführte Touren in Rio de Janeiro"
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
                                <span className="text-rio-yellow">Touren & Ausflüge</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <CalendarDays className="w-4 h-4 text-rio-yellow" />
                                    <span>Privattouren auf Deutsch · Alle Touren im Überblick</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.8vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Geführte Touren und Ausflüge in <span className="whitespace-nowrap">Rio de Janeiro</span>
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Sicher, authentisch und komplett auf Deutsch
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

                {/* SEÇÃO B — Texto Intro SEO */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-4xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto text-center space-y-6 text-gray-600 leading-relaxed text-lg">
                                <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug mb-8">
                                    Rio de Janeiro gehört zu den aufregendsten Städten der Welt — aber gerade als deutschsprachiger Tourist stellt man sich viele Fragen: Welche Sehenswürdigkeiten lohnen sich wirklich? Wo ist es sicher? Und wie erlebt man die Stadt abseits der typischen Touristenpfade? Genau hier komme ich ins Spiel.
                                </p>
                                <p>
                                    Als gebürtiger Carioca, der in Deutschland gelebt hat und fließend Deutsch spricht, biete ich geführte Touren in Rio de Janeiro an, die Sicherheit, Insider-Wissen und authentische Erlebnisse verbinden. Ob die klassischen Highlights wie Corcovado und Zuckerhut, versteckte Strände im Tijuca-Regenwald, ein Fußball-Erlebnis im Maracanã oder Tagesausflüge nach Búzios und Ilha Grande — ich zeige dir meine Stadt so, wie du sie allein nie erleben würdest.
                                </p>
                                <p className="font-medium text-gray-900 pt-4">
                                    Alle Touren sind flexibel, individuell anpassbar und komplett auf Deutsch. Schau dir die verschiedenen Optionen an und schreib mir einfach — zusammen planen wir deinen perfekten Tag in Rio.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Alle Touren & Ausflüge */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Alle Touren & Ausflüge in Rio de Janeiro — <br className="hidden sm:block" />
                                <span className="text-rio-green">dein Überblick</span>
                            </h2>
                        </FadeIn>

                        {/* Cards Disponíveis (Páginas prontas) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {/* Card 1 — Klassiker Tour */}
                            <FadeIn direction="up" delay={0.1}>
                                <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full">
                                    <div className="relative h-64 lg:h-80 overflow-hidden">
                                        <Image
                                            src="/images/home-pao-de-acucar.webp"
                                            alt="Klassiker Tour in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                                            {['~8 Stunden', '12 Highlights'].map((badge) => (
                                                <div key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                    {badge}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-bold font-heading text-gray-900 mb-3">
                                            🏔️ Klassiker Tour in Rio de Janeiro
                                        </h3>
                                        <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                                            Die schönsten Sehenswürdigkeiten Rios an einem Tag — von Corcovado über den Zuckerhut bis zum Sonnenuntergang am Arpoador. 12 Highlights, 6 fertige Tagesprogramme.
                                        </p>
                                        <Link
                                            href="/touren/klassiker"
                                            className="inline-flex items-center gap-2 text-rio-green font-bold group-hover:translate-x-1 transition-transform"
                                        >
                                            Mehr erfahren <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Card 2 — Natur & Strände */}
                            <FadeIn direction="up" delay={0.2}>
                                <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full">
                                    <div className="relative h-64 lg:h-80 overflow-hidden">
                                        <Image
                                            src="/images/natur-und-straende.webp"
                                            alt="Natur & Strände in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                                            {['3–8 Stunden', '9 Highlights'].map((badge) => (
                                                <div key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                    {badge}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-bold font-heading text-gray-900 mb-3">
                                            🌿 Natur & Strände in Rio de Janeiro
                                        </h3>
                                        <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                                            Regenwald-Wanderungen, Gipfeltouren und versteckte Strände — Rios wilde Seite abseits der Touristenpfade. Von leicht bis anspruchsvoll.
                                        </p>
                                        <Link
                                            href="/touren/natur-und-straende"
                                            className="inline-flex items-center gap-2 text-rio-green font-bold group-hover:translate-x-1 transition-transform"
                                        >
                                            Mehr erfahren <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>

                            {/* Card 3 — Favela Tour */}
                            <FadeIn direction="up" delay={0.3}>
                                <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full">
                                    <div className="relative h-64 lg:h-80 overflow-hidden">
                                        <Image
                                            src="/images/rio-favela.webp"
                                            alt="Favela Tour in Rio de Janeiro"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                                            {['2–3 Stunden', '2 Highlights'].map((badge) => (
                                                <div key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                    {badge}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-2xl font-bold font-heading text-gray-900 mb-3">
                                            🏘️ Favela Tour in Rio de Janeiro
                                        </h3>
                                        <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                                            Ein respektvoller Einblick in die Kultur und den Alltag der Favelas — authentisch und sicher mit lokalem Guide. Besuche Rocinha und The Maze.
                                        </p>
                                        <Link
                                            href="/touren/favela-tour"
                                            className="inline-flex items-center gap-2 text-rio-green font-bold group-hover:translate-x-1 transition-transform"
                                        >
                                            Mehr erfahren <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Cards "In Kürze" */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    emoji: "�️",
                                    title: "Kultur & Geschichte Tour in Rio de Janeiro",
                                    desc: "Museen, historische Gebäude und die faszinierende Geschichte Rios — vom kolonialen Zentrum bis zur modernen Praça Mauá.",
                                    msg: "Hallo! Ich interessiere mich für eine Kultur & Geschichte Tour in Rio. Kannst du mir mehr erzählen?",
                                    href: "/touren/kultur-und-geschichte",
                                    badges: ["4–6 Stunden", "10 Highlights"]
                                },
                                {
                                    emoji: "🌙",
                                    title: "Rio by Night — Nachtleben in Rio de Janeiro",
                                    desc: "Samba in Lapa, Cocktails in Leblon und das pulsierende Nachtleben Rios — erlebe die Stadt nach Sonnenuntergang.",
                                    msg: "Hallo! Ich interessiere mich für eine Rio by Night Tour. Kannst du mir mehr erzählen?",
                                    href: "/touren/by-night",
                                    badges: ["3–4 Stunden", "Nachtleben"]
                                },
                                {
                                    emoji: "🎉",
                                    title: "Karneval Tour in Rio de Janeiro",
                                    desc: "Das größte Fest der Welt hautnah erleben — Sambódromo, Blocos de Rua und die beste Karnevalsstimmung mit einem echten Carioca.",
                                    msg: "Hallo! Ich interessiere mich für eine Karneval Tour in Rio. Kannst du mir mehr erzählen?",
                                    href: "/touren/karneval-tour",
                                    badges: ["Saisonal", "Karneval"]
                                },
                                {
                                    emoji: "☔",
                                    title: "Regentage in Rio de Janeiro",
                                    desc: "Regen in Rio? Kein Problem! Museen, Gastronomie, Indoor-Aktivitäten und kulturelle Erlebnisse — damit kein Tag verloren geht.",
                                    msg: "Hallo! Es regnet in Rio und ich suche nach Indoor-Aktivitäten. Kannst du mir helfen?",
                                    badges: ["Flexibel", "Indoor-Erlebnisse"]
                                },
                                {
                                    emoji: "⚽",
                                    title: "Fußball Tour in Rio de Janeiro",
                                    desc: "Maracanã, Fußball-Museen und echte Leidenschaft — erlebe Rio wie ein Fan und spüre die Begeisterung der Cariocas.",
                                    msg: "Hallo! Ich interessiere mich für eine Fußball Tour in Rio. Kannst du mir mehr erzählen?",
                                    href: "/touren/fussball",
                                    badges: ["3–4 Stunden", "Fußball"]
                                },
                                {
                                    emoji: "🧗",
                                    title: "Sport & Abenteuer in Rio de Janeiro",
                                    desc: "Surfen, Paragliding, Stand-up Paddle, Klettern und mehr — Rio de Janeiro ist ein Paradies für Abenteurer und Sportbegeisterte.",
                                    msg: "Hallo! Ich interessiere mich für Sport- und Abenteuer-Aktivitäten in Rio. Kannst du mir mehr erzählen?",
                                    badges: ["3–8 Stunden", "Adrenalin & Natur"]
                                },
                                {
                                    emoji: "🗺️",
                                    title: "Tagesausflüge ab Rio de Janeiro",
                                    desc: "Búzios, Ilha Grande, Paraty, Petrópolis und mehr — traumhafte Ausflüge rund um Rio, perfekt für einen Extra-Tag.",
                                    msg: "Hallo! Ich interessiere mich für einen Tagesausflug ab Rio. Kannst du mir mehr erzählen?",
                                    href: "/touren/tagesausfluege",
                                    badges: ["Ganztägig", "Ab Rio"]
                                },
                                {
                                    emoji: "🎯",
                                    title: "Individuelle Tour in Rio de Janeiro",
                                    desc: "Dein Wunschtag in Rio — du bestimmst die Orte und das Tempo, ich plane den perfekten Tag für dich.",
                                    msg: "Hallo! Ich möchte eine individuelle Tour in Rio planen. Kannst du mir helfen?",
                                    badges: ["Flexibel", "Auf Anfrage"]
                                }
                            ].map((tour, i) => (
                                <FadeIn key={i} delay={0.1 * i} direction="up" className="flex flex-col h-full">
                                    {tour.href ? (
                                        <Link
                                            href={tour.href}
                                            className="group p-8 rounded-3xl bg-white border border-gray-200 hover:border-rio-yellow hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-3xl">{tour.emoji}</span>
                                                <div className="flex flex-wrap gap-1.5 justify-end max-w-[70%]">
                                                    {(tour as any).badges?.map((badge: string) => (
                                                        <span key={badge} className="bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-black text-rio-green border border-rio-green/10 uppercase tracking-tighter whitespace-nowrap">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 group-hover:text-rio-green transition-colors">
                                                {tour.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                                                {tour.desc}
                                            </p>
                                            <div className="flex items-center gap-2 text-rio-green font-bold text-sm">
                                                Mehr erfahren <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    ) : (
                                        <a
                                            href={`https://wa.me/573148704374?text=${encodeURIComponent(tour.msg || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-8 rounded-3xl bg-gray-100/50 border border-gray-200 hover:border-rio-yellow hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-3xl">{tour.emoji}</span>
                                                <div className="flex flex-wrap gap-1.5 justify-end max-w-[70%]">
                                                    <span className="bg-gray-200 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider whitespace-nowrap">
                                                        In Kürze
                                                    </span>
                                                    {(tour as any).badges?.map((badge: string) => (
                                                        <span key={badge} className="bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider whitespace-nowrap">
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 group-hover:text-rio-green transition-colors">
                                                {tour.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                                                {tour.desc}
                                            </p>
                                            <div className="flex items-center gap-2 text-rio-green font-bold text-sm">
                                                Details anfragen <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </a>
                                    )}
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO D — Trust / Warum Guide */}
                <section className="py-24 bg-rio-green relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white leading-tight">
                                Warum eine geführte Tour <br className="hidden sm:block" />
                                <span className="text-rio-yellow">in Rio de Janeiro?</span>
                            </h2>
                        </FadeIn>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    emoji: "🛡️",
                                    title: "Sicherheit an erster Stelle",
                                    text: "Rio ist eine wunderschöne Stadt — aber man muss wissen, wo man sicher unterwegs ist. Als Einheimischer kenne ich jede Ecke und sorge dafür, dass du dich nie unsicher fühlst."
                                },
                                {
                                    emoji: "🇩🇪",
                                    title: "Komplett auf Deutsch",
                                    text: "Ich habe in Deutschland gelebt und spreche fließend Deutsch. Keine Sprachbarrieren, keine Missverständnisse — du bekommst alle Insider-Tipps in deiner Muttersprache."
                                },
                                {
                                    emoji: "💡",
                                    title: "Echtes Insider-Wissen",
                                    text: "Vergiss die typischen Touristenfallen. Als gebürtiger Carioca zeige ich dir die Orte, die nur Einheimische kennen — von versteckten Aussichtspunkten bis zu den besten Restaurants."
                                },
                                {
                                    emoji: "🎯",
                                    title: "Flexibel & individuell",
                                    text: "Jede Tour wird an deine Wünsche angepasst. Ob Tempo, Interessen oder spontane Änderungen — dein Tag, deine Regeln. Ich plane, du genießt."
                                }
                            ].map((item, i) => (
                                <FadeIn key={i} delay={0.15 * i} direction="up" className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl group hover:bg-white/20 transition-all duration-300">
                                    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                                        {item.emoji}
                                    </div>
                                    <h3 className="text-xl font-bold font-heading text-rio-yellow mb-4">
                                        {item.title}
                                    </h3>
                                    <p className="text-rio-sand/90 leading-relaxed text-sm">
                                        {item.text}
                                    </p>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO E — Listagem Completa de Pontos Turísticos */}
                <section className="py-20 bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-12">
                                Alle Sehenswürdigkeiten & Erlebnisse in Rio de Janeiro
                            </h2>

                            <div className="max-w-6xl mx-auto px-5 lg:px-8">
                                <div className="columns-1 sm:columns-2 lg:columns-4 gap-x-8 gap-y-4 space-y-4 text-left">
                                    {[
                                        "Arcos da Lapa", "Arraial do Cabo", "Blocos de Rua", "Botanischer Garten",
                                        "Botafogo", "Búzios", "Catedral Metropolitana", "CCBB (Centro Cultural Banco do Brasil)",
                                        "Confeitaria Colombo", "Cristo Redentor (Corcovado)", "Escadaria Selarón",
                                        "Estádio Nilton Santos", "Ilha Grande", "Lagoa Rodrigo de Freitas",
                                        "Lapa", "Leblon", "MAC (Niterói)", "MAM (Museu de Arte Moderna)",
                                        "Maracanã (Stadion & Museum)", "Mirante Dona Marta", "Morro Dois Irmãos",
                                        "Museu de Arte do Rio (MAR)", "Museu do Amanhã", "Museu do Flamengo",
                                        "Museu Nacional de Belas Artes", "Paraty", "Parque Lage",
                                        "Pedra Bonita", "Pedra da Gávea", "Pedra do Arpoador", "Petrópolis",
                                        "Pico da Tijuca", "Praia de Grumari", "Praia Vermelha", "Prainha",
                                        "Real Gabinete Português de Leitura", "Rocinha",
                                        "Sambódromo", "Santa Teresa", "São Januário (Vasco)", "Teatro Municipal",
                                        "Tijuca-Regenwald", "Urca", "Vidigal", "Zuckerhut (Pão de Açúcar)"
                                    ].map((item) => (
                                        <div key={item} className="break-inside-avoid mb-4">
                                            <Link
                                                href="#kontakt"
                                                title={item}
                                                className="text-rio-green font-bold hover:underline decoration-2 underline-offset-4 transition-all text-sm lg:text-base leading-relaxed"
                                            >
                                                {item}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
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
                                    href="https://wa.me/573148704374"
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
