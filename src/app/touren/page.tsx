import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import { ChevronRight, Phone, CalendarDays } from "lucide-react";
import { getSettings, buildContactUrls } from "@/lib/settings";

export const metadata = {
    title: "Touren & Stadtrundfahrten in Rio de Janeiro auf Deutsch | RioFürDeutsche",
    description: "Deutschsprachige Touren & Stadtführungen in Rio de Janeiro ✓ Klassiker, Favela, Karneval, Natur & Ausflüge. Mit einem echten Carioca. Jetzt anfragen.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/touren",
    },
    openGraph: {
        url: "https://riofuerdeutsche.de/touren",
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Sind die Touren auf Deutsch?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ja, alle unsere Stadtführungen und Touren in Rio de Janeiro werden komplett auf Deutsch durchgeführt. Dein Reiseleiter ist ein gebürtiger Carioca, der fließend Deutsch spricht und vier Jahre in Köln gelebt hat. Du bekommst nicht nur Übersetzungen, sondern echte Erklärungen mit kulturellem Hintergrund — in deiner Muttersprache."
            }
        },
        {
            "@type": "Question",
            "name": "Wie sicher sind die Touren?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sicherheit hat bei uns oberste Priorität. Als Einheimischer kenne ich die sicheren Gebiete, die besten Routen und die Uhrzeiten, zu denen man bestimmte Viertel besuchen sollte. Alle Touren sind so geplant, dass du dich jederzeit wohlfühlst. Ich kümmere mich um Transport, Orientierung und alles, was du brauchst — du genießt einfach den Tag."
            }
        },
        {
            "@type": "Question",
            "name": "Kann ich eine individuelle Tour zusammenstellen?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Natürlich! Neben unseren fertigen Touren bieten wir auch komplett individuelle Stadtführungen an. Sag mir einfach, was dich interessiert, wie viel Zeit du hast und mit wem du reist — und ich stelle ein maßgeschneidertes Programm für dich zusammen. Ob eine Mischung aus Kultur und Natur, ein Tag nur am Strand oder eine Kombination aus Sightseeing und Fußball — alles ist möglich."
            }
        },
        {
            "@type": "Question",
            "name": "Was kostet eine Tour in Rio de Janeiro?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Die Preise variieren je nach Dauer und Art der Tour. Eine Halbtags-Stadtführung (4-5 Stunden) beginnt ab 150€, ein ganzer Tag ab 250€. Tagesausflüge zu Zielen wie Búzios oder Ilha Grande kosten ab 300€ inklusive Transport. Schreib mir einfach und ich mache dir ein unverbindliches Angebot — passend zu deinem Budget und deinen Wünschen."
            }
        },
        {
            "@type": "Question",
            "name": "Wie buche ich eine Tour?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ganz einfach: Schreib mir per WhatsApp oder E-Mail mit deinen Wunschdaten und Interessen. Innerhalb von 24 Stunden bekommst du einen Vorschlag mit Ablauf und Preis — kostenlos und unverbindlich. Wenn alles passt, bestätigst du und wir legen los. Keine komplizierten Buchungssysteme, keine versteckten Kosten."
            }
        },
        {
            "@type": "Question",
            "name": "Für wen sind die Touren geeignet?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Unsere Touren sind für alle geeignet — Alleinreisende, Paare, Familien mit Kindern, Senioren und kleine Gruppen. Jede Tour wird individuell angepasst: Tempo, Schwierigkeitsgrad und Interessen bestimmst du. Wir haben auch barrierefreie Optionen und Touren speziell für Familien mit kleinen Kindern."
            }
        }
    ]
};

const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Geführte Touren in Rio de Janeiro",
    "description": "Deutschsprachige Stadtführungen und Touren in Rio de Janeiro mit lokalem Guide",
    "numberOfItems": 11,
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "url": "https://riofuerdeutsche.de/touren/klassiker", "name": "Klassiker Tour in Rio de Janeiro" },
        { "@type": "ListItem", "position": 2, "url": "https://riofuerdeutsche.de/touren/natur-und-straende", "name": "Natur & Strände in Rio de Janeiro" },
        { "@type": "ListItem", "position": 3, "url": "https://riofuerdeutsche.de/touren/favela-tour", "name": "Favela Tour in Rio de Janeiro" },
        { "@type": "ListItem", "position": 4, "url": "https://riofuerdeutsche.de/touren/kultur-und-geschichte", "name": "Kultur & Geschichte in Rio de Janeiro" },
        { "@type": "ListItem", "position": 5, "url": "https://riofuerdeutsche.de/touren/by-night", "name": "Rio by Night — Nachtleben in Rio de Janeiro" },
        { "@type": "ListItem", "position": 6, "url": "https://riofuerdeutsche.de/touren/karneval-tour", "name": "Karneval Tour in Rio de Janeiro" },
        { "@type": "ListItem", "position": 7, "url": "https://riofuerdeutsche.de/touren/fussball", "name": "Fußball Tour in Rio de Janeiro" },
        { "@type": "ListItem", "position": 8, "url": "https://riofuerdeutsche.de/touren/tagesausfluege", "name": "Tagesausflüge ab Rio de Janeiro" },
        { "@type": "ListItem", "position": 9, "url": "https://riofuerdeutsche.de/touren/sport-und-abenteuer", "name": "Sport & Abenteuer in Rio de Janeiro" },
        { "@type": "ListItem", "position": 10, "url": "https://riofuerdeutsche.de/touren/regentage", "name": "Regentage in Rio de Janeiro" },
        { "@type": "ListItem", "position": 11, "url": "https://riofuerdeutsche.de/touren/individuell", "name": "Individuelle Tour in Rio de Janeiro" }
    ]
};

export default async function TourenPage() {
  const settings = await getSettings()
  const { whatsappHref } = buildContactUrls(settings)

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

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
                                    <span>Stadtführungen auf Deutsch · Alle Touren im Überblick</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.8vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight whitespace-normal lg:whitespace-nowrap">
                                    Stadtführungen & Touren in <span className="whitespace-nowrap">Rio de Janeiro</span>
                                </h1>
                                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-rio-yellow mt-4">
                                    Dein deutschsprachiger Reiseleiter in Rio
                                </p>

                                <div className="pt-6">
                                    <a
                                        href={whatsappHref}
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
                                    Rio de Janeiro gehört zu den faszinierendsten Städten der Welt — aber ohne einen <Link href="/ueber-will" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">lokalen Guide</Link> verpasst du das Beste. Unsere deutschsprachigen Stadtführungen und Touren zeigen dir das echte Rio: <Link href="/ist-rio-gefaehrlich" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">sicher</Link>, authentisch und abseits der Touristenpfade.
                                </p>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        Ob du die <Link href="/touren/klassiker" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">klassischen Sehenswürdigkeiten wie den Corcovado und den Zuckerhut</Link> erleben, die <Link href="/touren/natur-und-straende" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">wilde Natur des Tijuca-Regenwaldes</Link> entdecken oder das pulsierende <Link href="/touren/by-night" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Nachtleben von Lapa und Leblon</Link> genießen möchtest — wir haben die passende Tour für dich. Alle Touren werden von einem gebürtigen Carioca geleitet, der fließend Deutsch spricht und vier Jahre in Deutschland gelebt hat.
                                    </p>
                                    <p>
                                        Was uns von anderen Anbietern unterscheidet: Jede Stadtführung ist privat und individuell. Kein Bus voller Touristen, keine starren Zeitpläne, keine Sprachbarrieren. Stattdessen ein persönlicher <Link href="/kontakt" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Reiseleiter</Link>, der sich ganz auf dich und deine Wünsche einstellt — ob du allein reist, als Paar, mit Familie oder in einer kleinen Gruppe.
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 pt-8 border-t border-gray-200">
                                    Entdecke unten unsere beliebtesten Touren in Rio de Janeiro oder schreib mir direkt per WhatsApp oder E-Mail — zusammen finden wir das perfekte Erlebnis für deine Reise.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO C — Trust / Warum Guide */}
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

                {/* SEÇÃO D — Texto SEO Adicional */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto space-y-6 text-left text-lg text-gray-600 leading-relaxed">
                                <p>
                                    Rio de Janeiro ist eine Stadt, die man auf viele Arten erleben kann — aber mit einem deutschsprachigen Guide wird sie erst richtig lebendig. Statt nur die bekannten Postkartenmotive abzuhaken, tauchst du ein in die Geschichten hinter den Orten: Warum der <Link href="/touren/klassiker" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Zuckerhut</Link> seinen Namen hat, welche Geheimnisse der <Link href="/touren/natur-und-straende" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Tijuca-Regenwald</Link> verbirgt und wo die Cariocas wirklich feiern, essen und leben.
                                </p>
                                <p>
                                    Unsere Reiseleitung in Rio de Janeiro umfasst nicht nur <Link href="/touren/klassiker" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">klassische Stadtführungen</Link>, sondern auch <Link href="/touren/natur-und-straende" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Naturerlebnisse</Link>, <Link href="/touren/kultur-und-geschichte" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">kulturelle Entdeckungstouren</Link>, <Link href="/touren/favela-tour" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Favela-Besuche</Link>, <Link href="/touren/sport-und-abenteuer" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Sport und Abenteuer</Link> sowie das legendäre <Link href="/touren/by-night" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">Nachtleben</Link> der Stadt. Jede Tour kann <Link href="/touren/individuell" className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors">individuell angepasst</Link> werden — von der Halbtags-Stadtführung bis zum mehrtägigen Programm.
                                </p>
                                <p>
                                    Ob du zum ersten Mal nach Rio kommst oder die Stadt schon kennst und neue Ecken entdecken willst — mit einem lokalen Guide, der Deutsch spricht und die Stadt wie seine Westentasche kennt, wird deine Reise sicher, entspannt und unvergesslich.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO E — Alle Touren & Ausflüge */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Alle Touren & Ausflüge in Rio de Janeiro — <br className="hidden sm:block" />
                                <span className="text-rio-green">dein Überblick</span>
                            </h2>
                        </FadeIn>

                        {/* Touren Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    slug: "klassiker",
                                    emoji: "🏔️",
                                    title: "Klassiker Tour in Rio de Janeiro",
                                    image: "/images/home-pao-de-acucar.webp",
                                    desc: "Die schönsten Sehenswürdigkeiten Rios an einem Tag — von Corcovado über den Zuckerhut bis zum Sonnenuntergang am Arpoador. 12 Highlights, 6 fertige Tagesprogramme.",
                                    badges: ['~8 Stunden', '12 Highlights']
                                },
                                {
                                    slug: "natur-und-straende",
                                    emoji: "🌿",
                                    title: "Natur & Strände in Rio de Janeiro",
                                    image: "/images/natur-und-straende.webp",
                                    desc: "Regenwald-Wanderungen, Gipfeltouren und versteckte Strände — Rios wilde Seite abseits der Touristenpfade. Von leicht bis anspruchsvoll.",
                                    badges: ['3–8 Stunden', '9 Highlights']
                                },
                                {
                                    slug: "favela-tour",
                                    emoji: "🏘️",
                                    title: "Favela Tour in Rio de Janeiro",
                                    image: "/images/rio-favela.webp",
                                    desc: "Ein respektvoller Einblick in die Kultur und den Alltag der Favelas — authentisch und sicher mit lokalem Guide. Besuche Rocinha und The Maze.",
                                    badges: ['2–3 Stunden', '3 Highlights']
                                },
                                {
                                    slug: "kultur-und-geschichte",
                                    emoji: "🏛️",
                                    title: "Kultur & Geschichte Tour in Rio de Janeiro",
                                    image: "/images/kultur-und-geschichte-bg.webp",
                                    desc: "Museen, historische Gebäude und die faszinierende Geschichte Rios — vom kolonialen Zentrum bis zur modernen Praça Mauá.",
                                    badges: ["4–6 Stunden", "10 Highlights"]
                                },
                                {
                                    slug: "by-night",
                                    emoji: "🌙",
                                    title: "Rio by Night — Nachtleben in Rio de Janeiro",
                                    image: "/images/lapa-by-night.webp",
                                    desc: "Samba in Lapa, Cocktails in Leblon und das pulsierende Nachtleben Rios — erlebe die Stadt nach Sonnenuntergang.",
                                    badges: ["3–4 Stunden", "Nachtleben"]
                                },
                                {
                                    slug: "karneval-tour",
                                    emoji: "🎉",
                                    title: "Karneval Tour in Rio de Janeiro",
                                    image: "/images/bloco-de-rua.webp",
                                    desc: "Das größte Fest der Welt hautnah erleben — Sambódromo, Blocos de Rua und die beste Karnevalsstimmung mit einem echten Carioca.",
                                    badges: ["Saisonal", "Karneval"]
                                },
                                {
                                    slug: "fussball",
                                    emoji: "⚽",
                                    title: "Fußball Tour in Rio de Janeiro",
                                    image: "/images/maracana-rio-de-janeiro.webp",
                                    desc: "Maracanã, Fußball-Museen und echte Leidenschaft — erlebe Rio wie ein Fan und spüre die Begeisterung der Cariocas.",
                                    badges: ["3–4 Stunden", "Fußball"]
                                },
                                {
                                    slug: "tagesausfluege",
                                    emoji: "🗺️",
                                    title: "Tagesausflüge ab Rio de Janeiro",
                                    image: "/images/buzios.webp",
                                    desc: "Búzios, Ilha Grande, Paraty, Petrópolis und mehr — traumhafte Ausflüge rund um Rio, perfekt für einen Extra-Tag.",
                                    badges: ["Ganztägig", "Ab Rio"]
                                },
                                {
                                    slug: "regentage",
                                    emoji: "☔",
                                    title: "Regentage in Rio de Janeiro",
                                    image: "/images/mudeu-do-amanha.webp",
                                    desc: "Regen in Rio? Kein Problem! Museen, Gastronomie, Indoor-Aktivitäten und kulturelle Erlebnisse — damit kein Tag verloren geht.",
                                    badges: ["Flexibel", "Indoor-Erlebnisse"]
                                },
                                {
                                    slug: "sport-und-abenteuer",
                                    emoji: "🧗",
                                    title: "Sport & Abenteuer in Rio de Janeiro",
                                    image: "/images/paraglider-rio.webp",
                                    desc: "Surfen, Paragliding, Stand-up Paddle, Klettern und mehr — Rio de Janeiro ist ein Paradies für Abenteurer und Sportbegeisterte.",
                                    badges: ["3–8 Stunden", "Adrenalin & Natur"]
                                },
                                {
                                    slug: "individuell",
                                    emoji: "🎯",
                                    title: "Individuelle Tour in Rio de Janeiro",
                                    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
                                    desc: "Dein Wunschtag in Rio — du bestimmst die Orte und das Tempo, ich plane den perfekten Tag für dich.",
                                    badges: ["Flexibel", "Auf Anfrage"]
                                }
                            ].map((tour, i) => (
                                <FadeIn key={i} delay={0.1 * (i % 3)} direction="up">
                                    <div className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full">
                                        <div className="relative h-64 lg:h-72 overflow-hidden">
                                            <Image
                                                src={tour.image}
                                                alt={tour.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                                                {tour.badges.map((badge) => (
                                                    <div key={badge} className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rio-green border border-gray-100 uppercase tracking-wider">
                                                        {badge}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 group-hover:text-rio-green transition-colors">
                                                {tour.emoji} {tour.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">
                                                {tour.desc}
                                            </p>
                                            <Link
                                                href={`/touren/${tour.slug === "individuell" ? "individuell" : tour.slug}`}
                                                className="inline-flex items-center gap-2 text-rio-green font-bold group-hover:translate-x-1 transition-transform"
                                            >
                                                Mehr erfahren <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
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
                                        { name: "AquaRio", slug: "kultur-und-geschichte" },
                                        { name: "Arcos da Lapa", slug: "klassiker" },
                                        { name: "Arraial do Cabo", slug: "tagesausfluege" },
                                        { name: "Blocos de Rua", slug: "karneval-tour" },
                                        { name: "Botanischer Garten", slug: "klassiker" },
                                        { name: "Botafogo", slug: "by-night" },
                                        { name: "Búzios", slug: "tagesausfluege" },
                                        { name: "Casa Firjan", slug: "kultur-und-geschichte" },
                                        { name: "Catedral Metropolitana", slug: "kultur-und-geschichte" },
                                        { name: "CCBB (Centro Cultural Banco do Brasil)", slug: "kultur-und-geschichte" },
                                        { name: "Confeitaria Colombo", slug: "kultur-und-geschichte" },
                                        { name: "Cristo Redentor (Corcovado)", slug: "klassiker" },
                                        { name: "Escadaria Selarón", slug: "klassiker" },
                                        { name: "Estádio Nilton Santos", slug: "fussball" },
                                        { name: "Ilha Grande", slug: "tagesausfluege" },
                                        { name: "Lagoa Rodrigo de Freitas", slug: "klassiker" },
                                        { name: "Lapa", slug: "by-night" },
                                        { name: "Leblon", slug: "by-night" },
                                        { name: "MAC (Niterói)", slug: "kultur-und-geschichte" },
                                        { name: "MAM (Museu de Arte Moderna)", slug: "kultur-und-geschichte" },
                                        { name: "Maracanã (Stadion & Museum)", slug: "fussball" },
                                        { name: "Mirante Dona Marta", slug: "klassiker" },
                                        { name: "Morro Dois Irmãos", slug: "natur-und-straende" },
                                        { name: "Museu da Chácara do Céu", slug: "kultur-und-geschichte" },
                                        { name: "Museu de Arte do Rio (MAR)", slug: "kultur-und-geschichte" },
                                        { name: "Museu do Amanhã", slug: "kultur-und-geschichte" },
                                        { name: "Museu do Flamengo", slug: "fussball" },
                                        { name: "Museu Nacional de Belas Artes", slug: "kultur-und-geschichte" },
                                        { name: "Paraty", slug: "tagesausfluege" },
                                        { name: "Parque Glória Maria", slug: "kultur-und-geschichte" },
                                        { name: "Parque Lage", slug: "klassiker" },
                                        { name: "Pedra Bonita", slug: "natur-und-straende" },
                                        { name: "Pedra da Gávea", slug: "natur-und-straende" },
                                        { name: "Pedra do Arpoador", slug: "klassiker" },
                                        { name: "Petrópolis", slug: "tagesausfluege" },
                                        { name: "Pico da Tijuca", slug: "natur-und-straende" },
                                        { name: "Praia de Grumari", slug: "natur-und-straende" },
                                        { name: "Praia Vermelha", slug: "natur-und-straende" },
                                        { name: "Prainha", slug: "natur-und-straende" },
                                        { name: "Real Gabinete Português de Leitura", slug: "kultur-und-geschichte" },
                                        { name: "Rocinha", slug: "favela-tour" },
                                        { name: "Sambódromo", slug: "karneval-tour" },
                                        { name: "Santa Marta", slug: "favela-tour" },
                                        { name: "Santa Teresa", slug: "by-night" },
                                        { name: "São Januário (Vasco)", slug: "fussball" },
                                        { name: "Teatro Municipal", slug: "kultur-und-geschichte" },
                                        { name: "The Maze (Tavares Bastos)", slug: "favela-tour" },
                                        { name: "Tijuca-Regenwald", slug: "natur-und-straende" },
                                        { name: "Urca", slug: "klassiker" },
                                        { name: "Vidigal", slug: "favela-tour" },
                                        { name: "Yup Star", slug: "klassiker" },
                                        { name: "Zuckerhut (Pão de Açúcar)", slug: "klassiker" }
                                    ].map((item) => (
                                        <div key={item.name} className="break-inside-avoid mb-4">
                                            <Link
                                                href={`/touren/${item.slug}`}
                                                title={item.name}
                                                className="text-rio-green font-bold hover:underline decoration-2 underline-offset-4 transition-all text-sm lg:text-base leading-relaxed"
                                            >
                                                {item.name}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO G — FAQ */}
                <section className="py-20 lg:py-28 bg-[#f9fafb] border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-[800px] mx-auto">
                                <h2 className="text-3xl lg:text-4xl font-heading font-black text-gray-900 mb-12">
                                    Häufige Fragen zu Touren in Rio de Janeiro
                                </h2>

                                <div className="space-y-4">
                                    {[
                                        {
                                            question: "Sind die Touren auf Deutsch?",
                                            answer: "Ja, alle unsere Stadtführungen und Touren in Rio de Janeiro werden komplett auf Deutsch durchgeführt. Dein Reiseleiter ist ein gebürtiger Carioca, der fließend Deutsch spricht und vier Jahre in Köln gelebt hat. Du bekommst nicht nur Übersetzungen, sondern echte Erklärungen mit kulturellem Hintergrund — in deiner Muttersprache."
                                        },
                                        {
                                            question: "Wie sicher sind die Touren?",
                                            answer: "Sicherheit hat bei uns oberste Priorität. Als Einheimischer kenne ich die sicheren Gebiete, die besten Routen und die Uhrzeiten, zu denen man bestimmte Viertel besuchen sollte. Alle Touren sind so geplant, dass du dich jederzeit wohlfühlst. Ich kümmere mich um Transport, Orientierung und alles, was du brauchst — du genießt einfach den Tag."
                                        },
                                        {
                                            question: "Kann ich eine individuelle Tour zusammenstellen?",
                                            answer: "Natürlich! Neben unseren fertigen Touren bieten wir auch komplett individuelle Stadtführungen an. Sag mir einfach, was dich interessiert, wie viel Zeit du hast und mit wem du reist — und ich stelle ein maßgeschneidertes Programm für dich zusammen. Ob eine Mischung aus Kultur und Natur, ein Tag nur am Strand oder eine Kombination aus Sightseeing und Fußball — alles ist möglich."
                                        },
                                        {
                                            question: "Was kostet eine Tour in Rio de Janeiro?",
                                            answer: "Die Preise variieren je nach Dauer und Art der Tour. Eine Halbtags-Stadtführung (4-5 Stunden) beginnt ab 150€, ein ganzer Tag ab 250€. Tagesausflüge zu Zielen wie Búzios oder Ilha Grande kosten ab 300€ inklusive Transport. Schreib mir einfach und ich mache dir ein unverbindliches Angebot — passend zu deinem Budget und deinen Wünschen."
                                        },
                                        {
                                            question: "Wie buche ich eine Tour?",
                                            answer: "Ganz einfach: Schreib mir per WhatsApp oder E-Mail mit deinen Wunschdaten und Interessen. Innerhalb von 24 Stunden bekommst du einen Vorschlag mit Ablauf und Preis — kostenlos und unverbindlich. Wenn alles passt, bestätigst du und wir legen los. Keine komplizierten Buchungssysteme, keine versteckten Kosten."
                                        },
                                        {
                                            question: "Für wen sind die Touren geeignet?",
                                            answer: "Unsere Touren sind für alle geeignet — Alleinreisende, Paare, Familien mit Kindern, Senioren und kleine Gruppen. Jede Tour wird individuell angepasst: Tempo, Schwierigkeitsgrad und Interessen bestimmst du. Wir haben auch barrierefreie Optionen und Touren speziell für Familien mit kleinen Kindern."
                                        }
                                    ].map((faq, i) => (
                                        <details key={i} className="group border border-gray-200 rounded-2xl overflow-hidden">
                                            <summary className="flex items-center justify-between cursor-pointer px-6 py-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <h3 className="text-lg font-bold text-gray-900 pr-4">{faq.question}</h3>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                                            </summary>
                                            <div className="px-6 py-5 text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO H — CTA Final */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Dein Wunschtag in Rio — <br className="hidden sm:block" />
                                <span className="text-rio-yellow">ich plane ihn für dich.</span>
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto">
                                Schreib mir per WhatsApp oder E-Mail und wir stellen gemeinsam dein perfektes Programm zusammen. Auch für <Link href="/kontakt" className="underline decoration-rio-yellow/60 underline-offset-2 hover:text-rio-yellow transition-colors">persönliche Reiseleitung</Link> stehe ich gerne zur Verfügung.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href={whatsappHref}
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

            </main>

            <FooterServer />
        </div>
        </>
    );
}
