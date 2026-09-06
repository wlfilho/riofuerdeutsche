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
    Flag,
    Users,
    ArrowRight,
    Compass,
    ShieldCheck,
} from "lucide-react";

// Decisão nº 8 do ledger (Obsidian, WM 2027 — Estratégia SEO e Arquitetura):
// esta é uma página de VIAGEM com casca de keyword de estádio. O title/H1 caçam
// "stadien/spielorte/austragungsort" (onde está o volume de busca), mas o
// conteúdo é cada cidade pela lente do torcedor-turista, com CTA de captura.
// Cada seção de cidade é o slot onde entra "Deutschsprachige Begleitung vor
// Ort" quando houver guia parceiro fechado naquela cidade (lista no Obsidian).
export const metadata: Metadata = {
    // "Fußball" no title pelo mesmo motivo do hub: a Handball-WM der Frauen
    // 2027 acontece na Alemanha e o Google mistura os intents.
    title: "Stadien & Spielorte der Fußball Frauen WM 2027: alle 8 Städte",
    description:
        "Die 8 Spielorte der FIFA Frauen-WM 2027 in Brasilien im Überblick: alle Stadien, welche Stadt welche Spiele bekommt und was jede Stadt Reisenden bietet. Mit Rio als Basis für Eröffnung und Finale.",
    alternates: {
        canonical: "https://riofuerdeutsche.de/frauen-wm-2027/stadien",
    },
    openGraph: {
        title: "Stadien & Spielorte der Fußball Frauen WM 2027: alle 8 Städte",
        description:
            "Alle Stadien und Städte der Frauen-WM 2027 in Brasilien, aus der Perspektive deiner Reise: Spiele, Sehenswertes und spielfreie Tage.",
        url: "https://riofuerdeutsche.de/frauen-wm-2027/stadien",
        type: "website",
        images: [{ url: "/images/wm-2027/bg-wm-2027.webp" }],
    },
};

/**
 * As 7 cidades além do Rio. Fatos de estádio: comunicado da FIFA (Bekanntgabe
 * des Spielplans). O texto de viagem é curto de propósito: o foco editorial do
 * site continua no Rio (decisão nº 6 do ledger); aqui cada cidade ganha o
 * essencial pra quem decide se vale viajar pro jogo, mais o gancho de captura.
 */
const spielorte = [
    {
        stadt: "São Paulo",
        stadion: "Arena Itaquera",
        kapazitaet: "47.252",
        slug: "itaquera",
        spiele: "Gruppenspiele (u. a. Brasilien am 29. Juni), Viertelfinale, ein Halbfinale und das Spiel um Platz 3",
        text: "São Paulo ist die größte Stadt Südamerikas und das Drehkreuz für fast alle Flüge nach Brasilien. Wer hier ein Spiel sieht, landet in einer Metropole mit Weltklasse-Gastronomie, Museen wie dem MASP an der Avenida Paulista und einem Nachtleben, das keine Sperrstunde kennt. Für reine Strandurlauber ist São Paulo nichts, für Großstadtfans ein Erlebnis.",
    },
    {
        stadt: "Brasília",
        stadion: "Estádio Nacional Mané Garrincha",
        kapazitaet: "69.910",
        slug: "mane-garrincha",
        spiele: "Gruppenspiele (u. a. Brasilien am 4. Juli) und K.-o.-Spiele bis einschließlich Achtelfinale",
        text: "Die Hauptstadt Brasiliens ist ein Gesamtkunstwerk: Oscar Niemeyers futuristische Architektur machte die Retortenstadt zum UNESCO-Welterbe. Zwischen den Spielen lassen sich Kathedrale, Kongress und Palast an einem Tag erkunden. Brasília ist ein Zwischenstopp für Architekturfans, keine Urlaubsstadt.",
    },
    {
        stadt: "Belo Horizonte",
        stadion: "Mineirão",
        kapazitaet: "66.000",
        slug: "mineirao",
        imgPos: "center bottom",
        spiele: "Gruppenspiele und ein Viertelfinale",
        text: "Belo Horizonte ist das Tor zu Minas Gerais: von hier erreichst du die kolonialen Goldgräberstädte Ouro Preto und Tiradentes, UNESCO-Welterbe mit barocken Kirchen und Kopfsteinpflaster. Die Mineira-Küche gilt vielen Brasilianern als die beste des Landes. Das Mineirão selbst ist einer der traditionsreichsten Fußballtempel Brasiliens.",
    },
    {
        stadt: "Fortaleza",
        stadion: "Arena Castelão",
        kapazitaet: "57.000",
        slug: "castelao",
        spiele: "Gruppenspiele und ein Viertelfinale",
        text: "Fortaleza liegt an der Nordostküste, mit Stadtstränden wie Praia do Futuro und Meireles und ganzjährig Sommerwetter. Von hier starten Ausflüge zu den Traumdünen von Cumbuco und, mit etwas mehr Zeit, ins legendäre Jericoacoara. Wer Spiel und Strandurlaub verbinden will, ist hier richtig.",
    },
    {
        stadt: "Porto Alegre",
        stadion: "Beira-Rio",
        kapazitaet: "50.848",
        slug: "beira-rio",
        imgPos: "center 78%",
        spiele: "Gruppenspiele und K.-o.-Spiele bis einschließlich Achtelfinale",
        text: "Porto Alegre ist die Hauptstadt des tiefen Südens, geprägt von Gaúcho-Kultur, Churrasco und deutschen und italienischen Einwanderern. In zwei Stunden bist du in der Serra Gaúcha: Weingüter um Bento Gonçalves und Städte wie Gramado, in denen mehr Deutsch gesprochen wird, als du erwartest. Im Juli ist hier Winter, pack eine Jacke ein.",
    },
    {
        stadt: "Salvador",
        stadion: "Arena Fonte Nova",
        kapazitaet: "47.915",
        slug: "fonte-nova",
        spiele: "Gruppenspiele und K.-o.-Spiele bis einschließlich Achtelfinale",
        text: "Salvador ist das Herz des afro-brasilianischen Brasiliens: das koloniale Pelourinho (UNESCO-Welterbe), Capoeira auf den Plätzen, Acarajé an jeder Ecke und eine Musikszene, die die Stadt nie schlafen lässt. Dazu kommen die Strände Bahias, von Porto da Barra bis zur Kokosküste im Norden.",
    },
    {
        stadt: "Recife",
        stadion: "Arena de Pernambuco",
        kapazitaet: "45.440",
        slug: "pernambuco",
        spiele: "Gruppenspiele und K.-o.-Spiele bis einschließlich Achtelfinale",
        text: "Recife wird das Venedig Brasiliens genannt, durchzogen von Flüssen und Brücken, mit dem Stadtstrand Boa Viagem. Gleich nebenan liegt Olinda, die vielleicht schönste Kolonialstadt des Nordostens und UNESCO-Welterbe. Eine Stunde südlich warten die Strände von Porto de Galinhas mit ihren natürlichen Pools.",
    },
];

const faqItems = [
    {
        question: "In welchen Stadien wird die Frauen WM 2027 gespielt?",
        answer:
            "In acht Stadien: Maracanã (Rio de Janeiro), Arena Itaquera (São Paulo), Estádio Nacional Mané Garrincha (Brasília), Mineirão (Belo Horizonte), Arena Castelão (Fortaleza), Beira-Rio (Porto Alegre), Arena Fonte Nova (Salvador) und Arena de Pernambuco (Recife). Alle wurden für die Männer-WM 2014 modernisiert.",
    },
    {
        question: "Welches Stadion ist das größte der WM 2027?",
        answer:
            "Das Maracanã in Rio de Janeiro mit 73.139 Plätzen. Dort finden das Eröffnungsspiel am 24. Juni und das Finale am 25. Juli 2027 statt.",
    },
    {
        question: "Welche Stadt bekommt welche K.-o.-Spiele?",
        answer:
            "Brasília, Porto Alegre, Recife und Salvador richten K.-o.-Spiele bis einschließlich Achtelfinale aus. Die Viertelfinals steigen in Belo Horizonte, Fortaleza, Rio de Janeiro und São Paulo. Die Halbfinals finden in São Paulo und im Maracanã statt, das Spiel um Platz 3 in São Paulo und das Finale im Maracanã.",
    },
    {
        question: "Welche Stadt ist die beste Basis für die WM 2027?",
        answer:
            "Für die meisten deutschen Fans: Rio de Janeiro. Hier finden Eröffnung, ein Viertelfinale, ein Halbfinale und das Finale statt, die Stadt hat die bekanntesten Sehenswürdigkeiten Brasiliens, und zwischen den Spielen gibt es mehr zu erleben als irgendwo sonst im Land.",
    },
    {
        question: "Kann ich Spiele in mehreren Städten besuchen?",
        answer:
            "Ja, Inlandsflüge verbinden alle acht Spielorte, die Distanzen sind aber groß: Rio nach Fortaleza sind über 2.000 Kilometer. Eine realistische Planung kombiniert eine Basis-Stadt mit ein bis zwei Flugreisen zu weiteren Spielen. Erzähl uns deine Spiele, wir helfen bei der Route.",
    },
    {
        question: "Bietet ihr auch Begleitung in anderen Städten als Rio an?",
        answer:
            "Unsere Basis ist Rio de Janeiro. Für Spieltage in anderen Städten prüfen wir auf Anfrage, was sich organisieren lässt, je nach Stadt auch mit deutschsprachigen Partner-Guides vor Ort. Schreib uns einfach, welche Spiele du sehen willst.",
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
                            alt="Stadien und Spielorte der FIFA Frauen-WM 2027 in Brasilien"
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
                                <span className="text-rio-yellow">Stadien & Spielorte</span>
                            </nav>

                            <div className="max-w-3xl space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                    <MapPin className="w-4 h-4 text-rio-yellow" />
                                    <span>8 Städte · 8 Stadien · 64 Spiele</span>
                                </div>

                                <h1 className="text-4xl lg:text-[clamp(32px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
                                    Die Stadien und Spielorte der Frauen WM 2027
                                </h1>

                                <p className="text-lg lg:text-xl text-rio-sand/90 leading-relaxed">
                                    Acht brasilianische Städte richten die Frauen-WM 2027 aus, und
                                    jede ist eine eigene Reise wert. Hier findest du alle Stadien,
                                    welche Stadt welche Spiele bekommt, und, weil du ja nicht nur
                                    für 90 Minuten nach Brasilien fliegst: was dich in jeder Stadt
                                    außerhalb des Stadions erwartet.
                                </p>

                                <p className="text-sm text-white/60">Stand: September 2026</p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <a
                                        href="#rio"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-rio-yellow/20"
                                    >
                                        Zu den Spielorten
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <Link
                                        href="/frauen-wm-2027/spielplan"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/20 transition-all"
                                    >
                                        Zum Spielplan
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 2 : Rio de Janeiro em destaque */}
                <section id="rio" className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-rio-yellow text-gray-900 uppercase tracking-wider mb-4">
                                <Flag className="w-3.5 h-3.5" />
                                Eröffnung + Finale
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Rio de Janeiro: das Maracanã und die Bühne des Turniers
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Kein Spielort trägt mehr Turnier als Rio: Das{" "}
                                    <Link
                                        href="/rio-guide/sehenswuerdigkeiten/maracana"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Maracanã
                                    </Link>{" "}
                                    (73.139 Plätze) richtet das Eröffnungsspiel am 24. Juni, ein
                                    Viertelfinale, ein Halbfinale und das Finale am 25. Juli 2027
                                    aus. Dazu kommt der Rest, den du von Postkarten kennst:
                                    Christusstatue, Zuckerhut, Copacabana und Ipanema.
                                </p>
                                <p>
                                    Für deutsche Fans ist Rio die logische Basis der WM-Reise: die
                                    meisten hochkarätigen Spiele, die bekanntesten
                                    Sehenswürdigkeiten Brasiliens und an spielfreien Tagen mehr
                                    Programm als irgendwo sonst, von den{" "}
                                    <Link
                                        href="/touren/klassiker"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Klassikern
                                    </Link>{" "}
                                    über{" "}
                                    <Link
                                        href="/touren/natur-und-straende"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Natur und Strände
                                    </Link>{" "}
                                    bis zu{" "}
                                    <Link
                                        href="/touren/tagesausfluege"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Tagesausflügen
                                    </Link>{" "}
                                    nach Búzios oder Ilha Grande. Und hier sind wir zuhause: dein
                                    deutschsprachiger Guide lebt in dieser Stadt. Wie deine
                                    WM-Reise nach Rio aussehen kann, zeigen wir dir auf der Seite{" "}
                                    <Link
                                        href="/frauen-wm-2027/rio-de-janeiro"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Frauen WM 2027 in Rio de Janeiro
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rio-green text-white rounded-full font-semibold hover:bg-green-700 transition-all"
                                >
                                    Tour für die WM 2027 anfragen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/rio-guide/sicherheit/ist-rio-gefaehrlich"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-semibold hover:border-rio-green hover:text-rio-green transition-all"
                                >
                                    <ShieldCheck className="w-5 h-5 text-rio-green" />
                                    Ist Rio gefährlich?
                                </Link>
                            </div>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="relative max-w-[800px] mx-auto aspect-video rounded-3xl overflow-hidden shadow-lg">
                                <Image
                                    src="/images/wm-2027/stadien/maracana.webp"
                                    alt="Maracanã in Rio de Janeiro, Stadion von Eröffnungsspiel und Finale der Frauen WM 2027"
                                    fill
                                    loading="lazy"
                                    className="object-cover"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 3 : As outras 7 cidades */}
                <section id="staedte" className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Die weiteren 7 Spielorte: von São Paulo bis Salvador
                            </h2>
                            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                                Jede Stadt bekommt mindestens sieben Spiele und mindestens ein
                                K.-o.-Spiel. Welche Teams wo spielen, entscheidet die Auslosung am
                                11. Dezember 2026. Und falls dein Spiel nicht in Rio stattfindet:
                                Erzähl uns davon, wir prüfen, was sich organisieren lässt.
                            </p>
                        </FadeIn>

                        {/* Cards em duas colunas no desktop (foto 16:9 à esquerda,
                            infos à direita) e empilhados no mobile (foto em cima).
                            aspect-video em vez de altura fixa: as fotos dos estádios
                            são 16:9 e a altura fixa as cortava. No desktop a coluna
                            de texto costuma ser mais alta que a foto — a foto centra
                            na vertical com o próprio arredondado, de propósito. */}
                        <div className="max-w-5xl mx-auto space-y-8">
                            {spielorte.map((ort, index) => (
                                <FadeIn key={ort.stadt} direction="up" delay={index * 0.05}>
                                    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-rio-yellow hover:shadow-md transition-all duration-300 grid md:grid-cols-2 md:items-center md:gap-2">
                                        <div className="md:p-6">
                                            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 md:rounded-2xl">
                                                <Image
                                                    src={`/images/wm-2027/stadien/${ort.slug}.webp`}
                                                    alt={`${ort.stadion} in ${ort.stadt}, Spielort der Frauen WM 2027`}
                                                    fill
                                                    loading="lazy"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    style={{ objectPosition: (ort as { imgPos?: string }).imgPos }}
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 sm:p-8 md:pl-2">
                                            <h3 className="text-2xl font-bold font-heading text-gray-900">
                                                {ort.stadt}
                                            </h3>
                                            <p className="mt-1 text-gray-600 font-medium">
                                                {ort.stadion} · {ort.kapazitaet} Plätze
                                            </p>
                                            <p className="mt-3 inline-flex items-start gap-1.5 text-sm font-semibold text-rio-green">
                                                <CalendarDays className="w-4 h-4 shrink-0 mt-0.5" />
                                                {ort.spiele}
                                            </p>
                                            <p className="mt-4 text-gray-600 leading-relaxed">
                                                {ort.text}
                                            </p>
                                        </div>
                                    </article>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SEÇÃO 4 : Spiele außerhalb Rios */}
                <section className="py-20 lg:py-28 bg-white">
                    <div className="max-w-7xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="max-w-[800px] mx-auto">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rio-green/10 text-rio-green mb-6">
                                <Compass className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                                Dein Spiel ist nicht in Rio? Schreib uns trotzdem
                            </h2>
                            <div className="mt-4 space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Unsere Basis ist Rio de Janeiro. Aber wir wissen, wie
                                    WM-Reisen aussehen: Gruppenspiele in einer Stadt, K.-o.-Runde
                                    in einer anderen, dazwischen ein paar Tage Strand. Erzähl uns,
                                    welche Spiele du sehen willst, und wir prüfen, was sich
                                    organisieren lässt: die Route, die Reihenfolge, und je nach
                                    Stadt auch deutschsprachige Begleitung vor Ort über
                                    Partner-Guides.
                                </p>
                                <p>
                                    Nach der Auslosung am 11. Dezember 2026 wissen wir, wo{" "}
                                    <Link
                                        href="/frauen-wm-2027/deutschland"
                                        className="underline decoration-rio-green/40 underline-offset-2 hover:text-rio-green transition-colors"
                                    >
                                        Deutschland
                                    </Link>{" "}
                                    spielt. Wer sich vorher meldet, bekommt seine Planung als
                                    Erster.
                                </p>
                            </div>
                            <div className="mt-8">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    WM-Reise anfragen
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 5 : FAQ */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-5 lg:px-8">
                        <FadeIn direction="up" className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                                Häufige Fragen zu Stadien und Spielorten
                            </h2>
                        </FadeIn>

                        <FadeIn direction="up">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 sm:px-10 py-4">
                                <Faq items={faqItems.map((item) => ({ q: item.question, a: item.answer }))} />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* SEÇÃO 6 : Footer CTA */}
                <section className="py-24 relative overflow-hidden bg-rio-green border-t-4 border-rio-yellow">
                    <div className="absolute inset-0 bg-[url('/images/rio-background.webp')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                    <div className="relative max-w-4xl mx-auto px-5 text-center">
                        <FadeIn direction="up">
                            <h2 className="text-3xl lg:text-5xl font-heading font-black text-white mb-6">
                                Rio als Basis, ganz Brasilien als Spielfeld
                            </h2>
                            <p className="text-lg text-rio-sand/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Erzähl mir, welche Spiele dich interessieren und wann du kommst. Du
                                bekommst einen persönlichen Vorschlag mit Ablauf und Preis,
                                kostenlos und unverbindlich, von einem deutschsprachigen Guide vor
                                Ort.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    href="/anfrage?von=site&thema=frauen-wm-2027"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                >
                                    Tour für die WM 2027 anfragen
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
