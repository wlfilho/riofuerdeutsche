import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import FooterServer from "@/components/FooterServer";
import FadeIn from "@/components/FadeIn";
import Faq from "@/components/Faq";
import {
    ChevronRight,
    CalendarDays,
    MapPin,
    Trophy,
    Flag,
    ArrowRight,
    ShieldCheck,
    Compass,
    Ticket,
    Users,
    Plane,
    BedDouble,
    GraduationCap,
    Camera,
} from "lucide-react";

// A "página comercial-mãe" da estratégia WM 2027 (Obsidian, seção 4): quem
// chega aqui já decidiu (ou está decidindo) viajar pro Rio na Copa. Keywords
// do Tier verde: "frauen wm 2027 rio", "wm 2027 rio reise", "deutscher guide
// rio wm 2027". Nada de conteúdo duplicado: cada assunto linka sua fonte de
// verdade (tours, segurança, Maracanã, spielplan).
export const metadata: Metadata = {
    title: "Frauen WM 2027 in Rio de Janeiro · Reise mit deutschem Guide",
    description:
        "Rio de Janeiro zur Fußball Frauen-WM 2027: Eröffnung, Viertelfinale, Halbfinale und Finale im Maracanã. Plane deine WM-Reise mit einem deutschsprachigen Guide vor Ort: Spieltage, freie Tage, Unterkunft und Sicherheit.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/frauen-wm-2027/rio-de-janeiro",
    },
    openGraph: {
        title: "Frauen WM 2027 in Rio de Janeiro · Reise mit deutschem Guide",
        description:
            "Eröffnung und Finale im Maracanã: plane deine WM-Reise nach Rio mit einem deutschsprachigen Guide vor Ort.",
        url: "https://riofuerdeutsche.de/frauen-wm-2027/rio-de-janeiro",
        type: "website",
        images: [{ url: "/images/wm-2027/bg-wm-2027.webp" }],
    },
};

const rioSpiele = [
    { icon: Flag, label: "Eröffnungsspiel", value: "24. Juni 2027, mit Gastgeber Brasilien" },
    { icon: Trophy, label: "Finale", value: "25. Juli 2027" },
    { icon: CalendarDays, label: "K.-o.-Runde", value: "Ein Viertelfinale und ein Halbfinale" },
    { icon: Users, label: "Stadion", value: "Maracanã, 73.139 Plätze" },
];

/**
 * Os 5 perfis de PAX da página comercial-mãe (doc de estratégia, seção 2).
 * Cada tile diz em uma frase o que oferecemos àquele perfil — a conversa
 * inteira acontece na /anfrage, não aqui.
 */
const profile = [
    {
        icon: Flag,
        titel: "Du reist der DFB-Elf hinterher",
        text: "Wo Deutschland spielt, wissen wir am 11. Dezember 2026. Wenn es Rio ist: perfekt. Wenn nicht, planen wir die Route dorthin, und das Finale ist sowieso hier.",
    },
    {
        icon: Trophy,
        titel: "Du willst die großen Spiele sehen",
        text: "Eröffnung, Viertelfinale, Halbfinale, Finale: kein Spielort hat mehr Turnier als Rio. Wer nur eine Stadt wählt, wählt diese.",
    },
    {
        icon: Compass,
        titel: "Du kombinierst WM und Traumreise",
        text: "Christusstatue, Zuckerhut, Strände und dazwischen Weltmeisterschaft. Wir bauen dir den Reiseplan, der beides verbindet.",
    },
    {
        icon: Users,
        titel: "Du begleitest jemanden zum Turnier",
        text: "Familie und Freunde von Spielerinnen oder Fans: Während im Stadion gespielt wird, zeigen wir dir das Rio abseits des Fußballs.",
    },
    {
        icon: Ticket,
        titel: "Du kommst ohne Ticket",
        text: "Auch ohne Stadionplatz ist Rio während der WM ein Fest: Public Viewing, Fanzonen und eine Stadt, die Fußball atmet.",
    },
    {
        icon: Camera,
        titel: "Du arbeitest bei der WM",
        text: "Journalisten, Content-Creator, Delegationen, Sponsoren: Wer zum Arbeiten kommt, braucht Tempo statt Sightseeing. Fahrer, Drehorte, Übersetzung und ein Carioca, der die Stadt kennt.",
    },
];

const bausteine = [
    {
        icon: Flag,
        titel: "Spieltage",
        text: "Sicher zum Maracanã und zurück, mit eigenem Fahrzeug, deutschsprachiger Begleitung und lokalem Wissen, wann und wo man am besten fährt.",
        linkHref: "/touren/fussball",
        linkLabel: "Zur Fußball Tour",
    },
    {
        icon: Compass,
        titel: "Spielfreie Tage",
        text: "Die Klassiker, Natur und Strände, Favela Tour oder ein Tagesausflug nach Búzios: Zwischen den Spielen zeigt dir ein Carioca seine Stadt.",
        linkHref: "/touren",
        linkLabel: "Alle Touren ansehen",
    },
    {
        icon: BedDouble,
        titel: "Unterkunft",
        text: "Welches Viertel passt zu dir, wie weit ist es zum Maracanã, was ist sicher? Wir beraten dich persönlich, bevor du buchst.",
        linkHref: "/anfrage?von=site&thema=unterkunft",
        linkLabel: "Unterkunftsberatung anfragen",
    },
    {
        icon: Plane,
        titel: "Ankommen",
        text: "Vom Flughafen direkt zur Unterkunft, ohne Taxi-Verhandlung auf Portugiesisch. Dein Transfer wartet, wenn du landest.",
        linkHref: "/touren/flughafen-transfer",
        linkLabel: "Zum Flughafen-Transfer",
    },
    {
        icon: ShieldCheck,
        titel: "Sicherheit",
        text: "Rio ist sicherer, als sein Ruf, wenn man weiß, wie die Stadt funktioniert. Wir bereiten dich vor der Reise vor und sind vor Ort erreichbar.",
        linkHref: "/rio-guide/sicherheit/ist-rio-gefaehrlich",
        linkLabel: "Zum Sicherheits-Guide",
    },
];

const faqItems = [
    {
        question: "Welche Spiele der Frauen WM 2027 finden in Rio statt?",
        answer:
            "Das Eröffnungsspiel mit Brasilien am 24. Juni, ein Viertelfinale, ein Halbfinale und das Finale am 25. Juli 2027, alle im Maracanã. Kein anderer Spielort bekommt mehr hochkarätige Spiele.",
    },
    {
        question: "Lohnt sich Rio als Basis für die WM-Reise?",
        answer:
            "Für die meisten deutschen Fans: ja. Rio hat die wichtigsten Spiele, die bekanntesten Sehenswürdigkeiten Brasiliens und das größte Angebot für spielfreie Tage. Spiele in anderen Städten erreichst du per Inlandsflug.",
    },
    {
        question: "Wo übernachte ich in Rio während der WM am besten?",
        answer:
            "Für die meisten Besucher: Copacabana, Ipanema oder Leblon, sichere Viertel mit Strand und guter Anbindung. Zum Maracanã fährt man von dort etwa 30 bis 45 Minuten. Wir beraten dich persönlich, bevor du buchst, denn zur WM werden gute Unterkünfte früh knapp.",
    },
    {
        question: "Ist Rio während der WM sicher?",
        answer:
            "Bei Großereignissen ist die Polizeipräsenz in Rio deutlich erhöht, wie schon bei der WM 2014 und Olympia 2016. Mit der richtigen Vorbereitung und einem Guide, der die Stadt kennt, ist deine WM-Reise gut planbar. Die Grundregeln erklären wir in unserem Sicherheits-Guide.",
    },
    {
        question: "Was mache ich in Rio an spielfreien Tagen?",
        answer:
            "Christusstatue, Zuckerhut, Strände, Favela Tour, Tijuca-Nationalpark oder Tagesausflüge nach Búzios und Ilha Grande. Zwischen zwei Spielen liegen meist mehrere Tage, genug für das Beste der Stadt.",
    },
    {
        question: "Begleitet ihr mich auch zum Spiel ins Maracanã?",
        answer:
            "Ja. Wir bringen dich sicher zum Stadion und zurück, mit eigenem Fahrzeug und deutschsprachiger Begleitung. Tickets verkauft ausschließlich die FIFA, bei der Planung rund ums Spiel helfen wir.",
    },
    {
        question: "Wann sollte ich meine WM-Reise nach Rio buchen?",
        answer:
            "Früh. Nach der Auslosung am 11. Dezember 2026 steigen Nachfrage und Preise für Flüge und Hotels spürbar. Wer vorher plant und danach schnell bucht, spart deutlich.",
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
        },
    })),
};

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen bg-rio-sand selection:bg-rio-green selection:text-white font-sans">
            <NavbarServer />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <main className="flex-grow">
                {/* SEÇÃO 1 : Hero */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/wm-2027/bg-wm-2027.webp"
                            alt="Frauen WM 2027 in Rio de Janeiro erleben"
                            fill
                            priority
                            fetchPriority="high"
                            quality={90}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <nav
                                className="flex items-center text-sm font-medium text-white/60 mb-8"
                                aria-label="Breadcrumb"
                            >
                                <Link href="/" className="hover:text-rio-yellow transition-colors">
                                    Startseite
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <Link
                                    href="/frauen-wm-2027"
                                    className="hover:text-rio-yellow transition-colors"
                                >
                                    Frauen WM 2027
                                </Link>
                                <ChevronRight className="w-4 h-4 mx-2 text-white/30" />
                                <span className="text-rio-yellow">Rio de Janeiro</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <Trophy className="w-4 h-4 text-rio-yellow" />
                                    <span>Eröffnung · Viertelfinale · Halbfinale · Finale</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Frauen WM 2027 in Rio de Janeiro: deine Reise, dein deutscher
                                    Guide
                                </h1>

                                <p className="text-lg lg:text-xl text-rio-sand/90 leading-relaxed">
                                    Rio ist die Hauptstadt der Frauen-WM 2027: Eröffnungsspiel und
                                    Finale steigen im Maracanã, dazu ein Viertelfinale und ein
                                    Halbfinale. Wir planen deine Reise von der Unterkunft über die
                                    Spieltage bis zu den freien Tagen, auf Deutsch, mit einem
                                    Carioca an deiner Seite.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        href="/anfrage?von=site&thema=frauen-wm-2027"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        WM-Reise anfragen
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href="#bausteine"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        So sieht deine WM-Reise aus
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 2 : Rio na Copa (4 jogos) */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Kein Spielort hat mehr WM als Rio
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Das{" "}
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/maracana"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Maracanã
                                    </Link>{" "}
                                    richtet die vier größten Momente des Turniers aus. Wer Rio als
                                    Basis wählt, ist beim Anfang und beim Ende der WM dabei, und
                                    mit etwas Losglück auch bei allem dazwischen. Alle Termine
                                    findest du im{" "}
                                    <Link
                                        href="/frauen-wm-2027/spielplan"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Spielplan der WM 2027
                                    </Link>
                                    .
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn direction="up">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {rioSpiele.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 hover:border-rio-yellow hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-rio-green/10 text-rio-green">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <dt className="text-xs font-bold uppercase tracking-wider text-rio-green">
                                                    {item.label}
                                                </dt>
                                                <dd className="mt-1 text-base font-semibold text-gray-900">
                                                    {item.value}
                                                </dd>
                                            </div>
                                        </div>
                                    );
                                })}
                            </dl>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 3 : Para quem é */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Für wen wir die WM-Reise planen
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Jede WM-Reise ist anders. Diese sechs kommen bei uns am häufigsten
                                an, und für jede haben wir einen Plan:
                            </p>
                        </FadeIn>

                        <div className="max-w-[900px] mx-auto grid sm:grid-cols-2 gap-6">
                            {profile.map((p, index) => {
                                const Icon = p.icon;
                                return (
                                    <FadeIn key={p.titel} direction="up" delay={index * 0.05}>
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full hover:border-rio-yellow hover:shadow-md transition-all duration-300">
                                            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-rio-green/10 text-rio-green mb-4">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold font-heading text-gray-900">
                                                {p.titel}
                                            </h3>
                                            <p className="mt-2 text-gray-600 leading-relaxed">
                                                {p.text}
                                            </p>
                                        </div>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 4 : Bausteine da viagem */}
                <section id="bausteine" className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                So sieht deine WM-Reise mit uns aus
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Du sagst uns, wann du kommst und welche Spiele dich interessieren.
                                Wir bauen daraus einen Vorschlag mit Ablauf und Preis, aus diesen
                                Bausteinen:
                            </p>
                        </FadeIn>

                        <div className="max-w-[800px] mx-auto space-y-6">
                            {bausteine.map((b, index) => {
                                const Icon = b.icon;
                                return (
                                    <FadeIn key={b.titel} direction="up" delay={index * 0.05}>
                                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 hover:border-rio-yellow hover:shadow-md transition-all duration-300">
                                            <div className="inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-rio-green/10 text-rio-green">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold font-heading text-gray-900">
                                                    {b.titel}
                                                </h3>
                                                <p className="mt-2 text-gray-600 leading-relaxed">
                                                    {b.text}
                                                </p>
                                                <Link
                                                    href={b.linkHref}
                                                    className="mt-3 inline-flex items-center gap-1.5 text-rio-green font-semibold hover:underline underline-offset-2"
                                                >
                                                    {b.linkLabel}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 5 : Will */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up">
                            <div className="max-w-2xl mx-auto text-center">
                                <div className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden bg-gray-100 ring-4 ring-rio-green/10 shadow-md">
                                    <Image
                                        src="/images/wm-2027/will.webp"
                                        alt="Will, deutschsprachiger Guide für die WM 2027 in Rio de Janeiro"
                                        fill
                                        loading="lazy"
                                        className="object-cover object-top"
                                    />
                                </div>

                                <h2 className="mt-6 text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                    Dein Guide: Will, Carioca mit Kölner Jahren
                                </h2>

                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <MapPin className="w-4 h-4" />
                                        Geborener Carioca
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <GraduationCap className="w-4 h-4" />
                                        Deutsche Schule Rio
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rio-green/10 text-rio-green text-sm font-semibold">
                                        <Plane className="w-4 h-4" />
                                        4 Jahre in Köln
                                    </span>
                                </div>

                                <p className="mt-6 text-gray-600 text-lg leading-relaxed">
                                    Geboren und aufgewachsen in Rio, deutsche Schule, vier Jahre
                                    Köln: Ich kenne beide Welten und begleite dich in meiner
                                    Heimatstadt, persönlich oder mit Partner-Guides meines
                                    Vertrauens.{" "}
                                    <Link
                                        href="/ueber-will"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Mehr über mich
                                    </Link>
                                    .
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 6 : Warum früh planen */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <CalendarDays className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Warum du nicht auf die Auslosung warten solltest
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Am 11. Dezember 2026 werden in Rio die Gruppen gelost. Ab dem
                                    Moment wissen Millionen Fans, wo ihre Mannschaft spielt, und
                                    Flüge und gute Unterkünfte werden schnell teurer. Die vier
                                    großen Spiele in Rio stehen aber jetzt schon fest: Eröffnung,
                                    Viertelfinale, Halbfinale und Finale finden hier statt, egal
                                    wie gelost wird.
                                </p>
                                <p>
                                    Wer seine Reise vorher grob plant, bucht nach der Auslosung
                                    schneller und günstiger. Schreib uns einfach, wann du kommen
                                    willst, der Vorschlag ist kostenlos und unverbindlich.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 7 : FAQ */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                                Häufige Fragen zur WM-Reise nach Rio
                            </h2>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 sm:px-10 py-4">
                                <Faq items={faqItems.map((item) => ({ q: item.question, a: item.answer }))} />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 8 : Footer CTA */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Die WM kommt nach Rio. Kommst du auch?
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Erzähl mir, wann du kommst und welche Spiele dich interessieren. Du
                                bekommst einen persönlichen Vorschlag mit Ablauf und Preis,
                                kostenlos und unverbindlich.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    WM-Reise anfragen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                >
                                    Zur WM-Übersicht
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>
            </main>

            <FooterServer />
        </div>
    );
}
